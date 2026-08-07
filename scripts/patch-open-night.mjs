import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(import.meta.dirname, '..', 'index.html');
let html = readFileSync(path, 'utf8');

const startMarker = 'const programme=';
const endMarker = ';\nconst state=';
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker, start);

if (start < 0 || end < 0) throw new Error('Programme data block not found in index.html.');

const jsonStart = start + startMarker.length;
const programme = JSON.parse(html.slice(jsonStart, end));
const openLevel = programme.find(level => level.id === 'open-night');
const lesson = openLevel?.lessons?.find(item => item.id === 'open-night');

if (!openLevel || !lesson) throw new Error('Open Night lesson not found in generated programme data.');

openLevel.descriptor = 'A 45-minute first Kizomba experience.';
lesson.movement = ['Basic 2', 'Basic 3', 'Balança', 'Slow marca', 'Basic 1', 'Controlled rotation'];
lesson.foundation = ['Pulse', 'Grounded stepping', 'Complete weight transfer', 'Personal balance', 'Close-hold connection'];
lesson.prerequisites = ['Complete beginners welcome'];
lesson.core = ['Basic 1', 'Basic 2', 'Basic 3 plus balança', 'Slow marca reset'];
lesson.progressing = ['Add the controlled rotation when stable', 'Change partners and restart from Basic 1'];
lesson.challenge = ['Keep transitions small and musical', 'Choose slow marca as an intentional pause and restart'];
lesson.entries = ['Begin each new partnership with Basic 1', 'Use the Basic 2 approach before close hold'];
lesson.exits = ['Use slow marca to finish, pause, or restart', 'Return to Basic 1 with a new partner'];
lesson.social = ['Start every new partner with Basic 1', 'Progress into Basic 2, Basic 3 plus balança, slow marca, and rotation'];

const data = JSON.stringify(programme).replace(/</g, '\\u003c');
html = html.slice(0, jsonStart) + data + html.slice(end);

const replacements = [
  [
    "lesson.detailed?'Detailed 60-minute plan':'Structured class plan'",
    "lesson.level===0?'Detailed 45-minute plan':lesson.detailed?'Detailed 60-minute plan':'Structured class plan'",
  ],
  [
    '<span class="badge strong">60 minutes</span>',
    "<span class=\"badge strong\">'+(lesson.level===0?'45 minutes':'60 minutes')+'</span>",
  ],
  [
    '<h2>60-minute class flow</h2>',
    "<h2>'+(lesson.level===0?'45-minute':'60-minute')+' class flow</h2>",
  ],
];

for (const [before, after] of replacements) {
  if (!html.includes(before)) throw new Error(`Expected generated-site marker not found: ${before}`);
  html = html.replace(before, after);
}

if (!html.includes('A 45-minute first Kizomba experience.')) throw new Error('Open Night descriptor patch failed.');
if (!html.includes("lesson.level===0?'45 minutes':'60 minutes'")) throw new Error('Open Night duration badge patch failed.');
if (!html.includes('Solo, balança')) throw new Error('Approved Open Night sequence is missing from the generated guide.');

writeFileSync(path, html);
console.log('Patched Open Night metadata and 45-minute display.');
