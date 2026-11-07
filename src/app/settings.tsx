/**
 * S04 설정(프로필) — 담당: A (디자인팀 UI 반영)
 * - 프로필 카드: 사진(없으면 사람 아이콘), 닉네임(필수, 2~10자, 중복 불가), 한줄소개(최대 40자), 성별(필수, 디자인에 없어 카드 안에 추가)
 * - 내 메이트하트(개수 + 막대), 대표 후기(많이 받은 후기 항목 상위 3개, 11/6 결정 6번) — 기존 사용자만
 * - 차단 목록 보기·해제(PRD 8.2, 디자인에 없어 카드로 추가), 로그아웃, 저장 버튼(디자인에 없어 하단에 추가)
 * - 11/6 결정: 프로필 사진(앨범에서 고르기·삭제, '저장'을 눌러야 반영), 앱 정보(가이드·이용약관·개인정보처리방침), 회원 탈퇴
 * - 관심활동은 넣지 않는다 (11/3 결정 6번)
 * - 신규 가입자(mode=new): 회원가입 중 프로필 저장이 끊긴 경우의 예비 화면. 뒤로가기 없음, 버튼 "저장하고 시작하기"
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { api, ApiError, type MateInfo, type MiniUser } from '@/api';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FormScreen } from '@/components/FormScreen';
import { type Gender, GenderPicker } from '@/components/GenderPicker';
import { Icon, type IconName } from '@/components/Icon';
import { TopReviews } from '@/components/TopReviews';
import { TextField } from '@/components/TextField';
import { BIO_MAX_LENGTH, NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH } from '@/constants/config';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { openLegal } from '@/lib/openLegal';
import { pickProfilePhoto } from '@/lib/profilePhoto';

/** 메이트하트 막대가 가득 차는 개수 (보기용) */
const HEART_BAR_MAX = 20;

