# 약관·처리방침·계정 삭제 안내 (공개 페이지)

이 폴더의 문서 3개는 **GitHub Pages로 공개**된다. master에 이 폴더가 바뀌어 올라가면 `.github/workflows/legal-pages.yml`이 HTML로 바꿔 자동 배포한다.

| 문서 | 공개 주소 | 쓰는 곳 |
|---|---|---|
| `privacy-policy.md` | https://jcl-01.github.io/gonggang-mate/privacy.html | 앱 설정·가입 화면 (`config.ts` `PRIVACY_POLICY_URL`), Play Console 개인정보처리방침 |
| `terms.md` | https://jcl-01.github.io/gonggang-mate/terms.html | 앱 설정·가입 화면 (`config.ts` `TERMS_URL`) |
| `account-deletion.md` | https://jcl-01.github.io/gonggang-mate/account-deletion.html | Play Console 데이터 보안 → 계정 삭제 URL |

## 값 채우기
문서 안의 `{{이름}}`은 `values.json`의 값으로 바뀐다. **값이 하나라도 비어 있으면 빌드가 실패해서 공개되지 않는다.**

| 값 | 뜻 |
|---|---|
| `CONTACT_EMAIL` | 운영팀 공개 이메일 (문의·탈퇴 요청 받는 곳. Play 스토어 연락처와 같게) |
| `PRIVACY_OFFICER` | 개인정보 보호책임자 (예: `홍길동 (공강메이트 운영팀 대표)`) |
| `EFFECTIVE_DATE` | 시행일 (처음 공개하는 날). 내용을 바꾸면 새 시행일로 |
| `REPORT_RETENTION` | 신고 기록 보관 기간 |
| `DELETION_DAYS` | 이메일 탈퇴 요청 처리 기한 |
| `SITE_URL` | 공개 주소 앞부분 (문서끼리 링크) |

## 미리 보기
```bash
npm run legal
```
`_site/`에 HTML이 생긴다 (저장소에는 올리지 않음).

## 고칠 때
- 앱에서 수집하는 정보가 바뀌면(예: 광고 ID, 위치를 서버로 보내기) `privacy-policy.md`를 같이 고친다.
- 처리방침을 바꾸면 시행 7일 전에 알린다고 적어 두었다 → `EFFECTIVE_DATE`를 7일 뒤 날짜로.
- 처음 한 번만: GitHub 저장소 Settings → Pages → Source를 **GitHub Actions**로 바꿔야 배포된다 (관리자).
