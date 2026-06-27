import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const envPath = path.resolve('../../artifacts/api-server/.env');
if (!fs.existsSync(envPath)) {
  console.error('.env not found at', envPath);
  process.exit(1);
}
const raw = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx);
  let value = trimmed.slice(idx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}
if (!env.DATABASE_URL) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}
process.env.DATABASE_URL = env.DATABASE_URL;

console.log('Running: pnpm exec drizzle-kit push --config ./drizzle.config.ts');
const res = spawnSync('pnpm', ['exec', 'drizzle-kit', 'push', '--config', './drizzle.config.ts'], { stdio: 'inherit', cwd: path.resolve('.') });
if (res.error) {
  console.error('Failed to run drizzle-kit:', res.error);
  process.exit(1);
}
process.exit(res.status ?? 0);
