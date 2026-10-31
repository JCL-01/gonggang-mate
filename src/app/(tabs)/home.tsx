/**
 * S05 메인 — 담당: (미정)
 * PRD: 톱니바퀴(→S04), 내 공강시간 박스(→S06), 카테고리 박스 4개 2×2(→S07).
 */
import { ScreenPlaceholder, type PlaceholderLink } from '@/components/ScreenPlaceholder';
import { CATEGORIES, categoryInfo } from '@/constants/theme';

export default function HomeScreen() {
  const categoryLinks: PlaceholderLink[] = CATEGORIES.map((category) => ({
    label: `${categoryInfo[category].label} → S07`,
    href: { pathname: '/board/[category]', params: { category } },
  }));

  return (
    <ScreenPlaceholder
      id="S05"
      title="메인"
      description="내 공강시간 + 카테고리 4개"
      links={[
        { label: '톱니바퀴 → S04 설정', href: '/settings' },
        { label: '내 공강시간 설정 → S06', href: '/free-time' },
        ...categoryLinks,
      ]}
    />
  );
}
