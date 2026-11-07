/**
 * 내 프로필, 메이트 정보 (S04 설정, S05 메인, S13 메이트 정보)
 *
 * users 테이블 행은 S04에서 처음 저장할 때 생긴다. 그 전에는 getMe가 nickname ''인 빈 프로필을 돌려준다.
 * 이메일은 DB 권한상 아무도 읽을 수 없어서, 내 이메일은 로그인 세션에서 가져온다.
 *
 * 프로필 사진(11/6 결정 1번): Storage 버킷 avatars의 {내 id}/{시각}.jpg. uploadProfilePhoto로 올리고 공개 주소를 받아
 * updateMe의 photo_url로 저장한다. 저장하면 내 폴더의 다른(예전) 사진 파일은 지운다.
 * 회원 탈퇴(11/6 결정 7번): Edge Function delete-account (서버가 방장 넘기기·메시지 탈퇴 표시·사진 삭제·계정 삭제)
 */
import { FunctionsHttpError } from '@supabase/supabase-js';

import * as mock from '@/api/mock/users';
import { requireAuthUser, sb, toApiError, USE_MOCK_API } from '@/api/supabaseHelpers';
import { ApiError, type MateInfo, type Me, type ProfileInput } from '@/api/types';
import { BIO_MAX_LENGTH, NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH } from '@/constants/config';
import { readFileBytes } from '@/lib/readFileBytes';

const AVATAR_BUCKET = 'avatars';

const PROFILE_COLUMNS = 'id, school_id, nickname, gender, bio, photo_url, heart_count, created_at';

/** S04, S05: 내 정보 */
export async function getMe(): Promise<Me> {
  if (USE_MOCK_API) return mock.getMe();
  const user = await requireAuthUser();
  const { data, error } = await sb().from('users').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle();
  if (error) throw toApiError(error, '내 정보를 불러오지 못했어요');
  const email = user.email ?? '';
  if (!data) {
    // 아직 S04에서 프로필을 저장하지 않음
    return { id: user.id, school_id: '', email, nickname: '', gender: 'female', bio: null, photo_url: null, heart_count: 0, created_at: user.created_at };
  }
  return { ...(data as Omit<Me, 'email'>), email };
}

/** S04: 프로필 저장. 닉네임 2~10자·중복 불가, 성별 필수, 한줄소개 최대 40자 */
export async function updateMe(input: ProfileInput): Promise<Me> {
  if (USE_MOCK_API) return mock.updateMe(input);
  const user = await requireAuthUser();
  const nickname = input.nickname.trim();
  if (nickname.length < NICKNAME_MIN_LENGTH || nickname.length > NICKNAME_MAX_LENGTH) {
    throw new ApiError(`닉네임은 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자로 입력해 주세요`, 'invalid_input');
  }
  if (input.bio && input.bio.length > BIO_MAX_LENGTH) throw new ApiError(`한줄소개는 ${BIO_MAX_LENGTH}자까지 쓸 수 있어요`, 'invalid_input');

  const profile = {
    nickname,
    gender: input.gender,
    bio: input.bio?.trim() || null,
    photo_url: input.photo_url?.startsWith('http') ? input.photo_url : null,
  };
  const existing = await sb().from('users').select('id').eq('id', user.id).maybeSingle();
  if (existing.error) throw toApiError(existing.error, '프로필을 저장하지 못했어요');
  // 처음 저장이면 행을 만들고(id·이메일·학교는 DB가 채움), 아니면 고친다
  const { error } = existing.data
    ? await sb().from('users').update(profile).eq('id', user.id)
    : await sb().from('users').insert(profile);
  if (error) {
    if (error.code === '23505') throw new ApiError('이미 사용 중인 닉네임이에요', 'already_exists');
    throw toApiError(error, '프로필을 저장하지 못했어요');
  }
  await removeOldPhotos(user.id, profile.photo_url);
  return getMe();
}

/** 내 폴더에서 지금 프로필 사진이 아닌 파일을 지운다. 실패해도 프로필 저장은 성공으로 둔다 (탈퇴 때 폴더째 지워짐) */
async function removeOldPhotos(userId: string, currentUrl: string | null) {
  try {
    const { data: files } = await sb().storage.from(AVATAR_BUCKET).list(userId, { limit: 100 });
    const old = (files ?? []).map((f) => `${userId}/${f.name}`).filter((path) => !currentUrl?.endsWith(`/${path}`));
    if (old.length > 0) await sb().storage.from(AVATAR_BUCKET).remove(old);
  } catch (e) {
    if (__DEV__) console.warn('[removeOldPhotos]', e);
  }
}

