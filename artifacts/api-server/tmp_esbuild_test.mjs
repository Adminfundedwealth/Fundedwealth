import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
const artifactDir = path.dirname(fileURLToPath(new URL('./build.mjs', import.meta.url)));
const entry = path.resolve(artifactDir,'src/index.ts');
const outdir = path.resolve(artifactDir,'dist-test');
console.log('entry', entry);
console.log('outdir', outdir);
try {
  await build({
    entryPoints:[entry],
    platform:'node',
    bundle:true,
    format:'esm',
    outdir,
    outExtension:{'.js':'.mjs'},
    sourcemap:'linked',
  });
  console.log('build succeeded');
} catch (err) {
  console.error('build failed', err);
  process.exit(1);
}
