#!/usr/bin/env node
// Orquestra o orçamento de performance — PROJECT.md §10. `npm run verify` já
// builda e testa; este script builda de novo (precisa do artefato fresco
// para o size-limit e para o servidor que o Lighthouse audita) e falha
// (`process.exit(1)`) se qualquer orçamento estourar — é o que faz o job
// `bench` do CI valer de verdade em vez do placeholder `--if-present`
// (DT-011).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const isWindows = process.platform === 'win32';

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit', shell: isWindows });
}

console.log('→ next build');
run('npx', ['next', 'build']);

console.log('\n→ size-limit');
const sizeLimitJson = execFileSync(
  'npx',
  ['size-limit', '--config', 'size-limit.config.mjs', '--json'],
  { encoding: 'utf8', shell: isWindows },
);
writeFileSync('.size-limit.json', sizeLimitJson);
console.log(sizeLimitJson);
const sizeLimitResults = JSON.parse(sizeLimitJson);
const sizeLimitFailed = sizeLimitResults.some((result) => result.passed === false);

console.log('\n→ lighthouse CI (chrome do Playwright)');
process.env.CHROME_PATH = chromium.executablePath();
let lhciFailed = false;
try {
  run('npx', ['lhci', 'autorun', '--config=.lighthouserc.json']);
} catch {
  lhciFailed = true;
}

if (sizeLimitFailed || lhciFailed) {
  console.error('\n✗ orçamento de performance estourado — ver PROJECT.md §10.');
  process.exit(1);
}

console.log('\n✓ dentro do orçamento — PROJECT.md §10.');
