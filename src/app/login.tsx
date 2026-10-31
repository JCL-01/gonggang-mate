/**
 * S02 로그인 — 담당: (미정)
 * PRD: 학교 이메일(=아이디) + 비밀번호. 실패 시 "이메일 또는 비밀번호를 확인해 주세요".
 */
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';

export default function LoginScreen() {
  return (
    <ScreenPlaceholder
      id="S02"
      title="로그인"
      description="학교 이메일과 비밀번호로 로그인"
      links={[
        { label: '로그인 → S05 메인', href: '/home', replace: true },
        { label: '회원가입 → S03', href: '/signup' },
      ]}
    />
  );
}
