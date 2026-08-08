import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const run = script => execFileSync(process.execPath, [script], {
  cwd: root,
  stdio: 'inherit',
});

run('scripts/build-site.mjs');
run('scripts/validate-site.mjs');

const firstBuild = readFileSync(resolve(root, 'index.html'));
run('scripts/build-site.mjs');
const secondBuild = readFileSync(resolve(root, 'index.html'));

if (!firstBuild.equals(secondBuild)) {
  throw new Error('The site generator is not reproducible. Two consecutive builds produced different index.html files.');
}

console.log('Site build, validation, and reproducibility checks passed.');
