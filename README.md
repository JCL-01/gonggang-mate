# 공강메이트

> 애매하게 남은 공강, 함께하면 즐거운 시간으로

같은 학교 학생끼리 **오늘 공강 시간이 겹치는 사람**을 찾아 식사·카페·공부·산책/운동을 함께하도록 연결하는 모바일 앱입니다.
경영전략 수업 팀 프로젝트(팀 **일사천리**)로 기획부터 실사용 테스트, 플레이스토어 등록 준비까지 진행했습니다.

<p>
  <img src="assets/guide/1-free-time.jpg" width="160" alt="공강 시간 등록">
  <img src="assets/guide/2-board.jpg" width="160" alt="겹치는 메이트 게시판">
  <img src="assets/guide/3-chat.jpg" width="160" alt="채팅">
  <img src="assets/guide/4-appointment.jpg" width="160" alt="약속카드">
  <img src="assets/guide/6-solo.jpg" width="160" alt="혼자놀기 지도">
</p>

## 주요 기능

| 기능 | 내용 |
|---|---|
| 공강 등록 | 월~금 시간표를 손가락으로 드래그해 30분 단위로 칠한다 |
| 겹치는 메이트 찾기 | 카테고리 게시판에 **오늘 내 공강과 30분 이상 겹치는 글만** 보인다. 작성자의 '활동 중'(최근 15분) 표시 |
| 채팅 | 방장에게 채팅 요청 → 수락하면 입장(최대 20명). 실시간 메시지, 1:1 채팅 |
| 미니게임 | 사다리·추첨·돌림판 등 5종. 결과는 서버가 정해 모두 같은 결과를 본다 |
| 약속 | 방장이 날짜(달력)·시간(다이얼)·장소를 확정하면 약속카드 생성. 일정 변경, 종료 시간이 지나면 자동 완료 |
| 방장 넘기기 | 방장이 나가거나 약속을 취소하면 가장 먼저 들어온 메이트가 새 방장 |
| 후기·메이트하트 | 만난 뒤 5개 항목 중 3개 이상 체크하면 하트 적립, 대표 후기 상위 3개 |
| 혼자놀기 | 학교 근처 식당·카페·놀거리 66곳을 지도로 |
| 안전 | 학교 이메일 인증(서버에서도 도메인 확인), 차단, 신고, 회원 탈퇴, 이용약관 동의 |
| 첫 사용 가이드 | 처음 실행할 때 6장 슬라이드, 건너뛰기 가능 |

## 기술 스택

- **앱**: React Native 0.88 + Expo SDK 58, TypeScript, Expo Router(파일 기반 화면), react-native-gesture-handler(시간표 드래그), react-native-maps
- **서버**: Supabase — PostgreSQL(행 단위 보안 RLS, 서버 함수 RPC), Auth(이메일 OTP), Realtime(채팅), Storage(프로필 사진), Edge Function(회원 탈퇴), pg_cron(약속 자동 완료)
- **개발 환경**: GitHub Actions(lint·typecheck, 약관 페이지 자동 공개), EAS Build

## 구조

```
화면 (src/app)  ──>  api 계층 (src/api)  ──>  Supabase
                     │                         ├─ PostgreSQL: RLS + RPC (supabase/migrations)
                     │ USE_MOCK_API=true면     ├─ Realtime: 채팅 메시지
                     └─ 데모 데이터 (src/api/mock)  ├─ Storage: 프로필 사진
                                               └─ Edge Function: delete-account
```

- 화면은 Supabase를 직접 부르지 않고 `src/api`의 함수만 부릅니다. 함수 모양을 먼저 정하고 데모 데이터로 화면을 만든 뒤, 서버 담당이 안쪽을 Supabase로 바꾸는 방식으로 **세 명이 동시에 작업**했습니다.
- 권한 검사는 앱이 아니라 서버(RLS·RPC)가 합니다. 앱에는 공개 키만 있고, 관리자 키는 Edge Function 안에서만 씁니다.
- 기획과 다르게 정한 것, 회의 결정은 모두 [`docs/DECISIONS.md`](docs/DECISIONS.md)에 근거와 함께 남겼습니다.

## 실행하기

```bash
npm install
npx expo start
```

휴대폰의 **Expo Go**로 QR 코드를 찍으면 열립니다.

- **서버 없이 둘러보기(데모 모드)**: `.env` 없이 실행하면 예시 데이터로 로그인된 상태로 시작합니다. 인증 코드는 `123456`. 자세한 시나리오는 [`src/api/README.md`](src/api/README.md).
- **실서버**: `.env.example`을 `.env`로 복사해 Supabase 주소·공개 키를 넣고 `EXPO_PUBLIC_USE_MOCK_API=false`. DB는 `supabase/migrations/`를 순서대로 적용합니다.

```bash
npm run lint        # 코드 규칙 검사
npm run typecheck   # 타입 검사
npm run legal       # 약관·처리방침 HTML 미리 보기 (_site/)
```

## 폴더 구조

```
src/
  app/            화면 (파일 하나 = 화면 하나, _layout = 네비게이션)
    (tabs)/       하단 탭: 혼자놀기 · 홈 · 채팅
  api/            서버 함수 + 데모 데이터(mock/)
  components/     공용 부품 (TimeGrid, DateTimeField, 팝업 등)
  lib/            순수 함수 (시간 계산·노출 규칙, 게임 결과 문장 등)
  constants/      색상·설정값
  types/          DB 데이터 타입
supabase/
  migrations/     테이블·권한·서버 함수 (순서대로 적용)
  functions/      Edge Function (회원 탈퇴)
docs/
  DECISIONS.md    결정 기록
  legal/          이용약관·개인정보처리방침·계정 삭제 안내 (GitHub Pages로 공개)
  RELEASE.md      플레이스토어 출시 절차
```

## 팀 일사천리

| 역할 | 담당 | 주요 작업 |
|---|---|---|
| A · 프론트엔드·디자인, 저장소 관리 | [@JCL-01](https://github.com/JCL-01) | 앱 구조·api 계층 설계, 인증·홈·시간표·혼자놀기·약속·후기 화면, 전체 디자인 반영, 실사용 피드백 반영 |
| B · 프론트엔드 | [@shinjeonghun10](https://github.com/shinjeonghun10) | 게시판·글쓰기·채팅 목록·채팅방 화면 |
| C · 서버·DB | [@1502sally-spec](https://github.com/1502sally-spec) | Supabase 설계, 마이그레이션·RLS·RPC, 실시간 채팅, 게임·약속·후기 서버 로직, 탈퇴 Edge Function |

- 협업: Fork → Pull Request, CI 통과 후 리뷰·머지 ([CONTRIBUTING.md](CONTRIBUTING.md))
- AI 도구(Claude Code)를 설계 검토, 코드 작성, SQL 검증에 함께 사용했습니다. 커밋 작성자 `Claude`는 이 도구로 만든 커밋입니다.

## 문서

- [이용약관](https://jcl-01.github.io/gonggang-mate/terms.html) · [개인정보처리방침](https://jcl-01.github.io/gonggang-mate/privacy.html) · [계정 삭제 안내](https://jcl-01.github.io/gonggang-mate/account-deletion.html)
- [결정 기록](docs/DECISIONS.md) · [출시 절차](docs/RELEASE.md) · [api 함수 목록](src/api/README.md)

© 2026 일사천리. All rights reserved. ([LICENSE](LICENSE))
