/**
 * S07 카테고리 게시판 (식사/카페/공부/산책) — 담당: (미정)
 * 카테고리 4개가 이 파일 하나를 같이 쓴다. 주소의 [category] 값만 다르다.
 * PRD: "내 공강시간과 겹치는 게시물만 보여요". 노출 규칙은 PRD 7.1 (isPostVisibleTo).
 * 10/31 회의: 약속시간 전체가 아니라 30분(MIN_OVERLAP_MINUTES) 이상 겹치면 노출.
 * 모집 마감된 방의 게시물은 목록에서 뺀다.
 */
import { useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { categoryInfo, type Category } from '@/constants/theme';

export default function BoardScreen() {
  const { category } = useLocalSearchParams<{ category: Category }>();
  const label = categoryInfo[category]?.label ?? category;

  return (
    <ScreenPlaceholder
      id="S07"
      title={`${label} 게시판`}
      description="내 공강시간과 겹치는 게시물만 보여요"
      links={[
        { label: '게시물 작성 → S08', href: { pathname: '/post/new', params: { category } } },
        { label: '채팅 보내기(쪽지) → 입장 요청 → 방장 수락 후 S12', href: '/chat/demo-room' },
      ]}
    />
  );
}
