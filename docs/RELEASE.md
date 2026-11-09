# 플레이스토어 출시 절차

준비된 것과 남은 것을 순서대로 적었다. 명령어의 `npx eas-cli@latest`는 EAS(Expo 클라우드 빌드) 도구다.

## 이미 준비된 것

- 앱 이름 `공강메이트`, 패키지 이름 `com.ilsacheonri.gonggangmate` (`app.json`) — **처음 업로드하면 영원히 못 바꾼다. 업로드 전에 팀 확인**
- 빌드 설정 `eas.json` (preview = 팀 테스트용 APK, production = 스토어용 AAB, 버전 번호 자동 증가)
- 이용약관·개인정보처리방침·계정 삭제 안내 공개 주소 (`docs/legal/README.md`)
- 회원 탈퇴(앱 + 웹 안내), 신고·차단, 약관 동의 — Play 정책 필수 항목
- 카메라·마이크 권한 없음, 위치는 기기 안에서만 사용

## 남은 것

### 1. 앱 아이콘·스플래시 (디자인)
지금 `assets/images/`의 아이콘은 Expo 기본 그림이다. 같은 파일 이름으로 바꾼다.
- `icon.png` 1024×1024 (iOS·기본)
- `android-icon-foreground.png`·`android-icon-background.png`·`android-icon-monochrome.png` (안드로이드 적응형 아이콘, 가운데 안전 영역에 로고)
- `splash-icon.png` (스플래시 가운데 그림, 배경색은 `#4C1D95`)
- 스토어용: 512×512 아이콘, 1024×500 그래픽 이미지, 휴대폰 스크린샷 2장 이상

### 2. EAS 프로젝트 연결 (한 번)
```bash
npx eas-cli@latest login
npx eas-cli@latest init
```
`init`이 `app.json`에 프로젝트 ID를 넣는다 → 커밋.

### 3. 빌드용 환경변수 (EAS)
`.env`는 클라우드 빌드에 올라가지 않는다. expo.dev → 프로젝트 → Environment variables에 등록한다 (production·preview 둘 다).

| 이름 | 값 | 공개 범위 |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase 주소 | Plain text |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 공개 키 (`sb_publishable_…`) | Plain text |
| `EXPO_PUBLIC_USE_MOCK_API` | `false` | Plain text |
| `GOOGLE_MAPS_ANDROID_API_KEY` | 아래 4번의 키 | Sensitive |

### 4. Google Maps API 키 (안드로이드 지도)
없으면 빌드한 앱의 혼자놀기 지도가 회색 화면이다. (Expo Go는 자체 키라 괜찮다) `app.config.ts`가 위 환경변수를 읽어 넣는다.
1. [Google Cloud Console](https://console.cloud.google.com/) → 새 프로젝트 → 결제 계정 연결 (모바일 지도 표시는 무료 범위, 예산 알림 설정 권장)
2. API 및 서비스 → 라이브러리 → **Maps SDK for Android** 사용
3. 사용자 인증 정보 → API 키 만들기 → **키 제한**
   - 애플리케이션: Android 앱, 패키지 `com.ilsacheonri.gonggangmate` + SHA-1 지문 **2개**
     - EAS 업로드 키: `npx eas-cli@latest credentials -p android` (첫 빌드 후 생김)
     - Play 앱 서명 키: Play Console → 앱 무결성 (첫 업로드 후 생김) — 빠뜨리면 스토어에서 받은 앱만 지도가 안 나온다
   - API: Maps SDK for Android만
4. 키를 3번 표의 `GOOGLE_MAPS_ANDROID_API_KEY`로 등록

### 5. 빌드
```bash
npx eas-cli@latest build -p android --profile preview      # 팀 테스트용 APK (설치 링크)
npx eas-cli@latest build -p android --profile production   # 스토어 제출용 AAB
```

### 6. Play Console
1. 개발자 계정 ($25, 신분증 인증) → 앱 만들기 (공강메이트, 무료)
2. 정책 설문
   - 앱 액세스: 로그인 필요 → **심사용 테스트 계정** 제공 (심사관은 학교 메일이 없다. `supabase/seed_test_users.sql`처럼 만들되 비밀번호는 새로 정해서 비공개로)
   - 데이터 보안: 이메일, 닉네임·성별·소개, 사진, 앱 내 메시지, 사용자 ID 수집 / 전송 시 암호화 / 삭제 요청 가능 / 계정 삭제 URL
   - 콘텐츠 등급(사용자 간 채팅 있음), 타겟층 18세 이상, 광고 없음, 개인정보처리방침 URL
3. 첫 AAB는 Play Console에서 직접 업로드 (이후 `npx eas-cli@latest submit -p android`, 구글 서비스 계정 키 필요)
4. **비공개 테스트**: 테스터 12명 이상이 14일 연속 참여 (2023-11 이후 만든 개인 계정 필수) → 프로덕션 액세스 신청 → 심사 → 출시

### 7. 출시 직전 점검
- 실서버의 테스트 계정(`test-mate1~3`) 삭제 — 비밀번호가 이 공개 저장소에 있다
- 신고 확인 담당·주기 정하기 (약관에 "운영팀이 확인 후 조치"라고 약속함)
- Supabase 무료 플랜은 7일간 요청이 없으면 일시정지된다
