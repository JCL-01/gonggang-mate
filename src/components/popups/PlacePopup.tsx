/**
 * S10 핀포인트 팝업 — 혼자 지도(S09)에서 핀을 누르면 뜬다.
 * TODO: 상호명, 카테고리 칩, 주소, '네이버 지도에서 보기' 버튼
 */
import { Text } from 'react-native';

import { Button } from '@/components/Button';
import { BottomSheet } from '@/components/popups/BottomSheet';
import type { Place } from '@/types/db';

type Props = {
  place: Place | null;
  onClose: () => void;
};

export function PlacePopup({ place, onClose }: Props) {
  return (
    <BottomSheet visible={place !== null} onClose={onClose} title="S10 핀포인트 팝업">
      <Text>{place ? `${place.name} · ${place.address}` : ''}</Text>
      <Button label="닫기" variant="secondary" onPress={onClose} />
    </BottomSheet>
  );
}
