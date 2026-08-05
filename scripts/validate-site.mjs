import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const index = readFileSync(join(root, 'index.html'), 'utf8');
const lessonFiles = [
  join(root, 'classes/open-night/kizomba-open-night.md'),
  ...Array.from({ length: 8 }, (_, index) => join(root, `classes/level-1/week-${String(index + 1).padStart(2, '0')}.md`)),
];

const expectedIds = [];
for (const path of lessonFiles) {
  const markdown = readFileSync(path, 'utf8');
  const section = markdown.match(/^#{1,2} Instructor preparation references\s*$([\s\S]*?)(?=^#{1,2} |(?![\s\S]))/m)?.[1] || '';
  const ids = [...section.matchAll(/https:\/\/(?:www\.)?youtube\.com\/watch\?[^\s)\n]*v=([\w-]{11})/g)].map(match => match[1]);
  if (!ids.length) throw new Error(`${path} has no instructor video reference.`);
  expectedIds.push(...ids);
}

for (const id of expectedIds) {
  if (!index.includes(`\"id\":\"${id}\"`)) throw new Error(`index.html is missing video ${id}.`);
}

if (!index.includes('https://www.youtube-nocookie.com/embed/')) throw new Error('index.html is missing the embedded-player renderer.');
if (index.includes('const videos={')) throw new Error('index.html contains a hardcoded video map.');
if (!index.includes("const state={level:0,lesson:'open-night'}")) throw new Error('Open Night is not the default lesson.');

console.log(`Validated 17 classes and ${expectedIds.length} required video references.`);
