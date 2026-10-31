/**
 * S11 채팅 목록 — 담당: (미정)
 * PRD: 상단 탭(식사/카페/공부/산책), 채팅방 미리보기, 안 읽은 메시지 배지, 실시간 갱신.
 */
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';

export default function ChatsScreen() {
  return (
    <ScreenPlaceholder
      id="S11"
      title="채팅"
      description="카테고리별 채팅방 목록"
      links={[{ label: '채팅방 → S12', href: '/chat/demo-room' }]}
    />
  );
}
