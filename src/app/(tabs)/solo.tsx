/**
 * S09 혼자 — 담당: (미정)
 * PRD: 카테고리 2개(식사/카페), 네이버 지도에 장소 핀 표시, 핀 탭 → S10 팝업.
 * 장소 데이터는 운영자가 등록한 places 테이블(기본값).
 */
import { useState } from 'react';

import { Button } from '@/components/Button';
import { PlacePopup } from '@/components/popups/PlacePopup';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import type { Place } from '@/types/db';

const DEMO_PLACE: Place = {
  id: 'demo',
  category: 'meal',
  name: '예시 덮밥집',
  address: '정문 앞',
  lat: 0,
  lng: 0,
  naver_map_url: '',
  is_active: true,
};

export default function SoloScreen() {
  const [selected, setSelected] = useState<Place | null>(null);

  return (
    <ScreenPlaceholder id="S09" title="혼자" description="식사 / 카페 · 학교 주변 장소 지도">
      <Button label="지도 핀 → S10 팝업" variant="secondary" onPress={() => setSelected(DEMO_PLACE)} />
      <PlacePopup place={selected} onClose={() => setSelected(null)} />
    </ScreenPlaceholder>
  );
}
