-- Google Play 심사용 계정 만들기 (실서버에 한 번만 실행). 마이그레이션이 아니다.
-- 실행: Supabase 대시보드 → SQL Editor에 붙여넣고, 아래 v_password만 바꾼 뒤 Run
--   ⚠ 비밀번호를 넣은 채로 이 파일을 저장·커밋하지 말 것 (공개 저장소). SQL Editor 안에서만 바꾼다.
--
-- 만드는 것
-- 1. 심사 계정 gonggangmate-playreview-2026@cau.ac.kr (메일 인증 완료 상태, 프로필·약관 동의 완료)
-- 2. 대화 상대 '데모메이트' 계정 (비밀번호는 무작위라 아무도 로그인할 수 없다)
-- 3. 두 계정의 공강: 월~금 10:00~14:00
-- 4. 두 계정의 1:1 채팅방과 메시지 3개 (심사관이 채팅·미니게임을 바로 써 볼 수 있게)
-- 게시물·약속은 만들지 않는다. 날짜가 지나면 사라지므로 심사관이 앱에서 직접 글을 쓰면 된다.
--
-- 전부 한 번에 실행되고, 중간에 실패하면 아무것도 남지 않는다.
-- 지우기: 맨 아래 '지우기' 주석의 delete 한 줄 실행 (프로필·공강·채팅방이 같이 지워짐)

do $$
declare
  v_password text := 'CHANGE_ME'; -- ← 심사 계정 비밀번호 (8자 이상). Play Console '비밀번호' 칸과 같게
  v_reviewer_email text := 'gonggangmate-playreview-2026@cau.ac.kr';
  v_mate_email text := 'gonggangmate-demomate-2026@cau.ac.kr';
  v_reviewer uuid := gen_random_uuid();
  v_mate uuid := gen_random_uuid();
  v_room uuid;
begin
  if v_password = 'CHANGE_ME' or char_length(v_password) < 8 then
    raise exception 'v_password를 8자 이상 새 비밀번호로 바꿔 주세요';
  end if;
  if exists (select 1 from auth.users where email in (v_reviewer_email, v_mate_email)) then
    raise exception '이미 만들어진 계정이 있어요. 다시 만들려면 아래 지우기를 먼저 실행하세요';
  end if;
  if exists (select 1 from public.users where nickname in ('Reviewer', '데모메이트')) then
    raise exception '닉네임 Reviewer 또는 데모메이트를 이미 누가 쓰고 있어요. 아래 닉네임을 바꿔 주세요';
  end if;

  -- 1) 로그인 계정 (seed_test_users.sql과 같은 방식: 메일 인증 없이 바로 로그인)
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values
    ('00000000-0000-0000-0000-000000000000', v_reviewer, 'authenticated', 'authenticated',
     v_reviewer_email, extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
     '{"provider": "email", "providers": ["email"]}', '{"password_set": true}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', v_mate, 'authenticated', 'authenticated',
     v_mate_email, extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')), now(),
     '{"provider": "email", "providers": ["email"]}', '{"password_set": true}', now(), now(), '', '', '', '');

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now()
  from auth.users u where u.id in (v_reviewer, v_mate);

  -- 2) 프로필. fill_user_row 트리거가 auth.uid()로 id·이메일·학교를 채우므로, 그 사용자로 로그인한 것처럼 잠깐 설정한다
  perform set_config('request.jwt.claims', json_build_object('sub', v_reviewer, 'role', 'authenticated')::text, true);
  insert into public.users (nickname, gender, bio, terms_agreed_at, last_active_at)
  values ('Reviewer', 'female', 'Google Play 심사용 계정', now(), now());

  perform set_config('request.jwt.claims', json_build_object('sub', v_mate, 'role', 'authenticated')::text, true);
  insert into public.users (nickname, gender, bio, terms_agreed_at, last_active_at)
  values ('데모메이트', 'male', '공강에 같이 밥 먹을 메이트 찾아요', now(), now());

  perform set_config('request.jwt.claims', '', true);

  -- 3) 공강: 월~금(0~4) 10:00~14:00, 30분 칸 8개씩
  insert into public.free_slots (user_id, weekday, slot_start)
  select u, d, time '10:00' + make_interval(mins => 30 * s)
  from unnest(array[v_reviewer, v_mate]) as u, generate_series(0, 4) as d, generate_series(0, 7) as s;

  -- 4) 1:1 채팅방 (open_direct_room과 같은 direct_key 규칙) + 메시지
  insert into public.chat_rooms (kind, direct_key, host_id)
  values ('direct', least(v_reviewer::text, v_mate::text) || ':' || greatest(v_reviewer::text, v_mate::text), v_mate)
  returning id into v_room;

  insert into public.chat_members (room_id, user_id) values (v_room, v_reviewer), (v_room, v_mate);

  insert into public.messages (room_id, sender_id, type, body, created_at) values
    (v_room, v_mate, 'text', '안녕하세요! 오늘 공강 시간이 겹치던데 같이 점심 드실래요?', now() - interval '20 minutes'),
    (v_room, v_reviewer, 'text', '좋아요! 학생식당 어때요?', now() - interval '18 minutes'),
    (v_room, v_mate, 'text', '좋아요. 12시에 학생식당 앞에서 봐요!', now() - interval '15 minutes');

  raise notice '완료: 심사 계정 %, 데모메이트 %, 1:1 채팅방 %', v_reviewer, v_mate, v_room;
end;
$$;

-- 확인 (선택): 두 계정이 보이면 성공
-- select u.email, p.nickname, (select count(*) from public.free_slots f where f.user_id = p.id) as slots
-- from auth.users u join public.users p on p.id = u.id
-- where u.email like 'gonggangmate-%-2026@cau.ac.kr';

-- 지우기 (심사가 더는 필요 없을 때):
-- delete from auth.users where email in ('gonggangmate-playreview-2026@cau.ac.kr', 'gonggangmate-demomate-2026@cau.ac.kr');
