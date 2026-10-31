/**timegrid
 * 공통 컴포넌트: TimeGrid (요일×시간 격자) — PRD "공통 컴포넌트: TimeGrid"
 *
 * S06 공강 설정(mode="multi")과 S08 게시물 약속시간 설정(mode="single-range")이 함께 쓴다.
 * 담당: S06 담당자. S08 담당자는 아래 Props 모양만 믿고 먼저 사용해도 된다.
 *
 * TODO
 * - 열 = 월~일(7개), 행 = DAY_START~DAY_END, 한 칸 = SLOT_MINUTES
 * - 드래그로 칠하기/지우기, 탭하면 토글, 화면 끝에서 자동 스크롤
 * - single-range: 한 요일의 연속 구간 하나만
 * - highlight: 내 공강 칸을 옅은 색으로 미리 표시
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/constants/theme";
import type { TimeString, Weekday } from "@/types/db";

/** 출력 값: 연속된 칸을 하나의 구간으로 합친 결과 */
export type TimeRange = {
  weekday: Weekday;
  start: TimeString; // 'HH:mm'
  end: TimeString; // 'HH:mm'
};

export type TimeGridProps = {
  mode: "multi" | "single-range";
  value: TimeRange[];
  onChange: (next: TimeRange[]) => void;
  /** 옅게 미리 보여 줄 구간 (S08에서 내 공강 표시용) */
  highlight?: TimeRange[];
};

export function TimeGrid({ mode, value }: TimeGridProps) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>
        TimeGrid ({mode}) 자리 · 선택된 구간 {value.length}개
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.primaryTint,
  },
  text: { color: colors.primary, textAlign: "center" },
});
