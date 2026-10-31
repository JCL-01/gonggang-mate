/**
 * 임시 화면 틀.
 * 각 화면 담당자는 자기 화면을 만들면서 이 컴포넌트 사용을 지우면 된다.
 * 아래 "이동 버튼"은 화면 사이 이동 흐름(PRD 5.2)을 미리 확인하기 위한 것이다.
 */
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';

export type PlaceholderLink = {
  label: string;
  href: Href;
  /** true면 뒤로가기가 안 되게 화면을 바꾼다 (로그인 후 등) */
  replace?: boolean;
};

type Props = {
  id: string; // 화면 ID (예: 'S07')
  title: string;
  description?: string;
  links?: PlaceholderLink[];
  children?: ReactNode;
};

export function ScreenPlaceholder({ id, title, description, links = [], children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.id}>{id}</Text>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        <Text style={styles.todo}>🚧 아직 만들지 않은 화면입니다</Text>

        <View style={styles.links}>
          {links.map((link) => (
            <Button
              key={link.label}
              label={link.label}
              variant="secondary"
              onPress={() => (link.replace ? router.replace(link.href) : router.push(link.href))}
            />
          ))}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.sm },
  id: { color: colors.primary, fontSize: fontSize.caption, fontWeight: '700' },
  title: { color: colors.ink, fontSize: fontSize.title, fontWeight: '900' },
  description: { color: colors.sub, fontSize: fontSize.body, lineHeight: 22 },
  todo: { color: colors.sub, fontSize: fontSize.caption, marginTop: spacing.sm },
  links: { marginTop: spacing.lg, gap: spacing.sm },
});
