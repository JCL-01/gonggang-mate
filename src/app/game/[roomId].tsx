/**
 * S16 게임 — 담당: (미정)
 * PRD: 5종(사다리 타기, 당첨자 추첨, 순서 정하기, 돌림판, 팀 나누기).
 * 무작위 결과는 서버가 정하고, '결과 채팅방에 공유하기' 시 game_result 메시지로 올라간다.
 */
import { router, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/Button';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';

export default function GameScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  return (
    <ScreenPlaceholder id="S16" title="게임" description={`사다리 타기 · 당첨자 추첨 · 순서 정하기 · 돌림판 · 팀 나누기 (방 ${roomId})`}>
      <Button label="결과 채팅방에 공유하기 → S12" onPress={() => router.back()} />
    </ScreenPlaceholder>
  );
}
