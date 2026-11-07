/** 가짜 신고 (api/reports.ts의 USE_MOCK_API 모드). Supabase 연결 후 지운다. */
import { requireMeId } from '@/api/mock/helpers';
import { delay } from '@/api/mock/store';
import { ApiError, type ReportInput } from '@/api/types';

const reported = new Set<string>();

export async function report(input: ReportInput): Promise<void> {
  await delay();
  const meId = requireMeId();
  const key = [meId, input.target_type, input.target_type === 'user' ? '' : input.target_id, input.target_user_id ?? ''].join(':');
  if (reported.has(key)) throw new ApiError('이미 신고했어요', 'already_exists');
  reported.add(key);
}
