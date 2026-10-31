import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/constants/theme';

/**
 * 앱 전체 이동 틀 (PRD 5장)
 * - (tabs): 하단 네비가 있는 화면 4개 (혼자 / 홈 / 채팅 / 약속카드)
 * - 나머지: 하단 네비 없이 위에 쌓이는 화면
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="free-time" />
        <Stack.Screen name="board/[category]" />
        <Stack.Screen name="post/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="chat/[roomId]" />
        <Stack.Screen name="game/[roomId]" />
        <Stack.Screen name="review/[appointmentId]" />
      </Stack>
    </>
  );
}
