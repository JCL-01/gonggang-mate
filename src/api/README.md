# src/api — 화면과 서버를 잇는 함수 모음

화면은 **이 폴더의 함수만** 불러서 데이터를 주고받는다. 모든 함수는 Supabase(실서버)와 데모 데이터(`mock/`) 두 가지로 동작하고,
`.env`의 `EXPO_PUBLIC_USE_MOCK_API`로 고른다 (값이 없거나 `true`면 데모, `false`면 실서버).

개발할 때는 함수 모양(`types.ts`)을 먼저 정하고 데모 데이터로 화면을 만든 뒤, 서버 담당이 안쪽을 Supabase로 바꿨다.
그래서 화면 코드는 서버 연결 전후로 바뀌지 않았다.

```ts
import { api, ApiError } from '@/api';

try {
  const list = await api.posts.getMatchingList('meal');
} catch (e) {
  if (e instanceof ApiError) Alert.alert(e.message); // message는 그대로 보여 줘도 되는 한국어 문장
}
```

## 데모 모드로 둘러보기

- 앱을 켜면 **테스트 계정(공강요정, me@cau.ac.kr / password1)으로 로그인된 상태**다. 새로고침하면 처음 상태로 돌아간다.
- 이메일 인증 코드는 항상 `123456`.
- 내 공강: 월 12:00-14:00, 수 10:00-12:00
- 미리 들어 있는 상황
  - 식사: 초밥 먹을 사람(보임), 학식 같이 먹어요(**내 글**, 산책러의 채팅 요청 대기 중)
  - 카페: 내가 채팅 요청을 보내 놓은 글 / 산책: 30분 겹쳐서 보이는 글 / 공부: 안 겹쳐서 안 보이는 글
  - 약속카드: 다가오는 약속 1개, 후기를 쓸 수 있는 지난 약속 1개

## 함수 목록

| 파일 | 함수 | 쓰는 화면 |
|---|---|---|
| `auth` | `getSession` `isAllowedEmail` `sendEmailCode` `verifyEmailCode` `signUp` `logIn` `logOut` | S01~S03 |
| `users` | `getMe` `updateMe` `getMateInfo` `isNicknameAvailable` `touchActive` `uploadProfilePhoto` `agreeTerms` `deleteAccount` | S03, S04, S05, S13, 앱 전체(활동 신호) |
| `freeSlots` | `getMyFreeRanges` `saveMyFreeRanges` | S05, S06, S08 |
| `posts` | `getMatchingList` `getMatchingCounts` `createPost` `deletePost` | S05, S07, S08 |
| `rooms` | `requestJoin` `cancelJoinRequest` `getJoinRequests` `respondJoinRequest` `getMyRooms` `getRoom` `leaveRoom` `openDirectRoom` | S07, S11, S12, S13 |
| `messages` | `getMessages` `sendMessage` `subscribeMessages` `markRead` | S12 |
| `appointments` | `confirmAppointment` `updateAppointment` `getMyAppointments` `cancelAppointment` `getUnseenAppointmentCount` `markAppointmentsSeen` | S14, S15, 홈 약속카드 배지 |
| `reviews` | `getReviewTargets` `submitReview` | S17 |
| `blocks` | `blockUser` `unblockUser` `getBlockedUsers` | S13, S17, S04 |
| `places` | `getPlaces` | S09, S10 |
| `games` | `runGame` `shareGame` `GAME_LABELS` | S16 |
| `reports` | `report` `REPORT_REASONS` | S12, S13 (신고) |

주고받는 데이터 모양은 `types.ts`, 각 함수의 규칙은 파일 안 주석에 있다.

## 공용 순수 함수 (`src/lib`)

- `lib/time.ts`: 칸 ↔ 구간 변환, 다음 약속 날짜 계산(KST), `'월 12:00-13:00'` 같은 표시 문구
- `lib/visibility.ts`: 게시물 노출 규칙 `isPostVisibleTo` (30분 이상 겹침, 10/31 회의). 서버도 같은 규칙으로 거른다.

## 데모 데이터 ↔ 실서버

- 각 함수는 맨 앞에서 `if (USE_MOCK_API) return mock.xxx()`로 갈라진다. 데모 코드는 `mock/`, 실서버 코드는 같은 파일 아래쪽.
- 실서버 쪽 권한 검사·규칙은 DB(RLS, RPC)가 한다. 서버 함수가 낸 오류(`raise exception ... using hint`)는 `toApiError`가 화면에 보여 줄 한국어 문장과 `ApiError.code`로 바꾼다.
- 함수 모양을 바꿀 때는 `types.ts`와 이 표를 같이 고친다.

## 기능별 메모

- **1:1 채팅방**: `RoomListItem.kind`·`RoomDetail.kind`가 `'direct'`이면 1:1 방이다. `post`·`post_id`·`category`가 `null`이고 `partner`가 상대.
  1:1 방은 대화와 게임만 (약속 확정 버튼을 보여 주지 않는다). `getMyRooms()`를 카테고리 없이 부를 때만 나온다.
- **활동 중**: `PostListItem.author_is_active`, `MateInfo.is_active` (최근 15분)
- **약속카드**: `AppointmentItem.can_reschedule`(방장·시작 전 → '일정 변경'), `can_complete`(시작 이후 → '완료 및 후기')
- **후기 문항**: `communication`·`on_time`·`kind_manner`·`ice_breaker`·`meet_again`, 3개 이상이면 하트
- **11/6 실사용 피드백**: 방장 넘기기(`leaveRoom`·`cancelAppointment`), 탈퇴한 사람의 메시지 `sender_deleted`, 약속 자동 완료(`status = 'done'`, 서버 pg_cron), 신고(`reports.report`, 읽기 권한 없음), 프로필 사진(`avatars` 버킷)
