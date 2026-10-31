/**
 * S15 약속카드 — 담당: (미정)
 * PRD: 다가오는 약속('약속 취소' 버튼, 확인 팝업) / 지난 약속('후기작성' → S17).
 * 만남 30분 전 알림, 탭 숫자 배지.
 */
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';

export default function AppointmentsScreen() {
  return (
    <ScreenPlaceholder
      id="S15"
      title="약속카드"
      description="다가오는 약속 / 지난 약속"
      links={[
        { label: '채팅방 가기 → S12', href: '/chat/demo-room' },
        { label: '후기작성 → S17', href: '/review/demo-appointment' },
      ]}
    />
  );
}
