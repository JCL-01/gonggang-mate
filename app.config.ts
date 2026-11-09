/**
 * app.json에 비밀이 아닌 설정을 두고, 빌드할 때만 정해지는 값을 여기서 더한다.
 * - GOOGLE_MAPS_ANDROID_API_KEY: 안드로이드 지도(혼자놀기) 키. 저장소에 넣지 않고 EAS 환경변수로 둔다.
 *   없으면 Expo Go(자체 키 사용)에서는 괜찮지만, 우리 앱으로 빌드하면 지도가 회색 화면이 된다.
 *   발급·제한 방법: docs/RELEASE.md
 */
import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const mapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...(config as ExpoConfig),
    plugins: [...(config.plugins ?? []), ...(mapsKey ? [['react-native-maps', { androidGoogleMapsApiKey: mapsKey }] as [string, object]] : [])],
  };
};
