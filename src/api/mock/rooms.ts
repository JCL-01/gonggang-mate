/** 가짜 채팅방·채팅 요청 (api/rooms.ts의 USE_MOCK_API 모드). Supabase 연결 후 지운다. */
import { ApiError, type JoinRequestItem, type MyRequestStatus, type RoomDetail, type RoomListItem } from '@/api/types';
import { blockedUserIdsOf, findRoom, findUser, requireMeId, requireMember, roomMemberIds, toMini } from '@/api/mock/helpers';
import { addSystemMessage, copy, db, delay, newId, nowIso } from '@/api/mock/store';
import { MAX_ROOM_MEMBERS } from '@/constants/config';
import type { Category } from '@/types/db';

/** S07 말풍선 버튼: 방장에게 채팅 요청 보내기 */
export async function requestJoin(postId: string): Promise<MyRequestStatus> {
  await delay();
  const meId = requireMeId();
  const post = db.posts.find((p) => p.id === postId);
  if (!post || post.status !== 'open') throw new ApiError('이미 마감된 약속이에요', 'not_allowed');
  if (blockedUserIdsOf(meId).includes(post.author_id)) throw new ApiError('요청을 보낼 수 없어요', 'not_allowed');
  const room = db.rooms.find((r) => r.post_id === postId)!;
  if (roomMemberIds(room.id).includes(meId)) return 'accepted';
  if (roomMemberIds(room.id).length >= MAX_ROOM_MEMBERS) throw new ApiError('인원이 가득 찼어요', 'room_full');
  const existing = db.joinRequests.find((j) => j.room_id === room.id && j.requester_id === meId && j.status === 'pending');
  if (existing) return 'pending';
  db.joinRequests.push({ id: newId('jr'), room_id: room.id, requester_id: meId, status: 'pending', created_at: nowIso(), decided_at: null });
  return 'pending';
}

/** 보낸 채팅 요청 취소 */
export async function cancelJoinRequest(postId: string): Promise<void> {
  await delay();
  const meId = requireMeId();
  const room = db.rooms.find((r) => r.post_id === postId);
  db.joinRequests = db.joinRequests.filter((j) => !(j.room_id === room?.id && j.requester_id === meId && j.status === 'pending'));
}

/** S12 (방장만): 대기 중인 채팅 요청 목록 */
export async function getJoinRequests(roomId: string): Promise<JoinRequestItem[]> {
  await delay(200);
  const meId = requireMeId();
  const room = findRoom(roomId);
  if (room.host_id !== meId) return [];
  return copy(
    db.joinRequests
      .filter((j) => j.room_id === roomId && j.status === 'pending')
      .map((j) => ({ id: j.id, user: toMini(j.requester_id), created_at: j.created_at })),
  );
}

/** S12 (방장만): 채팅 요청 수락/거절. 수락하면 입장 + 시스템 메시지 */
export async function respondJoinRequest(requestId: string, accept: boolean): Promise<void> {
  await delay();
  const meId = requireMeId();
  const req = db.joinRequests.find((j) => j.id === requestId);
  if (!req || req.status !== 'pending') throw new ApiError('이미 처리된 요청이에요', 'not_found');
  const room = findRoom(req.room_id);
  if (room.host_id !== meId) throw new ApiError('방장만 수락할 수 있어요', 'not_allowed');
  if (accept && roomMemberIds(room.id).length >= MAX_ROOM_MEMBERS) throw new ApiError('인원이 가득 찼어요', 'room_full');
  req.status = accept ? 'accepted' : 'rejected';
  req.decided_at = nowIso();
  if (accept) {
    db.members.push({ room_id: room.id, user_id: req.requester_id, joined_at: nowIso(), last_read_message_id: null });
    addSystemMessage(room.id, `${findUser(req.requester_id).nickname}님이 채팅방에 들어왔어요`);
  }
}