/**
 * S04: 프로필 사진 올리기. lib/profilePhoto의 pickProfilePhoto로 고른 로컬 JPEG를 받아 공개 주소를 돌려준다.
 * 아직 프로필에 저장하지 않는다 → updateMe({ photo_url })로 저장
 */
export async function uploadProfilePhoto(localUri: string): Promise<string> {
  if (USE_MOCK_API) return mock.uploadProfilePhoto(localUri);
  const user = await requireAuthUser();
  const path = `${user.id}/${Date.now()}.jpg`;
  let bytes: ArrayBuffer;
  try {
    bytes = await readFileBytes(localUri);
  } catch {
    throw new ApiError('사진을 읽지 못했어요. 다른 사진을 골라 주세요', 'invalid_input');
  }
  const { error } = await sb().storage.from(AVATAR_BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
  if (error) {
    if (/size|too large|exceed/i.test(error.message)) throw new ApiError('사진이 너무 커요. 다른 사진을 골라 주세요', 'invalid_input');
    throw toApiError(error, '사진을 올리지 못했어요');
  }
  return sb().storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** S03 가입: 이용약관·개인정보처리방침 동의 시각 저장 (프로필 행이 생긴 뒤 부른다). 본인도 다시 읽을 수는 없다 */
export async function agreeTerms(): Promise<void> {
  if (USE_MOCK_API) return mock.agreeTerms();
  const user = await requireAuthUser();
  const { error } = await sb().from('users').update({ terms_agreed_at: new Date().toISOString() }).eq('id', user.id);
  if (error) throw toApiError(error, '약관 동의를 저장하지 못했어요');
}

/**
 * S04 '회원 탈퇴'. 성공하면 이 기기의 로그인도 지운다 → 화면은 로그인(S02)으로 보낸다.
 * 서버(delete-account): 내 메시지를 '탈퇴한 사용자'로 표시 → 모든 방에서 나가기(방장이면 넘기기) → 사진 삭제 → 계정 삭제
 */
export async function deleteAccount(): Promise<void> {
  if (USE_MOCK_API) return mock.deleteAccount();
  await requireAuthUser();
  const { error } = await sb().functions.invoke('delete-account', { method: 'POST' });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = (await error.context.json().catch(() => null)) as { error?: string; code?: ApiError['code'] } | null;
      if (body?.error) throw new ApiError(body.error, body.code ?? 'not_allowed');
    }
    throw toApiError(error, '탈퇴 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요');
  }
  // 서버에서 계정이 지워져 서버 로그아웃은 실패할 수 있다 → 이 기기 세션만 지운다
  await sb().auth.signOut({ scope: 'local' }).catch(() => {});
}

/** S13: 메이트 정보 (하트 수, 후기 항목별 합계, 만남 횟수). 누가 남겼는지는 서버에서 숨긴다 */
export async function getMateInfo(userId: string): Promise<MateInfo> {
  if (USE_MOCK_API) return mock.getMateInfo(userId);
  const { data, error } = await sb().rpc('get_mate_info', { p_user_id: userId });
  if (error) throw toApiError(error, '메이트 정보를 불러오지 못했어요');
  return data as MateInfo;
}

/** S03 '중복 확인': 닉네임을 쓸 수 있는지. 형식(2~10자) 검사는 화면에서 먼저 한다 */
export async function isNicknameAvailable(nickname: string): Promise<boolean> {
  if (USE_MOCK_API) return mock.isNicknameAvailable(nickname);
  const { data: session } = await sb().auth.getSession();
  let query = sb().from('users').select('id').eq('nickname', nickname.trim()).limit(1);
  if (session.session?.user.id) query = query.neq('id', session.session.user.id);
  const { data, error } = await query;
  if (error) throw toApiError(error, '닉네임을 확인하지 못했어요');
  return (data ?? []).length === 0;
}

/**
 * 현재 활동 여부 신호 (11/3 결정). 앱이 켜져 있는 동안 ACTIVE_PING_MINUTES마다 부른다 (src/app/_layout.tsx).
 * 최근 15분 안에 신호가 있으면 다른 사람에게 '활동 중'으로 보인다. 로그인 전이거나 실패해도 조용히 넘어간다
 */
export async function touchActive(): Promise<void> {
  if (USE_MOCK_API) return mock.touchActive();
  const { data } = await sb().auth.getSession();
  if (!data.session) return;
  await sb().rpc('touch_active');
}
