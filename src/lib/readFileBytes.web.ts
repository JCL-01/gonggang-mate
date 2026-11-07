/** 로컬 파일(사진 등)을 업로드용 바이트로 읽는다 — 웹 (blob: / data: 주소) */
export async function readFileBytes(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  return response.arrayBuffer();
}
