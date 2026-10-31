/**
 * S08 게시물 작성 — 담당: (미정)
 * PRD: 제목(최대 30자), 약속시간(TimeGrid mode="single-range"), 내용(최대 500자), 사진(최대 5장).
 * '게시' 시 게시물과 채팅방이 함께 생성되고 작성자가 방장이 된다.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/Button';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { TimeGrid, type TimeRange } from '@/components/TimeGrid';

export default function NewPostScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [range, setRange] = useState<TimeRange[]>([]);

  return (
    <ScreenPlaceholder id="S08" title="게시물 작성" description={`카테고리: ${category ?? '-'}`}>
      <TimeGrid mode="single-range" value={range} onChange={setRange} />
      <Button label="게시 → S07" onPress={() => router.back()} />
    </ScreenPlaceholder>
  );
}
