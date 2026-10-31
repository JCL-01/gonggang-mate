/**
 * S13 메이트 정보 팝업 — 채팅방(S12)에서 프로필 사진을 누르면 뜬다.
 * TODO: 사진, 닉네임, 성별, 한줄소개, 메이트 하트 수, 후기 5문항별 받은 횟수
 */
import { Text } from 'react-native';

import { Button } from '@/components/Button';
import { BottomSheet } from '@/components/popups/BottomSheet';

type Props = {
  userId: string | null;
  onClose: () => void;
};

export function MateInfoPopup({ userId, onClose }: Props) {
  return (
    <BottomSheet visible={userId !== null} onClose={onClose} title="S13 메이트 정보">
      <Text>사용자 ID: {userId}</Text>
      <Button label="닫기" variant="secondary" onPress={onClose} />
    </BottomSheet>
  );
}
