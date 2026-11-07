/**
 * 프로필 사진 고르기 (11/6 결정 1번: 앨범에서만, 카메라 없음)
 * - 앨범에서 정사각형으로 자르고, 512px JPEG로 줄인다 (서버 버킷 제한 2MB 안으로)
 * - 안드로이드 13+ / iOS는 시스템 사진 선택창이라 사진 접근 권한을 따로 묻지 않는다
 * - 올리는 일은 api.users.uploadProfilePhoto
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export const PROFILE_PHOTO_SIZE = 512;

/** 고른 사진의 로컬 주소(JPEG). 취소하면 null */
export async function pickProfilePhoto(): Promise<string | null> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (picked.canceled || !picked.assets[0]) return null;

  const context = ImageManipulator.manipulate(picked.assets[0].uri).resize({ width: PROFILE_PHOTO_SIZE, height: PROFILE_PHOTO_SIZE });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  return saved.uri;
}
