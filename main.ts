// SPDX-License-Identifier: MIT
// Leonida Trophy Guide — the entry program for make.fun's gta6-trophy-guide-01.
// Node 22, standard library only. It hands the guide in: it copies this
// repository's app/ (the offline guide) and screenshots/ (real renders of it)
// into the output directory and writes /output/dossier.json with the kit's
// vendored make.fun library, which the scorer rebuilds byte for byte.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory beside this file.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader gives us a writable /output; local runs use MAKEFUN_OUTPUT_DIR.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file can never leak in.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// The guide itself: plain static files, no build step, works offline.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// The screenshots: 3 or 4 real renders of the guide, the first by name the cover.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier is what the judge reads: screenshots, first-load totals and a
// capped outline of the source. The caps below are the scorer's own limits
// (reference/gate.json): at most 4 screenshots of 256 KiB, app/ at most 993
// files and 48 MiB, and the dossier text at most 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
