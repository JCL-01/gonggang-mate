/**
 * 하단 네비게이션 (PRD 4.3): 혼자 / 홈 / 채팅 / 약속카드
 * TODO: 아이콘 디자인, 약속카드 탭 미확인 알림 숫자 배지(tabBarBadge)
 */
import { Tabs } from 'expo-router/js-tabs';
import { Text } from 'react-native';

import { colors } from '@/constants/theme';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

// 탭 묶음에 처음 들어오면 '홈'이 열리게 한다
export const unstable_settings = { initialRouteName: 'home' };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.sub,
      }}
    >
      <Tabs.Screen name="solo" options={{ title: '혼자', tabBarIcon: () => <TabIcon emoji="🧍" /> }} />
      <Tabs.Screen name="home" options={{ title: '홈', tabBarIcon: () => <TabIcon emoji="🏠" /> }} />
      <Tabs.Screen name="chats" options={{ title: '채팅', tabBarIcon: () => <TabIcon emoji="💬" /> }} />
      <Tabs.Screen
        name="appointments"
        options={{ title: '약속카드', tabBarIcon: () => <TabIcon emoji="📅" /> }}
      />
    </Tabs>
  );
}
