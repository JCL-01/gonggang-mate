/**
 * S06 공강 설정 — 담당: (미정)
 * PRD: TimeGrid(mode="multi")로 매주 반복되는 공강을 칠한다. 한 칸 = 30분.
 * '설정 완료' 시 저장 후 S05. 저장 안 하고 뒤로 가면 확인 창.
 */
import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { TimeGrid, type TimeRange } from '@/components/TimeGrid';

export default function FreeTimeScreen() {
  const [slots, setSlots] = useState<TimeRange[]>([]);

  return (
    <ScreenPlaceholder id="S06" title="공강 설정" description="요일×시간 격자를 드래그해서 공강을 칠해요">
      <TimeGrid mode="multi" value={slots} onChange={setSlots} />
      <Button label="설정 완료 → S05" onPress={() => router.back()} />
    </ScreenPlaceholder>
  );
}
