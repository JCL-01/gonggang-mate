/**
 * S03 회원가입 — 담당: (미정)
 * PRD: 학교 이메일 + '인증' 버튼, 비밀번호(8자 이상), 비밀번호 확인.
 * 허용 도메인은 config.ts의 ALLOWED_EMAIL_DOMAINS. 가입 완료 시 자동 로그인 후 S04.
 */
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';

export default function SignupScreen() {
  return (
    <ScreenPlaceholder
      id="S03"
      title="회원가입"
      description="학교 이메일 인증 후 가입"
      links={[{ label: '가입 완료 → S04 설정', href: { pathname: '/settings', params: { mode: 'new' } }, replace: true }]}
    />
  );
}