/** 가장 많이 받은 후기 항목. 받은 후기가 없으면 null */
export default function SettingsScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isNew = mode === 'new';

  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [mate, setMate] = useState<MateInfo | null>(null); // 내 하트·받은 후기
  const [saving, setSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<MiniUser[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.users.getMe();
        setNickname(me.nickname);
        // 신규 가입자는 프로필이 없어서 성별 기본값이 들어 있다. 직접 고르게 비워 둔다
        setGender(me.nickname ? me.gender : null);
        setBio(me.bio ?? '');
        setPhotoUrl(me.photo_url);
        if (!isNew && me.nickname) {
          const [blockedList, info] = await Promise.all([api.blocks.getBlockedUsers(), api.users.getMateInfo(me.id).catch(() => null)]);
          setBlocked(blockedList);
          setMate(info);
        }
      } catch (e) {
        setSubmitError(e instanceof ApiError ? e.message : '내 정보를 불러오지 못했어요');
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew]);

  const trimmed = nickname.trim();
  const nicknameInvalid = trimmed.length < NICKNAME_MIN_LENGTH || trimmed.length > NICKNAME_MAX_LENGTH;
  const canSave = !loading && !saving && !photoBusy && !nicknameInvalid && gender !== null;

  const onSave = async () => {
    if (!canSave || !gender) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await api.users.updateMe({ nickname: trimmed, gender, bio: bio.trim() || null, photo_url: photoUrl });
      if (isNew || !router.canGoBack()) router.replace('/home');
      else router.back();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : '프로필을 저장하지 못했어요';
      if (e instanceof ApiError && (e.code === 'already_exists' || msg.includes('닉네임'))) setNicknameError(msg);
      else setSubmitError(msg);
    } finally {
      setSaving(false);
    }
  };

  const onUnblock = (user: MiniUser) => {
    Alert.alert(`${user.nickname}님 차단을 해제할까요?`, undefined, [
      { text: '취소', style: 'cancel' },
      {
        text: '해제',
        onPress: async () => {
          try {
            await api.blocks.unblockUser(user.id);
            setBlocked((list) => list.filter((u) => u.id !== user.id));
          } catch (e) {
            Alert.alert(e instanceof ApiError ? e.message : '차단을 해제하지 못했어요');
          }
        },
      },
    ]);
  };

  // 프로필 사진: 앨범에서 골라 바로 올리고, '저장'을 누르면 프로필에 반영된다
  const onPhoto = () => {
    const choose = async () => {
      try {
        const localUri = await pickProfilePhoto();
        if (!localUri) return;
        setPhotoBusy(true);
        setPhotoUrl(await api.users.uploadProfilePhoto(localUri));
        setPhotoChanged(true);
      } catch (e) {
        Alert.alert(e instanceof ApiError ? e.message : '사진을 올리지 못했어요');
      } finally {
        setPhotoBusy(false);
      }
    };
    if (!photoUrl) {
      choose();
      return;
    }
    Alert.alert('프로필 사진', undefined, [
      { text: '앨범에서 선택', onPress: choose },
      {
        text: '사진 삭제',
        style: 'destructive',
        onPress: () => {
          setPhotoUrl(null);
          setPhotoChanged(true);
        },
      },
      { text: '취소', style: 'cancel' },
    ]);
  };

  // 회원 탈퇴 (11/6 결정 7번): 되돌릴 수 없어서 무엇이 지워지고 남는지 알려 준 뒤 한 번 더 묻는다
  const onDeleteAccount = () => {
    Alert.alert(
      '정말 탈퇴할까요?',
      '프로필, 공강 시간, 게시글, 약속이 지워지고 되돌릴 수 없어요.\n방장인 채팅방은 다음 메이트에게 넘어가고, 보낸 메시지는 "탈퇴한 사용자"로 남아요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.users.deleteAccount();
              Alert.alert('탈퇴했어요', '그동안 공강메이트를 이용해 주셔서 고마워요.');
              router.replace('/login');
            } catch (e) {
              Alert.alert(e instanceof ApiError ? e.message : '탈퇴 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const onLogout = () => {
    Alert.alert('로그아웃할까요?', undefined, [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.auth.logOut();
            router.replace('/login');
          } catch (e) {
            Alert.alert(e instanceof ApiError ? e.message : '로그아웃하지 못했어요');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} accessibilityLabel="불러오는 중" />
      </View>
    );
  }

  const hearts = mate?.heart_count ?? 0;

  return (
    <FormScreen
      title={isNew ? '프로필 설정' : '설정'}
      subtitle={isNew ? '메이트에게 보여 줄 프로필을 만들어 주세요' : undefined}
      onBack={isNew ? undefined : () => router.back()}
      footer={
        <>
          {submitError ? <Text style={styles.error}>{submitError}</Text> : null}
          <Button label={saving ? '저장 중…' : isNew ? '저장하고 시작하기' : '저장'} onPress={onSave} disabled={!canSave} />
        </>
      }
    >
      {/* 프로필 카드 */}
      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={photoUrl ? '프로필 사진 바꾸기' : '프로필 사진 등록'}
          onPress={onPhoto}
          disabled={photoBusy}
          style={styles.avatar}
        >
          <Avatar nickname={trimmed || '?'} photoUrl={photoUrl} size={80} />
          <View style={styles.photoBadge}>
            {photoBusy ? <ActivityIndicator size="small" color={colors.white} /> : <Icon name="camera" size={14} color={colors.white} />}
          </View>
        </Pressable>
        {photoChanged ? <Text style={styles.photoHint}>아래 저장 버튼을 눌러야 사진이 반영돼요</Text> : null}
        <TextField
          label="닉네임"
          inlineLabel
          value={nickname}
          onChangeText={(t) => {
            setNickname(t);
            setNicknameError(null);
          }}
          placeholder={`${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자`}
          maxLength={NICKNAME_MAX_LENGTH}
          autoCorrect={false}
          error={
            nicknameError ??
            (nickname.length > 0 && trimmed.length < NICKNAME_MIN_LENGTH ? `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상이어야 해요` : null)
          }
        />
        <TextField label="한줄소개" inlineLabel value={bio} onChangeText={setBio} placeholder="간단한 자기소개" maxLength={BIO_MAX_LENGTH} />
        <GenderPicker value={gender} onChange={setGender} />
      </View>

      {!isNew ? (
        <>
          {/* 내 메이트하트 */}
          <View style={styles.card}>
            <View style={styles.heartRow}>
              <Text style={styles.cardTitle}>내 메이트하트</Text>
              <View style={styles.heartCount} accessibilityLabel={`메이트하트 ${hearts}개`}>
                <Icon name="heart" size={20} color={colors.alert} />
                <Text style={styles.heartText}>{String(hearts).padStart(2, '0')}개</Text>
              </View>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${Math.min(1, hearts / HEART_BAR_MAX) * 100}%` }]} />
            </View>
          </View>

          {/* 대표 후기 */}
          <Text style={styles.sectionTitle}>대표 후기</Text>
          <View style={styles.card}>
            <TopReviews counts={mate?.review_counts} emptyText="아직 등록된 대표 후기가 없어요" />
          </View>

          {/* 차단 목록 (디자인에 없어 같은 카드 형식으로 추가) */}
          <Text style={styles.sectionTitle}>차단 목록</Text>
          <View style={styles.card}>
            {blocked.length === 0 ? (
              <Text style={styles.muted}>차단한 사용자가 없어요</Text>
            ) : (
              blocked.map((u) => (
                <View key={u.id} style={styles.blockRow}>
                  <Avatar nickname={u.nickname} photoUrl={u.photo_url} size={36} />
                  <Text style={styles.blockName}>{u.nickname}</Text>
                  <Button label="해제" variant="secondary" size="sm" onPress={() => onUnblock(u)} />
                </View>
              ))
            )}
          </View>

          {/* 앱 정보 (11/6 결정 10번: 가이드 다시 보기) */}
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={[styles.card, styles.menuCard]}>
            <MenuRow icon="book-open" label="앱 사용 가이드 다시 보기" onPress={() => router.push({ pathname: '/guide', params: { replay: '1' } })} />
            <MenuRow icon="file-text" label="이용약관" onPress={() => openLegal('terms')} />
            <MenuRow icon="shield" label="개인정보처리방침" onPress={() => openLegal('privacy')} />
          </View>

          <Pressable accessibilityRole="button" onPress={onLogout} style={styles.logout} hitSlop={8}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onDeleteAccount} disabled={deleting} style={styles.withdraw} hitSlop={8}>
            <Text style={styles.withdrawText}>{deleting ? '탈퇴 처리 중…' : '회원 탈퇴'}</Text>
          </Pressable>
        </>
      ) : null}
    </FormScreen>
  );
}

/** 앱 정보 카드의 한 줄 (아이콘 + 글자 + 오른쪽 화살표) */
function MenuRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
      <Icon name={icon} size={18} color={colors.primary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron-right" size={18} color={colors.sub} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  card: {
    gap: spacing.md - 4,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  avatar: { alignSelf: 'center', marginBottom: spacing.xs },
  photoBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: { color: colors.primaryBright, fontSize: fontSize.caption, textAlign: 'center', marginTop: -spacing.xs },
  cardTitle: { color: colors.ink, fontSize: fontSize.body + 1, fontWeight: '800' },
  sectionTitle: { color: colors.ink, fontSize: fontSize.body + 1, fontWeight: '800', marginBottom: -spacing.xs },
  heartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heartCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartText: { color: colors.alert, fontSize: fontSize.body + 1, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bar: { height: 8, borderRadius: radius.pill, backgroundColor: colors.primaryTint, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  muted: { flex: 1, color: colors.sub, fontSize: fontSize.body - 1 },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  blockName: { flex: 1, color: colors.ink, fontSize: fontSize.body },
  menuCard: { gap: 0, paddingVertical: spacing.xs },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, minHeight: 48 },
  menuLabel: { flex: 1, color: colors.ink, fontSize: fontSize.body, fontWeight: '600' },
  pressed: { opacity: 0.6 },
  logout: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  withdraw: { alignSelf: 'flex-start', paddingVertical: spacing.xs, marginTop: -spacing.sm },
  withdrawText: { color: colors.sub, fontSize: fontSize.caption + 1 },
  logoutText: { color: colors.sub, fontSize: fontSize.body - 1, textDecorationLine: 'underline' },
  error: { color: colors.danger, fontSize: fontSize.caption + 1, textAlign: 'center' },
});