/** S11: 내 채팅방 목록 (카테고리별, 최근 메시지 순). 1:1 방은 카테고리가 없어 '전체'에서만 나온다 */
export async function getMyRooms(category?: Category): Promise<RoomListItem[]> {
  await delay();
  const meId = requireMeId();
  const blocked = blockedUserIdsOf(meId);
  const myRoomIds = db.members.filter((m) => m.user_id === meId).map((m) => m.room_id);
  const items = myRoomIds
    .map((roomId) => {
      const room = findRoom(roomId);
      const post = room.post_id ? db.posts.find((p) => p.id === room.post_id)! : null;
      const partnerId = room.kind === 'direct' ? (roomMemberIds(roomId).find((id) => id !== meId) ?? null) : null;
      if (post && (post.status === 'deleted' || post.status === 'closed')) return null;
      if (room.kind === 'direct' && (category || !partnerId || blocked.includes(partnerId))) return null;
      const messages = db.messages.filter((m) => m.room_id === roomId).sort((a, b) => a.created_at.localeCompare(b.created_at));
      const last = messages[messages.length - 1];
      const me = db.members.find((m) => m.room_id === roomId && m.user_id === meId)!;
      const lastReadIndex = me.last_read_message_id ? messages.findIndex((m) => m.id === me.last_read_message_id) : -1;
      const memberIds = roomMemberIds(roomId);
      const isHost = room.kind === 'post' && room.host_id === meId;
      const item: RoomListItem = {
        id: roomId,
        kind: room.kind,
        post_id: post?.id ?? null,
        category: post?.category ?? null,
        title: post ? post.title : findUser(partnerId!).nickname,
        partner: partnerId ? toMini(partnerId) : null,
        members: memberIds.map(toMini),
        member_count: memberIds.length,
        last_message: last
          ? { sender_nickname: last.sender_id ? findUser(last.sender_id).nickname : null, sender_deleted: last.sender_deleted, body: last.type === 'game_result' ? '게임 결과를 공유했어요' : last.body, created_at: last.created_at }
          : null,
        unread_count: messages.slice(lastReadIndex + 1).filter((m) => m.sender_id !== meId).length,
        is_host: isHost,
        pending_request_count: isHost ? db.joinRequests.filter((j) => j.room_id === roomId && j.status === 'pending').length : 0,
      };
      return item;
    })
    .filter((x): x is RoomListItem => x !== null && (!category || x.category === category))
    .sort((a, b) => (b.last_message?.created_at ?? '').localeCompare(a.last_message?.created_at ?? ''));
  return copy(items);
}

/** S12: 채팅방 상단 정보. 1:1 방은 post = null, partner = 상대 */
export async function getRoom(roomId: string): Promise<RoomDetail> {
  await delay(200);
  const meId = requireMeId();
  requireMember(roomId, meId);
  const room = findRoom(roomId);
  const post = room.post_id ? db.posts.find((p) => p.id === room.post_id)! : null;
  const partnerId = room.kind === 'direct' ? (roomMemberIds(roomId).find((id) => id !== meId) ?? null) : null;
  const appointment = db.appointments.find((a) => a.room_id === roomId && a.status !== 'canceled');
  return copy({
    id: room.id,
    kind: room.kind,
    post: post
      ? {
          id: post.id,
          title: post.title,
          category: post.category,
          content: post.content,
          range: { weekday: post.weekday, start: post.start_time, end: post.end_time },
          start_at: post.start_at,
          end_at: post.end_at,
        }
      : null,
    partner: partnerId ? toMini(partnerId) : null,
    host: toMini(room.host_id),
    members: roomMemberIds(roomId).map(toMini),
    max_members: MAX_ROOM_MEMBERS,
    is_host: room.kind === 'post' && room.host_id === meId,
    appointment_id: appointment?.id ?? null,
  });
}

