#!/usr/bin/env node
/**
 * sync-master-doc — mantém o PROJECT.md vivo.
 *
 * Reescreve APENAS o conteúdo entre marcadores <!-- AUTO:nome:start --> e
 * <!-- AUTO:nome:end -->. Tudo fora dos marcadores é território humano e nunca
 * é tocado.
 *
 * Toda região degrada para "pendente" quando sua fonte ainda não existe, para
 * que o script rode desde o primeiro dia do projeto sem quebrar.
 *
 * Uso:
 *   node scripts/sync-master-doc.mjs           reescreve o PROJECT.md
 *   node scripts/sync-master-doc.mjs --check   falha (exit 1) se estiver defasado
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOC = join(ROOT, 'PROJECT.md');
const PENDING = '_pendente_';

const CHECK_ONLY = process.argv.includes('--check');

/* ── utilidades ──────────────────────────────────────────────────────────── */

const p = (...s) => join(ROOT, ...s);

function readFile(relPath) {
  const full = p(relPath);
  return existsSync(full) ? readFileSync(full, 'utf8') : null;
}

function readJson(relPath) {
  const raw = readFile(relPath);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Executa git sem deixar o script morrer quando não há repositório. */
function git(...args) {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

/* ── regiões ─────────────────────────────────────────────────────────────── */

function buildUpdated() {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  const commit = git('rev-parse', '--short', 'HEAD') ?? '—';
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD') ?? '—';
  return [
    '| Última sincronização | Commit | Branch |',
    '|---|---|---|',
    `| ${stamp} | \`${commit}\` | \`${branch}\` |`,
  ].join('\n');
}

/**
 * Conta setores e links direto do registry.
 *
 * Formato esperado em src/content/links.ts:
 *   export const sectors = [
 *     { slug: 'marketing', name: 'Marketing', status: 'active',
 *       links: [{ title: '…', href: 'https://…' }] },
 *   ]
 *
 * A contagem é textual de propósito: evita precisar compilar TypeScript só
 * para atualizar documentação. O schema Zod é quem garante a forma real.
 */
function buildOverview() {
  const src = readFile('src/content/links.ts');
  if (src === null) {
    return [
      '| Setores | Setores ativos | Links | Domínios distintos |',
      '|---|---|---|---|',
      `| ${PENDING} | ${PENDING} | ${PENDING} | ${PENDING} |`,
    ].join('\n');
  }

  const sectors = (src.match(/^\s*slug:\s*'/gm) ?? []).length;
  const active = (src.match(/status:\s*'active'/g) ?? []).length;

  // Uma URL pode ser compartilhada por vários setores através de uma constante
  // (o Portal de Chamados é o caso). Resolvemos essas ligações antes de contar,
  // senão os links por referência somem da contagem.
  const bindings = new Map(
    [...src.matchAll(/^const\s+([A-Z][A-Z0-9_]*)\s*=\s*\n?\s*'(https:\/\/[^']+)'/gm)].map((m) => [
      m[1],
      m[2],
    ]),
  );

  const hrefs = [...src.matchAll(/href:\s*(?:'(https:\/\/[^']+)'|([A-Z][A-Z0-9_]*))\s*,/g)]
    .map((m) => m[1] ?? bindings.get(m[2]))
    .filter(Boolean);

  const domains = new Set(
    hrefs.map((href) => {
      try {
        return new URL(href).hostname;
      } catch {
        return href;
      }
    }),
  );

  return [
    '| Setores | Setores ativos | Links | Domínios distintos |',
    '|---|---|---|---|',
    `| ${sectors} | ${active} | ${hrefs.length} | ${domains.size} |`,
  ].join('\n');
}

function buildStack() {
  const pkg = readJson('package.json');
  if (pkg === null) {
    return `${PENDING} — rode \`npm run doc:sync\` após instalar as dependências.`;
  }

  const deps = { ...(pkg.dependencies ?? {}) };
  const devDeps = { ...(pkg.devDependencies ?? {}) };
  const nvmrc = readFile('.nvmrc');

  const rows = [];
  const push = (name, version, kind) =>
    rows.push(`| \`${name}\` | ${version.replace(/^[\^~]/, '')} | ${kind} |`);

  for (const [name, version] of Object.entries(deps).sort()) {
    push(name, version, 'runtime');
  }
  for (const [name, version] of Object.entries(devDeps).sort()) {
    push(name, version, 'dev');
  }

  const runtimeCount = Object.keys(deps).length;

  return [
    nvmrc ? `**Node:** ${nvmrc.trim()}\n` : '',
    `**Dependências de runtime:** ${runtimeCount}` +
      (runtimeCount > 3
        ? ' ⚠️ acima do teto de 3 definido na seção Stack — justifique no ADR.'
        : ' (dentro do teto do projeto)'),
    '',
    '| Pacote | Versão | Escopo |',
    '|---|---|---|',
    ...rows,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Progresso derivado dos próprios checkboxes das fases, na seção 5. */
function buildProgress(doc) {
  const section = doc.slice(
    doc.indexOf('## 5. Cronograma de fases'),
    doc.indexOf('## 6. Inventário de conteúdo'),
  );
  if (!section) return PENDING;

  const done = (section.match(/^- \[x\]/gim) ?? []).length;
  const total = done + (section.match(/^- \[ \]/gm) ?? []).length;
  if (total === 0) return PENDING;

  const pct = Math.round((done / total) * 100);
  const filled = Math.round(pct / 5);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);

  return `\`${bar}\` **${pct}%** — ${done} de ${total} itens concluídos`;
}

function buildTests() {
  const summary = readJson('coverage/coverage-summary.json');
  if (summary?.total === undefined) {
    return `${PENDING} — rode \`npm run test:unit -- --coverage\` e depois \`npm run doc:sync\`.`;
  }

  const { lines, branches, functions, statements } = summary.total;
  const gate = (value, threshold) =>
    `${value.pct.toFixed(1)}% ${value.pct >= threshold ? '✅' : '❌'}`;

  return [
    '| Métrica | Cobertura | Limiar |',
    '|---|---|---|',
    `| Linhas | ${gate(lines, 85)} | 85% |`,
    `| Branches | ${gate(branches, 90)} | 90% |`,
    `| Funções | ${gate(functions, 85)} | 85% |`,
    `| Statements | ${gate(statements, 85)} | 85% |`,
  ].join('\n');
}

function buildBench() {
  const lhci = readJson('.lighthouseci/manifest.json');
  const sizeLimit = readJson('.size-limit.json');

  const blocks = [];

  if (Array.isArray(lhci) && lhci.length > 0) {
    const run = lhci.find((r) => r.isRepresentativeRun) ?? lhci[0];
    const s = run.summary ?? {};
    const score = (value, threshold) => {
      if (typeof value !== 'number') return '—';
      const pts = Math.round(value * 100);
      return `${pts} ${pts >= threshold ? '✅' : '❌'}`;
    };
    blocks.push(
      [
        '| Categoria Lighthouse | Pontuação | Orçamento |',
        '|---|---|---|',
        `| Performance | ${score(s.performance, 98)} | ≥ 98 |`,
        `| Acessibilidade | ${score(s.accessibility, 100)} | 100 |`,
        `| Boas práticas | ${score(s['best-practices'], 95)} | ≥ 95 |`,
      ].join('\n'),
    );
  }

  if (Array.isArray(sizeLimit) && sizeLimit.length > 0) {
    blocks.push(
      [
        '',
        '| Bundle | Tamanho | Orçamento |',
        '|---|---|---|',
        ...sizeLimit.map((entry) => {
          const kb = (entry.size / 1024).toFixed(1);
          const ok = entry.passed !== false ? '✅' : '❌';
          return `| ${entry.name} | ${kb} KB ${ok} | ${entry.sizeLimit ?? '—'} |`;
        }),
      ].join('\n'),
    );
  }

  if (blocks.length === 0) {
    return `${PENDING} — rode \`npm run bench\` e depois \`npm run doc:sync\`.`;
  }
  return blocks.join('\n');
}

function buildChangelog() {
  if (git('rev-parse', '--is-inside-work-tree') === null) {
    return `${PENDING} — repositório git ainda não inicializado.`;
  }

  const lastTag = git('describe', '--tags', '--abbrev=0');
  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  const log = git('log', range, '--no-merges', '--date=short', '--pretty=%ad|%h|%s', '-n', '40');

  if (!log) {
    return lastTag
      ? `Nenhuma mudança desde a tag \`${lastTag}\`.`
      : 'Nenhum commit registrado ainda.';
  }

  const header = lastTag ? `Desde a tag \`${lastTag}\`:\n` : 'Histórico completo:\n';

  const rows = log.split('\n').map((line) => {
    const [date, hash, ...rest] = line.split('|');
    return `| ${date} | \`${hash}\` | ${rest.join('|')} |`;
  });

  return [header, '| Data | Commit | Descrição |', '|---|---|---|', ...rows].join('\n');
}

/* ── aplicação ───────────────────────────────────────────────────────────── */

function replaceRegion(doc, name, content) {
  const start = `<!-- AUTO:${name}:start -->`;
  const end = `<!-- AUTO:${name}:end -->`;
  const startIdx = doc.indexOf(start);
  const endIdx = doc.indexOf(end);

  if (startIdx === -1 || endIdx === -1) {
    console.warn(`⚠️  região AUTO:${name} não encontrada no PROJECT.md — ignorada`);
    return doc;
  }
  if (endIdx < startIdx) {
    throw new Error(`região AUTO:${name} tem marcadores invertidos no PROJECT.md`);
  }

  return doc.slice(0, startIdx + start.length) + '\n' + content + '\n' + doc.slice(endIdx);
}

function main() {
  if (!existsSync(DOC)) {
    console.error(
      '✖ PROJECT.md não encontrado. Este script existe para mantê-lo, não para criá-lo.',
    );
    process.exit(1);
  }

  const original = readFileSync(DOC, 'utf8');
  let doc = original;

  // progress lê os checkboxes do documento atual, então é calculado antes.
  const regions = {
    updated: buildUpdated(),
    overview: buildOverview(),
    stack: buildStack(),
    progress: buildProgress(original),
    tests: buildTests(),
    bench: buildBench(),
    changelog: buildChangelog(),
  };

  for (const [name, content] of Object.entries(regions)) {
    doc = replaceRegion(doc, name, content);
  }

  if (CHECK_ONLY) {
    // A data de sincronização muda a cada execução; compará-la faria o check
    // falhar sempre. Ignoramos apenas essa linha.
    const stripStamp = (text) =>
      text.replace(/\| \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC \|/g, '| <stamp> |');

    if (stripStamp(doc) !== stripStamp(original)) {
      console.error(
        '✖ PROJECT.md está defasado.\n' +
          '  Rode `npm run doc:sync` e inclua o resultado no commit.',
      );
      process.exit(1);
    }
    console.log('✓ PROJECT.md está sincronizado.');
    return;
  }

  if (doc === original) {
    console.log('✓ PROJECT.md já estava atualizado.');
    return;
  }

  writeFileSync(DOC, doc, 'utf8');
  console.log(`✓ PROJECT.md sincronizado (${Object.keys(regions).length} regiões).`);
}

main();
