// Leonida Legend — GTA VI trophy guide entry (Node 22, standard library only).
//
// The guide itself is plain static files under app/ (index.html, ES modules,
// CSS and app/data/trophies.json) plus 3-4 screenshots under screenshots/.
// This program hands it in: it copies app/ and screenshots/ from beside this
// file into the output directory and writes /output/dossier.json with the
// vendored make.fun library, which is the summary the judge reads.
//
// vendor/makefun-frontend.ts is the kit's copy and must stay unchanged: the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, MAKEFUN_OUTPUT_DIR is unset and /output is used.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyFresh(sourceName: string): void {
  const source = join(repoRoot, sourceName);
  const target = join(outputDir, sourceName);
  if (!existsSync(source)) return;
  rmSync(target, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyFresh('app');
copyFresh('screenshots');

// The gate's own caps for this bounty: at most 4 screenshots of 256 KiB,
// at most 993 files and 48 MiB under app/, dossier text at most 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Leonida Legend handed in to ${outputDir} (dossier ${dossier.length} bytes)`);
