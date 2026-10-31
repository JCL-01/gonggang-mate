/**
 * S04 설정(프로필) — 담당: (미정)
 * PRD: 프로필 사진, 닉네임(필수, 2~10자, 중복 불가), 성별(필수), 한줄소개(최대 40자).
 * - 신규 가입자(mode=new): 뒤로가기 없음, 버튼 "저장하고 시작하기"
 * - 기존 사용자(S05 톱니바퀴): 뒤로가기 있음, 버튼 "저장"
 */
import { useLocalSearchParams } from 'expo-router';

import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';

export default function SettingsScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isNew = mode === 'new';

  return (
    <ScreenPlaceholder
      id="S04"
      title="설정(프로필)"
      description={isNew ? '신규 가입자 프로필 설정' : '프로필 수정'}
      links={[{ label: isNew ? '저장하고 시작하기 → S05' : '저장 → S05', href: '/home', replace: true }]}
    />
  );
}
