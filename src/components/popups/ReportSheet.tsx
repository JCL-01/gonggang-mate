/**
 * 신고하기 (11/6 결정 8번) — 아래에서 올라오는 창. 사유 1개(필수) + 설명(선택) → api.reports.report
 * 쓰는 곳: 채팅 메시지 길게 누르기(메시지), 채팅방 메뉴(게시글), 메이트 정보(사용자·프로필 사진)
 * 운영팀이 확인 후 조치한다. 같은 대상을 다시 신고하면 '이미 신고했어요'
 * 다른 Modal(메이트 정보 등) 위에서 쓸 때는 그 Modal 안에 넣는다 (iOS에서 Modal 두 개를 따로 띄우면 안 보인다)
 */
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { api, ApiError, type ReportInput, type ReportReason } from '@/api';
import { REPORT_DETAIL_MAX, REPORT_REASONS } from '@/api/reports';
import { Button } from '@/components/Button';
import { BottomSheet } from '@/components/popups/BottomSheet';
import { colors, fontSize, radius, spacing } from '@/constants/theme';

/** 신고 대상 (사유·설명은 이 창에서 고른다) */
export type ReportTarget =
  | Omit<Extract<ReportInput, { target_type: 'message' }>, 'reason' | 'detail'>
  | Omit<Extract<ReportInput, { target_type: 'post' }>, 'reason' | 'detail'>
  | Omit<Extract<ReportInput, { target_type: 'user' }>, 'reason' | 'detail'>;

const TITLES: Record<ReportTarget['target_type'], string> = {
  message: '메시지 신고',
  post: '게시글 신고',
  user: '사용자 신고',
};

type Props = {
  /** null이면 닫혀 있다 */
  target: ReportTarget | null;
  onClose: () => void;
};

export function ReportSheet({ target, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (busy) return;
    setReason(null);
    setDetail('');
    onClose();
  };

  const onSubmit = async () => {
    if (!target || !reason) return;
    setBusy(true);
    try {
      await api.reports.report({ ...target, reason, detail: detail.trim() || undefined } as ReportInput);
      setBusy(false);
      close();
      Alert.alert('신고했어요', '운영팀이 확인하고 조치할게요. 원치 않는 상대는 메이트 정보에서 차단할 수도 있어요.');
    } catch (e) {
      setBusy(false);
      Alert.alert(e instanceof ApiError ? e.message : '신고하지 못했어요');
    }
  };

  return (
    <BottomSheet visible={target !== null} onClose={close} title={target ? TITLES[target.target_type] : undefined}>
      <Text style={styles.guide}>신고 이유를 골라 주세요. 신고한 사실은 상대에게 알리지 않아요.</Text>
      <View style={styles.reasons} accessibilityRole="radiogroup">
        {REPORT_REASONS.map(({ key, label }) => {
          const on = reason === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setReason(key)}
              style={[styles.reason, on && styles.reasonOn]}
            >
              <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
              <Text style={[styles.reasonText, on && styles.reasonTextOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <TextInput
        value={detail}
        onChangeText={setDetail}
        maxLength={REPORT_DETAIL_MAX}
        multiline
        placeholder="자세한 상황을 적어 주시면 확인에 도움이 돼요 (선택)"
        placeholderTextColor={colors.sub}
        accessibilityLabel="신고 설명 (선택)"
        style={styles.detail}
      />
      <Button label={busy ? '신고하는 중…' : '신고하기'} variant="danger" onPress={onSubmit} disabled={!reason || busy} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  guide: { color: colors.sub, fontSize: fontSize.caption + 1 },
  reasons: { gap: 6 },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  reasonOn: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  reasonText: { color: colors.ink, fontSize: fontSize.body - 1 },
  reasonTextOn: { color: colors.primary, fontWeight: '800' },
  detail: {
    minHeight: 72,
    maxHeight: 120,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    color: colors.ink,
    fontSize: fontSize.body - 1,
    textAlignVertical: 'top',
  },
});
