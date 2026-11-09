/**
 * docs/legal/*.md → _site/*.html (GitHub Pages로 공개하는 약관·처리방침·계정 삭제 안내)
 * - {{이름}}을 docs/legal/values.json 값으로 바꾼다. 값이 비었거나 남은 {{ }}가 있으면 실패한다 (미완성 문서 공개 방지)
 * - 사용: npm run legal  (배포: .github/workflows/legal-pages.yml)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'docs/legal');
const out = join(root, '_site');

const PAGES = [
  { md: 'privacy-policy.md', html: 'privacy.html' },
  { md: 'terms.md', html: 'terms.html' },
  { md: 'account-deletion.md', html: 'account-deletion.html' },
];

const raw = JSON.parse(readFileSync(join(src, 'values.json'), 'utf8'));
const values = Object.fromEntries(Object.entries(raw).filter(([key]) => !key.startsWith('_')));
const site = values.SITE_URL.replace(/\/$/, '');
Object.assign(values, {
  PRIVACY_URL: `${site}/privacy.html`,
  TERMS_URL: `${site}/terms.html`,
  DELETION_URL: `${site}/account-deletion.html`,
});

const empty = Object.entries(values).filter(([, v]) => typeof v !== 'string' || !v.trim()).map(([k]) => k);
if (empty.length > 0) {
  console.error(`docs/legal/values.json에 비어 있는 값이 있어요: ${empty.join(', ')}`);
  process.exit(1);
}

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function fill(text, file) {
  const filled = text.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in values ? values[key] : match));
  const left = filled.match(/\{\{\w+\}\}/g);
  if (left) {
    console.error(`${file}에 채우지 못한 값이 있어요: ${[...new Set(left)].join(', ')}`);
    process.exit(1);
  }
  return filled;
}

function page(title, body) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
:root{--bg:#F8F5FF;--card:#fff;--ink:#1F1B2E;--sub:#6B7280;--line:#E9E3F5;--primary:#4C1D95;--tint:#F3E8FF}
@media (prefers-color-scheme:dark){:root{--bg:#15121F;--card:#1E1A2B;--ink:#EDE9F7;--sub:#A3A0B3;--line:#2E2840;--primary:#C4B2EC;--tint:#2A2140}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.7 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;word-break:keep-all;overflow-wrap:anywhere}
main{max-width:760px;margin:0 auto;padding:32px 16px 64px}
h1{color:var(--primary);font-size:26px;line-height:1.3;margin:0 0 16px}
h2{color:var(--primary);font-size:19px;margin:36px 0 8px;padding-top:12px;border-top:1px solid var(--line)}
a{color:var(--primary)}
table{width:100%;border-collapse:collapse;font-size:14px;margin:8px 0;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:8px;text-align:left;vertical-align:top;background:var(--card);min-width:6.5em;overflow-wrap:normal}
th{background:var(--tint)}
ul,ol{padding-left:22px}
footer{margin-top:48px;color:var(--sub);font-size:13px}
</style>
</head>
<body><main>
${body}
<footer>© 2026. 일사천리 · 공강메이트 운영팀 · <a href="mailto:${escapeHtml(values.CONTACT_EMAIL)}">${escapeHtml(values.CONTACT_EMAIL)}</a></footer>
</main></body>
</html>
`;
}

mkdirSync(out, { recursive: true });
const links = [];
for (const { md, html } of PAGES) {
  const text = fill(readFileSync(join(src, md), 'utf8'), md);
  const title = (text.match(/^#\s+(.+)$/m) ?? [, '공강메이트'])[1].trim();
  writeFileSync(join(out, html), page(title, marked.parse(text, { gfm: true })));
  links.push(`- [${title}](${html})`);
  console.log(`_site/${html}`);
}
writeFileSync(join(out, 'index.html'), page('공강메이트', marked.parse(`# 공강메이트\n\n${links.join('\n')}\n`)));
writeFileSync(join(out, '.nojekyll'), '');
