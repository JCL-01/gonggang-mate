/** 이용약관·개인정보처리방침 열기 (설정, 회원가입). 주소가 아직 없으면 안내만 한다 */
import { Alert, Linking } from 'react-native';

import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/config';

export function openLegal(kind: 'terms' | 'privacy') {
  const url = kind === 'terms' ? TERMS_URL : PRIVACY_POLICY_URL;
  if (!url) {
    Alert.alert('준비 중이에요', '곧 공개할게요.');
    return;
  }
  Linking.openURL(url).catch(() => Alert.alert('페이지를 열지 못했어요'));
}
