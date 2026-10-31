import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

type Props = {
  nickname: string;
  photoUrl?: string | null;
  size?: number;
};

/** 원형 프로필 사진. 사진이 없으면 닉네임 첫 글자를 보여 준다. (PRD 4.3) */
export function Avatar({ nickname, photoUrl, size = 40 }: Props) {
  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={circle} accessibilityLabel={`${nickname} 프로필 사진`} />;
  }

  return (
    <View style={[styles.fallback, circle]} accessibilityLabel={`${nickname} 프로필`}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{nickname.slice(0, 1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { color: colors.primary, fontWeight: '700' },
});
