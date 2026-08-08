import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const productionUrl = 'https://the-tribe-kizomba-course.vercel.app/';
const local = readFileSync(resolve(import.meta.dirname, '..', 'index.html'));
const response = await fetch(`${productionUrl}?verify=${Date.now()}`, {
  cache: 'no-store',
  headers: { 'cache-control': 'no-cache' },
});

if (!response.ok) {
  throw new Error(`Production returned ${response.status} ${response.statusText}.`);
}

const deployed = Buffer.from(await response.arrayBuffer());
const digest = value => createHash('sha256').update(value).digest('hex');
const localHash = digest(local);
const deployedHash = digest(deployed);

if (!local.equals(deployed)) {
  throw new Error(`Production does not match index.html. Local SHA-256: ${localHash}. Production SHA-256: ${deployedHash}.`);
}

console.log(`Production matches index.html exactly. SHA-256: ${localHash}.`);
