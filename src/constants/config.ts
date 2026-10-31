/**
 * 설정값 모음
 * PRD에서 "[결정 필요]"인 항목은 기본값을 여기에 두고, 회의에서 바뀌면 이 파일만 고친다.
 */

// ── 공강/약속 시간 격자 (PRD S06, S08) ──
export const SLOT_MINUTES = 30; // 한 칸 = 30분 (확정)
export const DAY_START = '09:00'; // [결정 필요] 격자 시작 시각
export const DAY_END = '21:00'; // [결정 필요] 격자 끝 시각

// ── 회원가입 (PRD S03) ──
export const ALLOWED_EMAIL_DOMAINS = ['school.ac.kr']; // TODO: 실제 학교 도메인으로 교체
export const PASSWORD_MIN_LENGTH = 8;
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 10;
export const BIO_MAX_LENGTH = 40;

// ── 게시물 (PRD S08) ──
export const POST_TITLE_MAX = 30;
export const POST_CONTENT_MAX = 500;
export const POST_PHOTO_MAX = 5;

// ── 채팅방 (PRD 7.2) ──
export const MAX_ROOM_MEMBERS = 6; // [결정 필요] 방장 포함 최대 인원

// ── 약속 알림 (PRD 7.3) ──
export const REMIND_BEFORE_MINUTES = 30;

// ── 후기·메이트 하트 (PRD 7.4) ──
export const HEART_THRESHOLD = 4; // 5문항 중 4개 이상 체크하면 하트 +1

// ── 신고 제재 (PRD 8.3) ── [결정 필요]
export const REPORTS_FOR_WARNING = 1;
export const REPORTS_FOR_SUSPENSION = 3;
export const SUSPENSION_DAYS = 7;
