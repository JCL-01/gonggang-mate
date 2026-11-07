/**
 * 신고 (11/6 결정 8번) — 메시지·게시글·사용자(프로필 사진 포함)
 * - 운영팀이 Supabase 대시보드에서 확인하고 조치한다. 앱은 넣기만 한다 (reports는 읽기 권한이 없어서 .select()를 붙이면 실패)
 * - 같은 대상을 다시 신고하면 서버가 '이미 신고했어요'(already_exists)
 */
import * as mock from '@/api/mock/reports';
import { requireAuthUser, sb, toApiError, USE_MOCK_API } from '@/api/supabaseHelpers';
import { ApiError, type ReportInput, type ReportReason } from '@/api/types';

export const REPORT_DETAIL_MAX = 500;

/** 신고 사유 (화면 표시 순서) */
export const REPORT_REASONS: { key: ReportReason; label: string }[] = [
  { key: 'abuse', label: '욕설·비하·괴롭힘' },
  { key: 'sexual', label: '성희롱·불쾌한 성적 내용' },
  { key: 'spam', label: '광고·홍보·도배' },
  { key: 'fake', label: '사칭·거짓 정보' },
  { key: 'etc', label: '기타' },
];

export async function report(input: ReportInput): Promise<void> {
  const detail = input.detail?.trim() || null;
  if (detail && detail.length > REPORT_DETAIL_MAX) throw new ApiError(`설명은 ${REPORT_DETAIL_MAX}자까지 쓸 수 있어요`, 'invalid_input');
  if (USE_MOCK_API) return mock.report({ ...input, detail: detail ?? undefined });
  await requireAuthUser();
  const { error } = await sb()
    .from('reports')
    .insert({
      target_type: input.target_type,
      target_id: input.target_type === 'user' ? null : input.target_id,
      target_user_id: input.target_user_id,
      reason: input.reason,
      detail,
    });
  if (error) throw toApiError(error, '신고하지 못했어요');
}
