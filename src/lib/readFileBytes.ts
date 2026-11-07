/** 로컬 파일(사진 등)을 업로드용 바이트로 읽는다 — 네이티브. 웹은 readFileBytes.web.ts */
import { File } from 'expo-file-system';

export function readFileBytes(uri: string): Promise<ArrayBuffer> {
  return new File(uri).arrayBuffer();
}
