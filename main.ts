// Leonida Ledger's hand-in program (Node 22, standard library only).
//
// The guide itself is app/: plain static files — index.html, its modules and
// styles, and app/data/trophies.json with the 55 official trophies, each with
// a short cited guide and a few short steps. It runs offline in a browser
// with no build step and makes no network request. This program copies app/
// and screenshots/ from beside this file into /output and writes
// /output/dossier.json, the summary the judge reads, using the vendored
// make.fun library. Leave vendor/makefun-frontend.ts untouched: the scorer
// rebuilds the dossier with its own copy and requires the two to match byte
// for byte.
//
// Run it locally with `node serve.ts` to try the guide first, then:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the rest refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB, or app/ past 993 files and directories or
// 48 MiB, since app/ counts beside /output's own 1000-entry cap with its
// screenshots/ and dossier.json.
const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyTree(from, to) {
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree(join(here, 'app'), join(out, 'app'));
mkdirSync(join(out, 'screenshots'), { recursive: true });
copyTree(join(here, 'screenshots'), join(out, 'screenshots'));

writeFileSync(join(out, 'dossier.json'), buildDossier(out, dossierLimits));