/** S13 '1:1 채팅': 같은 두 사람의 방이 있으면 그 방(나갔으면 다시 참여), 없으면 새로 만든다. 방 id를 돌려준다 */
export async function openDirectRoom(userId: string): Promise<string> {
  await delay();
  const meId = requireMeId();
  if (userId === meId) throw new ApiError('나와는 채팅할 수 없어요', 'invalid_input');
  findUser(userId);
  if (blockedUserIdsOf(meId).includes(userId)) throw new ApiError('채팅할 수 없는 사용자예요', 'not_allowed');
  const key = [meId, userId].sort().join(':');
  let room = db.rooms.find((r) => r.direct_key === key);
  if (!room) {
    room = { id: newId('r'), kind: 'direct', post_id: null, host_id: meId, direct_key: key, created_at: nowIso() };
    db.rooms.push(room);
  }
  for (const id of [meId, userId]) {
    if (!roomMemberIds(room.id).includes(id)) db.members.push({ room_id: room.id, user_id: id, joined_at: nowIso(), last_read_message_id: null });
  }
  return room.id;
}

/** S12 메뉴 '나가기' (방장은 못 나감 → 게시물 삭제로 대신) */
export async function leaveRoom(roomId: string): Promise<void> {
  await delay();
  const meId = requireMeId();
  findRoom(roomId);
  requireMember(roomId, meId);
  leaveRoomAs(roomId, meId);
}

/**
 * 가짜 leave_room_internal (C의 *_feedback_1106.sql과 같은 규칙, 11/6 결정 5번)
 * 시작 전 약속 참여 취소 → 방에서 빠짐 → 방장이었으면 가장 먼저 들어온 사람이 방장·글 작성자, 아무도 없으면 글 closed
 */
export function leaveRoomAs(roomId: string, userId: string) {
  const room = findRoom(roomId);
  const nickname = findUser(userId).nickname;
  db.members = db.members.filter((m) => !(m.room_id === roomId && m.user_id === userId));
  if (room.kind === 'direct') {
    addSystemMessage(roomId, `${nickname}님이 나갔어요`);
    return;
  }

  const appointment = db.appointments.find(
    (a) =>
      a.room_id === roomId &&
      a.status === 'confirmed' &&
      new Date(a.start_at).getTime() > Date.now() &&
      db.appointmentMembers.some((m) => m.appointment_id === a.id && m.user_id === userId && !m.canceled_at),
  );
  if (appointment) {
    const member = db.appointmentMembers.find((m) => m.appointment_id === appointment.id && m.user_id === userId);
    if (member) member.canceled_at = nowIso();
    if (!db.appointmentMembers.some((m) => m.appointment_id === appointment.id && !m.canceled_at)) appointment.status = 'canceled';
  }
  const left = appointment ? `${nickname}님이 약속을 취소하고 ` : `${nickname}님이 `;

  if (room.host_id !== userId) {
    addSystemMessage(roomId, `${left}나갔어요`);
    return;
  }
  const next = db.members
    .filter((m) => m.room_id === roomId)
    .sort((a, b) => a.joined_at.localeCompare(b.joined_at) || a.user_id.localeCompare(b.user_id))[0];
  const post = db.posts.find((p) => p.id === room.post_id);
  if (!next) {
    if (post && (post.status === 'open' || post.status === 'confirmed')) post.status = 'closed';
    db.appointments.forEach((a) => {
      if (a.room_id === roomId && a.status === 'confirmed' && new Date(a.start_at).getTime() > Date.now()) a.status = 'canceled';
    });
    db.joinRequests.forEach((j) => {
      if (j.room_id === roomId && j.status === 'pending') Object.assign(j, { status: 'rejected', decided_at: nowIso() });
    });
    addSystemMessage(roomId, `${left}나갔어요`);
    return;
  }
  room.host_id = next.user_id;
  if (post) post.author_id = next.user_id;
  addSystemMessage(roomId, `${left}나가서 ${findUser(next.user_id).nickname}님이 새 방장이 됐어요`);
}
