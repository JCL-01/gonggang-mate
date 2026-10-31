/**
 * S01 타이틀 — 담당: (미정)
 * PRD: 로고, 슬로건("비는 시간, 같이 채우자"), 로딩 표시.
 * 로그인 세션이 있으면 S05(/home), 없으면 S02(/login)로 자동 이동. 로딩은 1~3초.
 */
import { router } from 'expo-router';
import { useEffect } from 'react';

import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';

export default function TitleScreen() {
  useEffect(() => {
    // TODO: 저장된 로그인 세션 확인 후 /home 또는 /login
    const timer = setTimeout(() => router.replace('/login'), 1500);
    return () => clearTimeout(timer);
  }, []);

  return <ScreenPlaceholder id="S01" title="공강메이트" description="비는 시간, 같이 채우자" />;
}
