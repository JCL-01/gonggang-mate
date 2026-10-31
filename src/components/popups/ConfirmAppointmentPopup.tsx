/**
 * S14 약속 확정 팝업 — 채팅방(S12)에서 방장이 '약속 확정'을 누르면 뜬다.
 * TODO: 시간·장소·활동·참여 메이트 입력, 장소가 비면 '확정' 비활성
 */
import { Text } from 'react-native';

import { Button } from '@/components/Button';
import { BottomSheet } from '@/components/popups/BottomSheet';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmAppointmentPopup({ visible, onClose, onConfirm }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="S14 약속 확정">
      <Text>확정하면 채팅방의 모든 메이트에게 약속카드가 전송되고, 만남 30분 전에 알림이 가요.</Text>
      <Button label="확정" onPress={onConfirm} />
      <Button label="수정" variant="secondary" onPress={onClose} />
    </BottomSheet>
  );
}
