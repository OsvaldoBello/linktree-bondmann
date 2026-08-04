# PROJECT.md — Linktree Bondmann

> **Este é o documento mestre do projeto.** Ele é o norte permanente para qualquer pessoa ou agente que trabalhe neste repositório.
>
> **Leia antes de alterar qualquer coisa. Atualize ao terminar.**
>
> Blocos marcados com `<!-- AUTO:… -->` são gerados por `npm run doc:sync` — **não edite à mão**, suas alterações serão sobrescritas. Todo o resto é mantido por humanos e agentes, e é obrigatório mantê-lo verdadeiro.

<!-- AUTO:updated:start -->
| Última sincronização | Commit | Branch |
|---|---|---|
| 2026-08-04 18:11 UTC | `38e675e` | `feat/f2-registry-links` |
<!-- AUTO:updated:end -->

---

## Índice

1. [Visão e escopo](#1-visão-e-escopo)
2. [Identidade visual](#2-identidade-visual)
3. [Stack](#3-stack)
4. [Arquitetura](#4-arquitetura)
5. [Cronograma de fases](#5-cronograma-de-fases)
6. [Inventário de conteúdo](#6-inventário-de-conteúdo)
7. [Segurança da aplicação](#7-segurança-da-aplicação)
8. [Segurança de CI/CD e cadeia de suprimentos](#8-segurança-de-cicd-e-cadeia-de-suprimentos)
9. [Testes](#9-testes)
10. [Benchmarks e orçamento de performance](#10-benchmarks-e-orçamento-de-performance)
11. [Registro de decisões (ADR)](#11-registro-de-decisões-adr)
12. [Débito técnico](#12-débito-técnico)
13. [Changelog](#13-changelog)
14. [Runbook](#14-runbook)
15. [Como manter este documento vivo](#15-como-manter-este-documento-vivo)

---

## 1. Visão e escopo

### Problema

A Bondmann Química distribui hoje seus links operacionais — formulários Ploomes, planilhas SharePoint, dashboards, Google Forms, portal de chamados — por documentos Word e mensagens avulsas. Consequências: links desatualizados circulando, versões divergentes do mesmo formulário, e nenhum ponto único de verdade sobre "qual é o link certo".

### Solução

Um agregador de links próprio da Bondmann — no espírito do Linktree — com a identidade visual oficial da marca, organizado por **setor**. A home lista os setores; cada setor abre uma tela com seus links.

### Escopo

**Dentro:** site estático, público mas não indexável, hospedado na Vercel. Navegação em dois níveis (home → setor). Busca na home, client-side, sobre o registry já embutido na página ([ADR-021](#adr-021--busca-client-side-na-home-entra-no-escopo)). Conteúdo versionado no repositório.

**Fora (não construir sem nova decisão registrada aqui):** autenticação, painel administrativo, banco de dados, API, favoritos, cookies, qualquer coleta de dado pessoal.

<!-- AUTO:overview:start -->
| Setores | Setores ativos | Links | Domínios distintos |
|---|---|---|---|
| 7 | 6 | 35 | 8 |
<!-- AUTO:overview:end -->

### Princípios de design do projeto

1. **O registry é a fonte única de verdade.** Todo link vive em `src/content/links.ts`. Nada de URL solta em componente.
2. **Errado não compila.** Validações (HTTPS, allowlist de domínio, slug único) rodam em build. Um link ruim não chega a produção.
3. **Superfície mínima.** Sem backend, sem cookies, sem terceiros. O que não existe não pode ser atacado.
4. **Regra virada em teste.** Convenções que dependem de disciplina humana apodrecem. Contraste, `rel` seguro e safe-area do logo são testes automatizados.

---

## 2. Identidade visual

Fonte: *Bondmann Química — Manual de Utilização e Aplicação de Marca* (Novo Design Brasil, julho/2014), 44 páginas.

### Padrão cromático oficial (pág. 4 do manual)

| Token | Pantone | CMYK | RGB | Hex (tela) | Hex (impressão) |
|---|---|---|---|---|---|
| `--bond-navy` | 2955 C | 100:70:20:30 | 46, 70, 111 | `#2E466F` | `#2E466F` |
| `--bond-green` | 367 C | 45:0:75:0 | 172, 199, 107 | `#99C76B` | `#ACC76B` |

O manual converte o Pantone 367 C para `#ACC76B`, mas o arquivo vetorial oficial do logotipo usa `#99C76B`. Conversões Pantone→RGB variam conforme o perfil de cor; para tela, **o ativo vetorial é a referência**, para que logo e interface nunca exibam dois verdes distintos lado a lado. Ver [ADR-001](#adr-001--verde-de-tela-99c76b-em-vez-de-acc76b).

### Regra de contraste — não negociável

`#99C76B` sobre branco tem contraste **≈ 2.0:1**. Reprova WCAG 2.2 AA para texto (mínimo 4.5:1). Portanto:

| Uso do verde | Permitido? |
|---|---|
| Fundo de bloco, card ou seção | ✅ |
| Borda, divisor, barra de destaque | ✅ |
| Logo e ícones decorativos | ✅ |
| Textura de fundo em baixa opacidade | ✅ |
| **Texto sobre fundo claro** | ❌ **proibido** |
| Texto navy sobre fundo verde (≈ 5.2:1) | ✅ |
| Texto verde sobre fundo navy (≈ 5.2:1, mesmo par, ordem invertida — ver [ADR-015](#adr-015--fundo-navy-texto-verde-e-tipografia-sem-itálico)) | ✅ |

A regra continua sendo sobre **fundo claro**: desde o redesenho da ADR-015 o fundo da página é navy (escuro), e é nesse fundo que o texto e o logo aparecem em verde. Dentro dos cards — que continuam brancos — o texto continua navy; verde nunca é cor de texto ali.

Garantido por teste automatizado em `src/lib/contrast.test.ts` — qualquer par token/token usado na interface é verificado contra WCAG AA.

### Logotipo

`public/brand/logo.svg` — símbolo de seis anéis em arranjo hexagonal, `viewBox="0 0 1582.88 1742.56"`. Importado com `fill="currentColor"`, permitindo renderizar em verde, navy ou branco conforme o fundo.

Regras do manual traduzidas em código:

- **Área de não-interferência:** equivale à altura de **duas letras "B" maiúsculas** de "BONDMANN" no manual. O `<Logo>` renderiza só o símbolo (sem wordmark), então o token `--logo-safe-area` (`0.3em`, padding obrigatório, não sobrescrevível por prop) é uma aproximação proporcional, não a medida exata do manual — ver [ADR-012](#adr-012--safe-area-do-logo-como-fração-proporcional-em-vez-de-medida-do-manual) e [DT-014](#12-débito-técnico).
- **Redução mínima:** 25 mm (vertical) / 20 mm (horizontal) com byline; 20 / 15 mm sem byline. Traduzida para `--logo-min-height: 20mm` (unidade `mm` do CSS, conversão exata para px) no componente; a largura segue via `aspect-ratio`, sempre acima do piso de 15mm. Não sobrescrevível por prop.
- **Textura de fundo:** o próprio símbolo, ampliado e em baixa opacidade, via `<PatternBackground>` — sempre `aria-hidden`, nunca em tamanho que compita com o logo legível.

### Tipografia

O manual (pág. 3) especifica **Info Book Italic** para títulos e textos principais, e **Info Text / Info Display Book Italic** para subtítulos e textos secundários. A família Info é comercial e não possui webfont livre.

**Substituta adotada: Fira Sans** — projetada por Erik Spiekermann, o mesmo designer da família Info, gratuita e com itálico completo. É o proxy mais fiel disponível. Ver [ADR-002](#adr-002--fira-sans-como-proxy-da-família-info).

O itálico do manual (Info Book Italic) foi usado nos títulos até o redesenho da F3/F4, mas foi **removido** no redesenho de 2026-07-27 em favor de uma tipografia mais simples — só o estilo `normal` é carregado agora. Ver [ADR-015](#adr-015--fundo-navy-texto-verde-e-tipografia-sem-itálico).

Servida via `next/font` com self-hosting — nenhuma requisição ao Google em runtime.

### Paleta de sub-marcas (referência, não usar)

O manual define cores próprias para as sub-marcas AUTO, FLUID, INDUSTRY, MAX SERVICE e CLEAN MAX, extraídas do PDF: `#38B2E6`, `#27BAA5`, `#F05876`, `#F68A28`, `#4A5EAA`.

**Não aplicar a setores.** Setores são departamentos, não sub-marcas; usar essas cores criaria uma associação falsa. Registrado apenas para o caso de o projeto vir a exibir produtos.

---

## 3. Stack

<!-- AUTO:stack:start -->
**Node:** 24

**Dependências de runtime:** 3 (dentro do teto do projeto)
| Pacote | Versão | Escopo |
|---|---|---|
| `next` | 16.2.12 | runtime |
| `react` | 19.2.8 | runtime |
| `react-dom` | 19.2.8 | runtime |
| `@axe-core/playwright` | 4.12.1 | dev |
| `@eslint/js` | 9.39.5 | dev |
| `@lhci/cli` | 0.15.1 | dev |
| `@playwright/test` | 1.62.0 | dev |
| `@size-limit/file` | 13.0.1 | dev |
| `@tailwindcss/postcss` | 4.3.3 | dev |
| `@testing-library/dom` | 10.4.1 | dev |
| `@testing-library/jest-dom` | 7.0.0 | dev |
| `@testing-library/react` | 16.3.2 | dev |
| `@testing-library/user-event` | 14.6.1 | dev |
| `@types/node` | 26.1.1 | dev |
| `@types/react` | 19.2.17 | dev |
| `@types/react-dom` | 19.2.3 | dev |
| `@vitejs/plugin-react` | 6.0.4 | dev |
| `@vitest/coverage-v8` | 4.1.10 | dev |
| `eslint` | 9.39.5 | dev |
| `eslint-config-next` | 16.2.12 | dev |
| `eslint-config-prettier` | 10.1.8 | dev |
| `eslint-plugin-security` | 4.0.1 | dev |
| `jsdom` | 30.0.0 | dev |
| `playwright-core` | 1.62.0 | dev |
| `postcss` | 8.5.23 | dev |
| `prettier` | 3.9.6 | dev |
| `size-limit` | 13.0.1 | dev |
| `tailwindcss` | 4.3.3 | dev |
| `typescript` | 5.9.3 | dev |
| `typescript-eslint` | 8.65.0 | dev |
| `vitest` | 4.1.10 | dev |
| `zod` | 4.4.3 | dev |
<!-- AUTO:stack:end -->

### Justificativa das escolhas

| Camada | Escolha | Porquê |
|---|---|---|
| Framework | Next.js (App Router) + React | Geração estática, headers de segurança nativos, integração de primeira classe com a Vercel |
| Linguagem | TypeScript `strict` + `noUncheckedIndexedAccess` | O registry de links é tipado ponta a ponta |
| Estilo | Tailwind CSS v4 + CSS custom properties | Tokens do manual viram variáveis; sem CSS-in-JS em runtime |
| Validação | Zod | Valida o registry em build; link inválido quebra o build |
| Testes unitários | Vitest + React Testing Library | Rápido, mesmo transformer do Vite |
| E2E e a11y | Playwright + `@axe-core/playwright` | Navegação real, auditoria WCAG 2.2 AA |
| Benchmark | Lighthouse CI + size-limit | Orçamento de performance que falha o CI |
| Hospedagem | Vercel | Definido pelo projeto; preview por PR e rollback instantâneo |

**Restrições permanentes:** nenhuma dependência de runtime além de React/Next. Toda biblioteca nova exige uma entrada no [ADR](#11-registro-de-decisões-adr) justificando o custo em bundle e em superfície de ataque.

---

## 4. Arquitetura

```
PROJECT.md                    ← este documento (norte do projeto)
CLAUDE.md                     ← ponteiro curto para cá
dev.bat                       ← sobe o site localmente (duplo clique)
eslint.config.mjs             ← flat config + eslint-plugin-security
vitest.config.ts              ← unitários, jsdom, cobertura
playwright.config.ts          ← E2E e axe, contra o build de produção
postcss.config.mjs            ← Tailwind v4
scripts/
  sync-master-doc.mjs         ← motor de auto-atualização deste documento
  validate-links.ts           ← valida o registry fora do build (Node 24 roda TS nativo)
  generate-favicon.mjs        ← gera public/favicon.ico a partir da geometria de icon.svg
.claude/settings.json         ← hook Stop → doc:sync
.github/
  workflows/ci.yml            ← verify + doc-drift + e2e + bench (placeholder até F5/F10) + audit
  workflows/security.yml      ← CodeQL + Semgrep + gitleaks + zizmor + dependency-review
  workflows/release.yml       ← SBOM + attestation
  workflows/dependabot-auto-merge.yml ← auto-merge de patch do Dependabot, gated por CI verde
  workflows/link-health.yml   ← checagem semanal dos links (chega na F7)
  dependabot.yml
next.config.ts                ← cabeçalhos de segurança
src/
  app/
    layout.tsx                ← shell, fontes, metadata noindex
    icon.svg                  ← favicon (símbolo verde sobre placa navy — convenção App Router)
    page.tsx                  ← home: grade de setores
    setor/[slug]/page.tsx     ← tela de setor (estática)
    not-found.tsx
  content/
    links.ts                  ← REGISTRY: fonte única de verdade
  lib/
    links-schema.ts           ← Zod + allowlist + denylist
    contrast.ts               ← cálculo de contraste WCAG
    search.ts                 ← ranking da busca (puro, sem dependência)
  components/
    Logo.tsx                  ← safe-area e tamanho mínimo do manual
    PatternBackground.tsx
    PageShell.tsx
    SectorCard.tsx
    LinkButton.tsx            ← rel seguro obrigatório
    LinkSearch.tsx            ← ÚNICA ilha cliente ('use client') — ADR-021
  styles/tokens.css           ← tokens do manual
e2e/                          ← specs do Playwright
public/brand/                 ← logo.svg
public/favicon.ico            ← fallback do favicon, gerado e commitado (ADR-020)
```

### Fluxo de dados

`links.ts` → validado por `links-schema.ts` em build → consumido por `page.tsx` (home) e `setor/[slug]/page.tsx` via `generateStaticParams`. Tudo pré-renderizado; nenhuma requisição em runtime.

A busca não muda esse fluxo: `<LinkSearch>` recebe o mesmo `sectors` por prop, já validado em build, e filtra em memória no navegador com `lib/search.ts`. Continua sem requisição em runtime — o índice é a própria página ([ADR-021](#adr-021--busca-client-side-na-home-entra-no-escopo)).

### Convenções

- Componentes são Server Components por padrão. `'use client'` exige justificativa em comentário. Hoje há **uma** ilha cliente no projeto (`<LinkSearch>`); a lista de setores continua renderizada no servidor e entra nela como `children`.
- Slugs de setor são gerados no registry e imutáveis — mudá-los quebra links compartilhados. Renomear exige entrada no ADR e um redirect.
- A ordem do array `sectors` é a ordem exibida na home, e é **alfabética por nome** (`localeCompare` pt-BR) — travada por teste em `src/content/links.test.ts`. Ver [ADR-019](#adr-019--ordem-alfabética-no-registry-e-textura-de-fundo-ancorada-no-viewport).
- Nenhum componente recebe URL por prop arbitrária; sempre um objeto `Link` já validado.

---

## 5. Cronograma de fases

Progresso: marque `[x]` ao concluir. O gate de saída é obrigatório — uma fase não fecha sem ele.

<!-- AUTO:progress:start -->
`██████████████████░░` **88%** — 29 de 33 itens concluídos
<!-- AUTO:progress:end -->

### F0 — Fundação
- [x] `git init`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.nvmrc`
- [x] Next.js + TypeScript strict + Tailwind v4
- [x] ESLint (flat) + Prettier + `eslint-plugin-security`
- [x] Vitest + Playwright configurados
- [x] **`PROJECT.md` + `scripts/sync-master-doc.mjs` + hook `.claude/settings.json`**
- [x] `npm run verify` agregando typecheck, lint, formatação, testes e build
- [x] `dev.bat` — sobe o site localmente para teste com duplo clique, sem terminal

**Gate:** `npm run verify` verde e `doc-drift` passando. ✅ **concluída em 2026-07-27**

### F0.5 — Hardening do pipeline
- [x] Workflows com `permissions: contents: read` no topo
- [x] Todas as actions pinadas por SHA completo
- [x] gitleaks, CodeQL, Semgrep, zizmor
- [x] Dependabot (npm + github-actions), `npm ci --ignore-scripts`
- [x] Proteção de `main`: checks obrigatórios, revisão, commits assinados, histórico linear
- [x] SBOM CycloneDX + `attest-build-provenance`

**Gate:** zizmor sem achados; branch protection ativa; CodeQL e gitleaks limpos. ✅ **concluída em 2026-07-27** — `zizmor --persona=pedantic` (offline e online) roda zero achados contra os workflows ([ADR-009](#adr-009--gitleaks-semgrep-e-zizmor-via-cli-fixada-em-vez-de-actions-de-terceiros)); repositório criado em [github.com/OsvaldoBello/linktree-bondmann](https://github.com/OsvaldoBello/linktree-bondmann) ([DT-010](#12-débito-técnico) resolvido — ficou **público**, decisão do usuário, para viabilizar branch protection sem GitHub Pro); `main` protegida com os 10 checks obrigatórios, 1 revisão, commits assinados, histórico linear e regra válida também para administradores; CodeQL e gitleaks rodaram verdes no push inicial. Dois bugs só visíveis em execução real (Semgrep exigindo métricas com `--config auto`; `doc:check` comparando contra um commit que ainda não existia) corrigidos no [PR #4](https://github.com/OsvaldoBello/linktree-bondmann/pull/4) — ver ADR-011.

### F1 — Design system
- [x] `tokens.css` com o padrão cromático do manual
- [x] Fira Sans via `next/font` (self-hosted)
- [x] `<Logo>` com safe-area e tamanho mínimo do manual
- [x] `<PatternBackground>`, `<PageShell>`, `<SectorCard>`, `<LinkButton>`
- [x] Teste automatizado de contraste WCAG AA

**Gate:** teste de contraste passando; cobertura ≥ 90% nos componentes. ✅ **concluída em 2026-07-27** — `src/lib/contrast.ts` reproduz a fórmula WCAG 2.2 e trava os pares do §2 (navy/branco, branco/navy e navy/verde passam AA; verde/branco reprova, ≈2.0:1, pinado por teste); `src/components/` (Logo, PatternBackground, PageShell, SectorCard, LinkButton) com 100% de cobertura, acima do piso de 90%. `<Logo>` não expõe `className`/`style` — safe-area e tamanho mínimo do manual não são sobrescrevíveis por prop, só por union fechado (`color`/`size`) com fallback seguro para valor hostil. Ver [ADR-012](#adr-012--safe-area-do-logo-como-fração-proporcional-em-vez-de-medida-do-manual) e [DT-014](#12-débito-técnico).

### F2 — Registry de links
- [x] `src/content/links.ts` com os 7 setores e 35 links (RH saiu de "em breve" — 7 links adicionados pelo usuário em 2026-07-27; Dashboard Comercial adicionado ao Comercial em 2026-07-28; os 5 GPTs da AlquimIA substituíram o hub único do Depto. Químico em 2026-08-04, [ADR-025](#adr-025--gpts-da-alquimia-direto-no-registry-chatgptcom-na-allowlist-linktree-fora))
- [x] `links-schema.ts`: HTTPS obrigatório, allowlist de domínios, denylist de encurtadores, slug único
- [x] `npm run validate:links`
- [x] Confirmar qual Google Form é *Feedback* e qual é *Alteração de Campanha* ([DT-002](#12-débito-técnico))

**Gate:** build falha com URL `http://`, domínio fora da allowlist ou slug duplicado. ✅ **concluída em 2026-07-27** — `src/lib/links-schema.ts` (Zod) valida a cada import de `sectors` (build, testes e `npm run validate:links` standalone), travando protocolo, allowlist, denylist e slug/id únicos; 10 testes cobrindo cada regra de rejeição. Setores ativos: 6 de 7 (só Controladoria segue "em breve" — [DT-001](#12-débito-técnico)). Novo domínio `forms.cloud.microsoft` (formulários RH) entrou na allowlist.

### F3 — Home de setores
- [x] Lista vertical responsiva mobile-first com os 7 setores (padrão Linktree — ver [ADR-014](#adr-014--redesenho-visual-lista-vertical-estilo-linktree-em-vez-de-grade))
- [x] Estado "Em breve" para Controladoria (não focável como link)

**Gate:** E2E confirma 7 cards, 1 desabilitado. ✅ **concluída em 2026-07-27**, redesenhada em 2026-07-27 — `src/app/page.tsx` deixou de ser o placeholder da F0 ([DT-009](#12-débito-técnico) resolvido): agora usa `<PageShell>` e renderiza `<SectorCard>` para os 7 setores. A grade `grid-cols-1 sm:grid-cols-2` original foi substituída por uma lista vertical de coluna única (mesmo padrão em todas as larguras de tela) no redesenho visual — ver ADR-014. RH virou setor ativo na F2, então só Controladoria segue "em breve" — o item do cronograma e o gate foram atualizados para refletir isso (o texto original, escrito antes da F2, ainda citava RH). `e2e/navigation.spec.ts` deriva as contagens de ativos/"em breve" direto de `sectors`, então o teste não fica desatualizado se um setor mudar de estado.

Em 2026-07-28 a home ganhou um **campo de busca** acima da lista, a pedido do usuário: com a busca vazia a tela é exatamente a descrita acima; com busca, a lista de setores dá lugar aos links mais próximos, de qualquer setor. Mudança de escopo — ver [ADR-021](#adr-021--busca-client-side-na-home-entra-no-escopo).

### F4 — Telas de setor
- [x] Rota estática `/setor/[slug]` via `generateStaticParams`
- [x] Lista de links, navegação de volta, 404 para slug inválido

**Gate:** E2E percorre home → setor → link externo com `rel` seguro. ✅ **concluída em 2026-07-27** — `src/app/setor/[slug]/page.tsx` gera as 7 rotas em build (`generateStaticParams`), inclusive a de Controladoria (ver [ADR-013](#adr-013--rota-estática-de-setor-em-breve-gerada-em-vez-de-404)); slug fora do registry cai no `notFound()` do Next, resolvido por `src/app/not-found.tsx` (novo). `e2e/navigation.spec.ts` cobre o percurso completo, o 404 e axe em ambas as telas.

Achado durante a auditoria de axe desta fase: `<SectorCard>` e `<LinkButton>` (ambos da F1) aplicavam `text-bond-navy/70` no texto secundário — 4.11:1, abaixo do piso AA de 4.5:1 do §2, só ficou visível agora porque a F1 não tinha rota real para o Playwright auditar. Trocado por `text-bond-navy` (cor cheia) nos dois componentes e nas telas novas; `src/lib/contrast.test.ts` já provava que navy cheio sobre branco passa AA, só não havia teste E2E que exercitasse o par real na tela até esta fase.

### F5 — Hardening da aplicação
- [x] CSP estrita, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- [x] `X-Robots-Tag`, `robots.txt`, metadata `noindex`
- [x] axe em todas as rotas

**Gate:** `securityheaders.com` A+ (a confirmar após deploy — F6, [DT-016](#12-débito-técnico)); axe sem violações; LHCI dentro do orçamento. ✅ **concluída em 2026-07-27**, com ressalvas registradas em [DT-015](#12-débito-técnico) e [DT-016](#12-débito-técnico) — todos os cabeçalhos de `next.config.ts` (`headers()`) cobrem toda rota (`/:path*`); `public/robots.txt` nega tudo; `metadata.robots` ganhou `noarchive`. A CSP planejada originalmente usava nonce por requisição via middleware — testada, e quebrava a cada cache hit (a página é 100% pré-renderizada, o nonce do header não batia com o já embutido no HTML servido do cache), travando a hidratação; revertida para uma CSP estática sem nonce após decisão do usuário — ver [ADR-016](#adr-016--csp-estática-sem-nonce-em-vez-de-nonce-por-middleware). `<Logo>` e `<PatternBackground>` perderam o atributo `style` (viraram classes Tailwind com valor arbitrário) para que `style-src` continue sem `unsafe-inline`. `e2e/navigation.spec.ts` ganhou a suíte "F5 — hardening": cabeçalhos exatos, `robots.txt`, e axe no 404 e no setor "em breve" (fechando a cobertura de todos os 4 templates de tela — antes só home e um setor ativo tinham axe). Lighthouse CI (`@lhci/cli`) e `size-limit` instalados e configurados contra o orçamento do §10 — recalibrado em [ADR-017](#adr-017--orçamento-de-js-recalibrado-para-a-linha-de-base-real-do-app-router); `npm run bench` roda local mas não pôde validar a parte do Lighthouse neste ambiente (spawn de Chrome bloqueado pelo sandbox) — primeira validação real será no `bench` do CI, mesmo padrão do [ADR-011](#adr-011--doccheck-ignora-updated-e-changelog-na-comparação).

### F6 — Deploy
- [ ] Projeto na Vercel, domínio, preview protegido por PR
- [ ] Runbook de rollback validado na prática

**Gate:** produção no ar, os 35 links conferidos manualmente.

O projeto na Vercel já existe (`osvaldo-s-projects3/links-bondmann`) e `links-bondmann.vercel.app` está no ar — mas servindo `feat/f2-registry-links`, não `main`. Fechar esta fase é mergear o [PR #5](https://github.com/OsvaldoBello/linktree-bondmann/pull/5) e devolver a *Production Branch* para `main`, nessa ordem — ver [DT-017](#12-débito-técnico).

### F7 — Operação
- [ ] Link health check semanal (HEAD nas URLs, abre issue em 4xx/5xx)
- [ ] Vercel Analytics cookieless

**Gate:** primeira execução do cron verde.

---

## 6. Inventário de conteúdo

**7 setores, 35 links.** Fonte original: `Links externos.docx`, mais os 7 links do RH enviados diretamente pelo usuário em 2026-07-27, o Dashboard Comercial adicionado ao setor Comercial em 2026-07-28 e os 5 GPTs da AlquimIA que substituíram o hub do Depto. Químico em 2026-08-04. Este inventário é a referência humana; a verdade executável é `src/content/links.ts`.

Os setores aparecem abaixo — e na home — em **ordem alfabética** ([ADR-019](#adr-019--ordem-alfabética-no-registry-e-textura-de-fundo-ancorada-no-viewport)).

### Comercial — 13 links
| Título | Destino |
|---|---|
| Dashboard Comercial | `dashboard-bondmann-production.up.railway.app` |
| Solicitação de Cotação PJ | Ploomes |
| Solicitação de Cotação PF | Ploomes |
| Solicitação de Rastreio | Ploomes |
| FB026 · Solicitação de Diluidor | Ploomes |
| FB029/00 · Solicitação de MVV PJ | Ploomes |
| FB029/00 · Solicitação de MVV PF | Ploomes |
| FB060/00 · Manutenção e Limpeza | Ploomes |
| FB074/00 · Solicitação de Teste | Ploomes |
| Ficha Cadastral Matriz | SharePoint (PDF) |
| Ficha Cadastral Filial | SharePoint (PDF) |
| Ficha Cadastral para Clientes | SharePoint (Word) |
| FB037/10 · Relação de Amostras | SharePoint (Word) |

### Compras — 1 link
| Título | Destino |
|---|---|
| Transportadoras Habilitadas para Frete CIF | SharePoint (planilha) |

### Controladoria — *Em breve*
Pendência: link do aplicativo OnFly a confirmar ([DT-001](#12-débito-técnico)).

### Depto. Químico — 5 links
| Título | Destino |
|---|---|
| AlquimIA · Desengraxantes | ChatGPT (GPT) |
| AlquimIA · Fluidos e Lubrificantes | ChatGPT (GPT) |
| AlquimIA · Tratamento de Superfícies | ChatGPT (GPT) |
| AlquimIA · Limpeza e Higienização | ChatGPT (GPT) |
| AlquimIA · Produtos de Uso Específico | ChatGPT (GPT) |

Os cinco substituíram, em 2026-08-04, o link único `linktr.ee/gptsbondmann` — um hub que só reunia estes mesmos GPTs. Ver [ADR-025](#adr-025--gpts-da-alquimia-direto-no-registry-chatgptcom-na-allowlist-linktree-fora).

### Marketing — 7 links
| Título | Destino |
|---|---|
| Portal de Chamados | `portal-chamados-bondmann-production.up.railway.app/workspace` |
| Mídia Compartilhada · Solicitação de Entrada | Google Forms |
| Mídia Compartilhada · Detalhes da Campanha | Google Forms |
| Mídia Compartilhada · Planilhas de Leads | Google Sheets |
| Mídia Compartilhada · Formulário de Feedback | Google Forms |
| Mídia Compartilhada · Solicitação de Alteração de Campanha | Google Forms |
| Mídia Compartilhada · Criativos | Google Drive (pasta) |

### RH — 7 links
| Título | Destino |
|---|---|
| Solicitação de Ajuda de Custo | Microsoft Forms |
| Prorrogação de Ajuda de Custo | Microsoft Forms |
| Acompanhamento de Ajuda de Custo | Microsoft Forms |
| Requerimento Programa de Incentivo à Educação | Microsoft Forms |
| FB030 · Alteração de Cargo | Microsoft Forms |
| FB031 · Solicitação de Contratação | Microsoft Forms |
| FB032 · Solicitação de Encerramento de Contrato | Microsoft Forms |

### TI — 2 links
| Título | Destino |
|---|---|
| Dashboard Comercial | `dashboard-bondmann-production.up.railway.app` |
| Portal de Chamados | `portal-chamados-bondmann-production.up.railway.app/workspace` |

### Links divulgados por mais de um setor

Duas URLs aparecem em dois setores de propósito — não é duplicação acidental:

| Link | Setores | Motivo |
|---|---|---|
| Portal de Chamados | Marketing, TI | Cada setor o divulga como porta de entrada própria |
| Dashboard Comercial | Comercial, TI | Mantido pela TI, consumido pelo Comercial — quem procura não deveria precisar saber de quem é a infraestrutura |

A URL é uma constante única em `links.ts` nos dois casos, e `links.test.ts` falha se o mesmo `id` aparecer com URLs diferentes entre setores: o risco real é atualizar uma cópia e esquecer a outra. Na busca da home, o link cross-listado aparece **uma vez só**, no setor de maior pontuação ([ADR-021](#adr-021--busca-client-side-na-home-entra-no-escopo)).

### Setores removidos do escopo
**Financeiro** e **Produção** não constam da v1 — não possuíam links e não há previsão. Reintroduzir exige apenas adicioná-los ao registry.

### Higienização aplicada na migração

- Os 4 encurtadores `bit.ly` do Marketing foram substituídos pelas **URLs canônicas** fornecidas. Encurtadores estão na denylist do schema, impedindo reintrodução.
- Todas as URLs normalizadas para `https://` (o docx trazia os `bit.ly` em `http://`).
- Links SharePoint com token `?e=…` e o link do Drive com `?usp=sharing` dependem de permissão que pode ser revogada — motivo do link health check da F7.

---

## 7. Segurança da aplicação

### Cabeçalhos HTTP (em `next.config.ts`, todas as rotas)

| Cabeçalho | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `no-referrer` |
| `Permissions-Policy` | câmera, microfone, geolocalização e pagamento negados |
| `X-Robots-Tag` | `noindex, nofollow, noarchive` |

`script-src` é a única diretiva com `unsafe-inline` — necessário porque o próprio Next injeta scripts inline para hidratar o App Router, inevitável mesmo sem nenhum componente cliente do projeto; ver [ADR-016](#adr-016--csp-estática-sem-nonce-em-vez-de-nonce-por-middleware) para por que um nonce por requisição não funciona com o site 100% pré-renderizado do §4. Nenhuma outra diretiva abre exceção. `Referrer-Policy: no-referrer` impede que a URL interna do linktree vaze para SharePoint, Ploomes ou Google.

### Links externos

Todo `<LinkButton>` renderiza `target="_blank" rel="noopener noreferrer nofollow"`. Garantido por um teste unitário que varre o registry inteiro — não por revisão manual.

### Validação do registry

`links-schema.ts` exige:

- Protocolo `https://` — `http://` é rejeitado
- Hostname na **allowlist**: `*.bondmannquimica.sharepoint.com`, `forms.ploomes.com`, `docs.google.com`, `drive.google.com`, `*.up.railway.app`, `forms.cloud.microsoft` (Microsoft Forms do RH, F2), `chatgpt.com` (GPTs da AlquimIA — [ADR-025](#adr-025--gpts-da-alquimia-direto-no-registry-chatgptcom-na-allowlist-linktree-fora); `linktr.ee` saiu da lista no mesmo movimento, por não ter mais nenhum link)
- Hostname fora da **denylist de encurtadores**: `bit.ly`, `tinyurl.com`, `t.co`, `goo.gl`, `ow.ly`, `is.gd`
- Slug de setor único, id único dentro do setor, título não vazio

Roda em build. **Um link malicioso ou com typo não chega a produção.**

### Privacidade

Nenhum cookie, nenhum `localStorage`, nenhum script de terceiros. Fontes self-hosted. Analytics apenas Vercel Analytics (cookieless, sem PII) e somente a partir da F7.

### Não indexação

O site é público por URL, mas invisível a buscadores: `robots.txt` com `Disallow: /`, metadata `robots: noindex, nofollow` e o cabeçalho `X-Robots-Tag`. Isso reduz a exposição da estrutura organizacional sem custo de autenticação.

---

## 8. Segurança de CI/CD e cadeia de suprimentos

Num projeto sem backend, **o pipeline é a maior superfície de ataque restante**. Tratado como tal.

### Permissões e isolamento

- `permissions: contents: read` no topo de todo workflow; cada job escala só o necessário (`security-events: write` apenas no CodeQL, `id-token: write` apenas na attestation).
- **`pull_request_target` é proibido.** PRs de fork rodam em `pull_request`, sem acesso a secrets.
- Nenhuma interpolação de `${{ github.event.* }}` dentro de `run:` — sempre via `env:`, neutralizando script injection por título de PR ou nome de branch.
- `timeout-minutes` e `concurrency` com `cancel-in-progress` em todo job.
- **zizmor** roda no CI como linter dos próprios workflows, pegando essas classes de falha automaticamente.

### Integridade das dependências

- Toda GitHub Action **pinada por SHA completo**. Tags como `@v4` são mutáveis e sequestráveis; Dependabot mantém os SHAs atualizados.
- `npm ci --ignore-scripts` no CI — bloqueia `postinstall` malicioso, o vetor mais comum de comprometimento via npm.
- `npm audit signatures` (proveniência do registry) + `lockfile-lint` (todo `resolved` aponta para o registry oficial em https).
- `npm audit --audit-level=high` bloqueante — sobre `--omit=dev`, com a árvore completa auditada em paralelo de forma informativa e toda exceção viva registrada em [Débito técnico](#12-débito-técnico). Ver [ADR-007](#adr-007--overrides-de-postcss-e-sharp-política-de-npm-audit). Dependabot semanal, agrupado, com auto-merge apenas para *patch* e somente após CI verde.
- Transitivas vulneráveis que o Next fixa (`postcss`, `sharp`) são elevadas por `overrides` no `package.json`. Toda entrada ali existe por um aviso de segurança concreto — nunca por conveniência.
- SBOM CycloneDX a cada release; `actions/attest-build-provenance` assina o build, permitindo verificar depois que o artefato veio deste repo e deste commit.

### Segredos

- **Meta do projeto: zero segredos.** O deploy usa a integração nativa Vercel↔GitHub — nenhum token de deploy no GitHub.
- Se algum secret for inevitável, fica em **GitHub Environment** com escopo restrito, nunca em `env` de workflow, nunca acessível a forks.
- gitleaks em cada push e no histórico completo; push protection do Secret Scanning ativa no repositório.

### Proteção de branch e deploy

- `main`: checks obrigatórios (`verify`, `doc-drift`, `e2e`, `bench`, `codeql`), 1 revisão, histórico linear, **commits assinados**, force-push e deleção bloqueados, regras válidas também para administradores.
- Deploy de produção via GitHub Environment `production` com *required reviewer*.
- **Vercel Deployment Protection** nos previews: URL de PR autenticada e não indexável, para que a estrutura interna não vaze por preview público.
- Variáveis de ambiente escopadas por ambiente. Nenhuma `NEXT_PUBLIC_*` com conteúdo sensível — elas vão para o bundle do cliente por definição.

### Análise estática

- **CodeQL** (JS/TS) em cada PR e semanalmente.
- **Semgrep** com regras React/Next: `dangerouslySetInnerHTML`, `target="_blank"` sem `rel`, redirect aberto.
- `eslint-plugin-security` e `react/jsx-no-target-blank` em nível `error`.

### Rastreabilidade

Todo deploy de produção é rastreável a um commit assinado, revisado, com CI verde, SBOM e atestado de proveniência.

---

## 9. Testes

### Política de cobertura

| Escopo | Limiar |
|---|---|
| Global | 85% linhas / 90% branches |
| `src/lib/**` e `src/content/**` | **100%** — é o núcleo crítico |

<!-- AUTO:tests:start -->
| Métrica | Cobertura | Limiar |
|---|---|---|
| Linhas | 100.0% ✅ | 85% |
| Branches | 100.0% ✅ | 90% |
| Funções | 100.0% ✅ | 85% |
| Statements | 100.0% ✅ | 85% |
<!-- AUTO:tests:end -->

### Testes obrigatórios por feature

Nenhuma feature fecha sem:

1. **Unitários** cobrindo o caminho feliz e ao menos um caso de erro
2. **E2E** quando a feature altera navegação
3. **axe** sem violações nas rotas afetadas
4. **LHCI** dentro do orçamento

### Testes estruturais que travam regressão

Estes existem porque a regra correspondente é fácil de violar sem perceber:

- Schema rejeita `http://`, domínio fora da allowlist, encurtador e slug duplicado
- Todo link do registry produz `rel="noopener noreferrer nofollow"`
- Todo par de cores usado na interface satisfaz WCAG AA
- `<Logo>` respeita safe-area e tamanho mínimo mesmo com props hostis
- Link cross-listado (§6) tem a mesma URL em todos os setores em que aparece
- A busca ordena casamento exato antes de aproximado, e não devolve entrada em que algum token da query não casou ([ADR-021](#adr-021--busca-client-side-na-home-entra-no-escopo))

### E2E (Playwright)

Chromium + WebKit, viewport mobile e desktop: home lista os 7 setores; Controladoria não navegável; setor exibe os links corretos; slug inválido cai em 404; percurso completo por teclado com foco visível.

A busca tem suíte própria (`Busca na home`): acha link de qualquer setor com `rel` seguro, tolera acento e erro de digitação, avisa quando nada casa, e limpar devolve a lista de setores. Como é a única parte do site que depende de hidratação, o helper `search()` repete o preenchimento até o botão "Limpar busca" aparecer — digitar antes da hidratação perderia o evento, e o teste falharia por corrida, não por defeito.

---

## 10. Benchmarks e orçamento de performance

Orçamento que **falha o CI** quando estourado:

| Métrica | Orçamento |
|---|---|
| Lighthouse Performance | ≥ 98 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | ≥ 95 |
| LCP (mobile, throttled) | < 1.2 s |
| CLS | < 0.02 |
| JS compartilhado (toda rota, Brotli) | < 120 KB — `size-limit.config.mjs` |
| JS transferido (rota específica) | < 145 KB — `resource-summary:script:size` |
| Peso total da rota | < 250 KB — `total-byte-weight` |

<!-- AUTO:bench:start -->

| Bundle | Tamanho | Orçamento |
|---|---|---|
| JS compartilhado (todas as rotas) | 110.9 KB ✅ | 120000 |
<!-- AUTO:bench:end -->

O histórico fica versionado no git, tornando qualquer regressão visível no diff.

---

## 11. Registro de decisões (ADR)

Append-only. Nunca edite ou apague uma entrada — para reverter, escreva uma nova que supersede a anterior.

### ADR-001 — Verde de tela `#99C76B` em vez de `#ACC76B`
**Data:** 2026-07-27 · **Status:** aceito
O manual converte Pantone 367 C para RGB 172/199/107 (`#ACC76B`), mas o SVG oficial do logotipo usa `#99C76B`. Conversões Pantone→RGB variam por perfil de cor. Adotado `#99C76B` para tela, com `#ACC76B` preservado como equivalente de impressão, evitando dois verdes distintos lado a lado na interface.

### ADR-002 — Fira Sans como proxy da família Info
**Data:** 2026-07-27 · **Status:** aceito
O manual especifica Info Book Italic, família comercial sem webfont livre. Fira Sans é do mesmo designer (Erik Spiekermann), gratuita e com itálico completo — o proxy mais fiel disponível. Substituir pela Info real se a Bondmann adquirir a licença webfont.

### ADR-003 — Público com `noindex` em vez de autenticação
**Data:** 2026-07-27 · **Status:** aceito
Os destinos já exigem login (Microsoft, Ploomes, Google). Autenticar o agregador adicionaria uma fase inteira e um ponto de falha para proteger o que é essencialmente um índice. `noindex` + `nofollow` + `X-Robots-Tag` mantêm a estrutura organizacional fora de buscadores a custo zero. Reavaliar se o inventário passar a conter informação sensível por si só.

### ADR-004 — Registry no repositório em vez de CMS ou banco
**Data:** 2026-07-27 · **Status:** aceito
Com ~23 links de baixa rotatividade, um arquivo TypeScript validado por Zod entrega versionamento, auditoria, revisão por PR e validação em build — sem backend, sem auth de admin, sem RLS. Reavaliar se a edição por não-desenvolvedores virar necessidade recorrente.

### ADR-005 — Financeiro e Produção fora da v1
**Data:** 2026-07-27 · **Status:** aceito
Ambos os setores não possuíam links. Exibi-los vazios criaria becos sem saída. RH e Controladoria ficam como "Em breve" por terem conteúdo previsto.

### ADR-006 — Cobertura unitária não mede `src/app/**`
**Data:** 2026-07-27 · **Status:** aceito
A camada de rota (shell, páginas, 404) é exercitada pelo Playwright com axe, navegando de verdade contra o build de produção. Medi-la também no Vitest produziria um número que não corresponde ao que está de fato testado — e empurraria o projeto a escrever testes de renderização redundantes só para satisfazer o limiar. `src/app/**` sai do `include` de cobertura; `lib/`, `content/` e `components/` continuam sob os limiares da §9. Reavaliar se alguma rota passar a conter lógica própria em vez de composição.

### ADR-007 — `overrides` de `postcss` e `sharp`; política de `npm audit`
**Data:** 2026-07-27 · **Status:** aceito
O Next 16.2.12 fixa `postcss@8.4.31` e `sharp@0.34.5`, ambos com avisos de severidade **high** (XSS no stringify do PostCSS, path traversal via `sourceMappingURL`, CVEs de libvips no sharp). Como a §8 define `npm audit --audit-level=high` como bloqueante, os dois foram elevados por `overrides` para `8.5.23` e `0.35.3` — bumps de minor, dentro do semver que o Next declara. Build e testes passam com eles.

Um terceiro achado (`brace-expansion`, DoS por expansão ilimitada) **não** foi corrigido: a única versão sã é a `5.0.8`, cujo formato de export quebra o `minimatch` que o próprio ESLint carrega. Ver [DT-006](#12-débito-técnico). Consequência prática para o CI da F0.5: o passo bloqueante é `npm audit --audit-level=high --omit=dev`; a auditoria da árvore completa roda em paralelo, informativa, e cada exceção viva precisa de uma linha em Débito técnico. Sem exceção não documentada.

### ADR-008 — ESLint fixado na linha 9 e TypeScript na linha 5
**Data:** 2026-07-27 · **Status:** aceito
O ESLint 10 e o TypeScript 7 já estão publicados, mas o ecossistema de lint deste projeto ainda não os acompanha: o `eslint-plugin-react` que vem dentro do `eslint-config-next@16` usa a API de contexto removida no ESLint 10, e o `typescript-eslint@8` declara `typescript <6.1.0` como peer. Subir qualquer um dos dois hoje custa o `next/core-web-vitals` inteiro ou o lint com informação de tipo — preço alto demais por estar na última versão. Fixados em `eslint@9.39.5` e `typescript@5.9.3`, com gatilho de revisão registrado em [DT-007](#12-débito-técnico).

O `eslint-config-next@16` já é flat config nativo: nada de `FlatCompat`, que sob ESLint 9+ quebra ao serializar a configuração do plugin React.

### ADR-009 — gitleaks, Semgrep e zizmor via CLI fixada, em vez de Actions de terceiros
**Data:** 2026-07-27 · **Status:** aceito

`gitleaks/gitleaks-action` exige `GITLEAKS_LICENSE` (secret pago) para contas de organização — conflita direto com a meta de "zero segredos" do §8 se o repositório vier a pertencer a uma organização GitHub em vez de conta pessoal. `semgrep/semgrep-action` está **arquivado** (deprecated desde 2024, redireciona para uso direto do CLI). Optamos por instalar os três CLIs oficiais (`gitleaks`, `semgrep`, `zizmor`) fixados numa versão exata, dentro do próprio job:

- **gitleaks:** binário oficial baixado da release do GitHub, com verificação de checksum SHA-256 antes de instalar — MIT, sem license key.
- **semgrep** e **zizmor:** `pip install <pacote>==<versão exata>` — ambos publicados como wheel pré-compilado, sem toolchain de build no runner.

Isso reduz a cadeia de confiança do próprio pipeline: `github/codeql-action` continua sendo usado por ser a Action oficial do GitHub sem CLI equivalente prático, mas as outras três ferramentas não introduzem uma Action de terceiro adicional (que teria de ser pinada por SHA e mantida pelo Dependabot como qualquer outra). Nenhuma delas entra em `package.json` — não são dependências do produto, só do CI. Reavaliar se `zizmor-action` (mesma organização do CLI) ou uma versão não-comercial do gitleaks-action surgir.

Validado localmente: `zizmor --persona=pedantic` (offline e online, com token do GitHub) roda **zero achados** contra os cinco workflows deste repositório.

### ADR-010 — `npm ci --ignore-scripts` no CI, sem allowlist de rebuild
**Data:** 2026-07-27 · **Status:** aceito

Testado localmente (cópia isolada do projeto): `npm ci --ignore-scripts` seguido de `tsc --noEmit`, `eslint .`, `vitest run` e `next build` — todos passam sem nenhuma etapa adicional de `npm rebuild`. O motivo é estrutural: nenhum pacote deste projeto precisa de um binário nativo baixado via `postinstall` para o caminho que o CI exercita. `sharp` é `optionalDependency` do Next (usado só por `next/image`, que este projeto não usa — nenhum import em `src/`); os binários específicos de plataforma do `esbuild`/SWC chegam via `optionalDependencies` comuns, resolvidos na própria árvore do `npm ci`, não por script de lifecycle. Se algum pacote futuro passar a exigir de fato um `postinstall`, a falha aparece imediata e localizada no job `verify` — decisão nesse momento é adicionar um `npm rebuild <pacote> --ignore-scripts=false` explícito e documentado aqui, nunca remover o `--ignore-scripts` geral.

### ADR-011 — `doc:check` ignora `updated` e `changelog` na comparação
**Data:** 2026-07-27 · **Status:** aceito

Primeira execução real do job `doc-drift` no GitHub Actions (push do commit inicial) revelou um paradoxo estrutural: as regiões `AUTO:updated` (commit/branch) e `AUTO:changelog` (histórico via `git log`) descrevem o estado do repositório **no momento do sync** — que roda antes de commitar. O commit que carrega essa atualização, por definição, ainda não existe quando o sync roda, então essas duas regiões nunca conseguem descrever a si mesmas; `git log HEAD` no `doc-drift`, rodando já sobre esse commit, sempre inclui uma entrada (a própria dele) que a versão salva no arquivo não podia ter previsto. Comparação byte a byte nessas duas regiões falharia em **todo** commit que tocasse o `PROJECT.md`, inclusive quando nada mais estivesse defasado.

`scripts/sync-master-doc.mjs` no modo `--check` agora mascara essas duas regiões antes de comparar (função `stripVolatile`), mantendo comparação estrita em `overview`, `stack`, `progress`, `tests` e `bench` — nenhuma delas depende do próprio hash de commit, então continuam sendo sinal real de documentação desatualizada. Validado localmente rodando `doc:sync` seguido de `doc:check` no mesmo estado que o CI vai ver.

### ADR-012 — Safe-area do logo como fração proporcional, em vez de medida do manual
**Data:** 2026-07-27 · **Status:** aceito

O manual define a área de não-interferência do símbolo como "a altura de duas letras 'B' maiúsculas de BONDMANN" — uma medida derivada do wordmark. O componente `<Logo>` (F1) renderiza só o símbolo de seis anéis, sem wordmark, então não existe uma cap-height própria para medir essa referência. Sem acesso ao PDF do manual (44 páginas, não disponível neste ambiente) para extrair a proporção exata entre a altura da letra "B" e o símbolo, adotamos `--logo-safe-area: 0.3em` — um `padding` proporcional ao tamanho renderizado do logo (via `font-size` do wrapper), não um valor fixo em px, para preservar a propriedade central de toda regra de clear-space: escalar com o tamanho do logo. `0.3em` é uma aproximação de engenharia, não uma medida extraída do manual. Ver [DT-014](#12-débito-técnico).

O tamanho mínimo (`--logo-min-height: 20mm`), por outro lado, vem direto do manual (redução mínima sem byline) e usa a unidade `mm` do CSS — que tem conversão exata para px (1in = 25.4mm) — em vez de um valor pré-convertido à mão.

### ADR-013 — Rota estática de setor "em breve" gerada, em vez de 404
**Data:** 2026-07-27 · **Status:** aceito

`generateStaticParams` em `src/app/setor/[slug]/page.tsx` inclui **todos** os setores do registry, inclusive Controladoria (`status: 'coming-soon'`, sem links). A alternativa seria excluir setores "em breve" de `generateStaticParams`, fazendo `/setor/controladoria` cair em 404 como qualquer slug inexistente.

Optamos por gerar a rota: o slug é válido — existe no registry, só ainda não tem links —, então tratá-lo como "não encontrado" seria enganoso para quem chegasse nele por link direto ou favorito. A página renderiza normalmente (título, tagline) e mostra "Nenhum link disponível ainda." em vez da lista. O card da home continua não navegável para esse setor (`<SectorCard>`, §4), então a única forma de chegar lá é digitando a URL — e nesse caso, ver a tela em vez de um 404 é o comportamento mais claro. Reavaliar se um setor "em breve" vier a precisar de conteúdo diferente de "nenhum link ainda" (ex.: uma data prevista).

### ADR-014 — Redesenho visual: lista vertical estilo Linktree em vez de grade
**Data:** 2026-07-27 · **Status:** aceito

A F1/F3 originais usavam uma grade `grid-cols-1 sm:grid-cols-2` com cards de borda fina cinza-azulada — funcional, mas genérica: não comunicava a identidade Bondmann além da cor, e divergia do padrão pedido pelo usuário ("quero algo do mesmo padrão que o Linktree"). Redesenho aplicado a `<SectorCard>`, `<LinkButton>`, `<PatternBackground>`, à home, à tela de setor e ao 404:

- **Lista vertical de coluna única** (`max-w-md`, centralizada) em vez de grade 2 colunas — mesmo padrão em qualquer largura de tela, replicando a estrutura de um Linktree real e unificando a linguagem visual entre a home (setores) e a tela de setor (links).
- **`<RingBadge>`** (novo componente, `src/components/RingBadge.tsx`): medalhão circular com o símbolo oficial de seis anéis, repetido em todo card de setor e de link — reforça a marca em cada item da lista, não só no cabeçalho. Tom `solid` (fundo verde, ícone navy — mesmo par aprovado pelo §2) para itens ativos; tom `outline` (borda tracejada navy, sem preenchimento) para "em breve". Sempre `aria-hidden`, decorativo.
- **Ícone de link externo em SVG** (não caractere de texto) no `<LinkButton>`, sinalizando que o link abre em nova aba — informação real sobre o comportamento, não decoração. Usar SVG em vez de um glifo de texto evita qualquer ambiguidade com a regra de contraste de texto do §2.
- **Fundo neutro `#F5F6F1`** (não branco puro) no `body`, mais uma grade de pontos sutil (`opacity-[0.05]`) na `<PatternBackground>`, complementando o símbolo já existente em baixa opacidade — não é uma cor do manual, é uma escolha de design; contraste com texto navy permanece efetivamente idêntico ao de branco puro.
- **Estado "em breve"** deixou de usar texto em opacidade reduzida (a lição da F4: `text-bond-navy/70` reprovava AA) — agora usa texto navy em opacidade cheia sempre, com a tag "Em breve" como selo (`bg-bond-green text-bond-navy`, par aprovado pelo §2) em vez de texto apagado.

Nenhuma dependência nova: só Tailwind (classes utilitárias, `radial-gradient` via `style` inline) e o SVG do símbolo já existente em `brand-symbol.ts`. `npm run verify` (typecheck, lint, format, `validate:links`, 52 testes unitários com 100% de cobertura, build) passa sem alterações de schema ou de conteúdo — só de apresentação. `LinkButton.test.tsx` teve um assert reescrito (`children.length === 1` → checagem de nome acessível + ausência do texto de descrição), porque a estrutura interna do componente mudou; o contrato testado (rel seguro, presença condicional da descrição) continua o mesmo.

### ADR-015 — Fundo navy, texto verde e tipografia sem itálico
**Data:** 2026-07-27 · **Status:** aceito

Segunda iteração visual, a pedido do usuário: inverter a paleta em nível de página (fundo navy, logo e texto principal em verde) e simplificar a tipografia. Aplicado a `globals.css`, `<PageShell>`, `<PatternBackground>`, `layout.tsx` e às três telas (`page.tsx`, `setor/[slug]/page.tsx`, `not-found.tsx`).

- **Fundo da página:** `body` passa de um neutro claro para `var(--color-bond-navy)` sólido. **A regra do §2 não muda** — "verde nunca é cor de texto sobre fundo claro" continua valendo ao pé da letra; o que mudou é que o fundo deixou de ser claro. Texto verde sobre navy é o mesmo par navy/verde já aprovado (≈5.2:1, testado desde a F1), só com os papéis invertidos — nova entrada em `src/lib/contrast.test.ts` documenta essa direção especificamente.
- **Logo:** `<PageShell>` passa `color="green"` ao `<Logo>` (prop que já existia desde a F1, só não era usada).
- **Escopo do verde como texto:** só os elementos que ficam diretamente sobre o fundo navy (H1 de cada tela, subtítulo do hero, logo) viram verde. **Dentro dos cards — que continuam brancos — o texto continua navy.** Verde como texto de card violaria a regra do §2 (fundo branco é fundo claro); os cards não mudaram de cor de fundo neste redesenho, só a página ao redor deles.
- **Texto de apoio sobre o fundo navy** (subtítulo da home, tagline da tela de setor, mensagem do 404) foi para branco, não verde — mantém uma hierarquia entre título (verde, mais forte) e texto secundário (branco), em vez de a página inteira ficar monocromática.
- **Tipografia mais simples:** o itálico (proxy de "Info Book Italic" do manual, ADR-002) foi removido de todos os títulos — heading, nome de setor, título de link. A família continua Fira Sans (ADR-002 não muda, só o uso do itálico); `layout.tsx` deixou de baixar o estilo `italic` do Google Fonts (`style: ['normal']`), reduzindo o peso de fonte pela metade — simplificação que também ajuda o orçamento de performance do §10.
- **Foco de teclado:** todo `focus-visible:outline` que apontava para `bond-navy` passou para `white`. Motivo: com `outline-offset-2`, o anel de foco é desenhado *fora* do elemento, sobre o que estiver atrás dele — que agora é o fundo navy da página na maioria dos casos. Um anel navy sobre fundo navy seria invisível; branco garante contraste alto em qualquer contexto (fundo navy ou borda de card branco).
- **`<PatternBackground>`:** o segundo anel decorativo (antes navy sobre fundo claro) virou branco em baixíssima opacidade — navy sobre navy também seria invisível. A grade de pontos trocou de navy para verde pelo mesmo motivo.
- **Card "em breve" e estado vazio de setor:** opacidade de fundo subiu de `white/60` para `white/90` — mais sólido, sem depender de blend com o navy por trás para continuar legível.

Nenhuma dependência nova. `npm run verify` passa (53 testes, 100% de cobertura, build limpo). Reavaliar se o usuário pedir que o texto *dentro* dos cards também vire verde — nesse caso os cards precisariam deixar de ser brancos, porque a regra do §2 não abre exceção para conveniência de estilo.

### ADR-016 — CSP estática sem nonce, em vez de nonce por middleware
**Data:** 2026-07-27 · **Status:** aceito

A F5 implementou primeiro a CSP exatamente como o §7 já descrevia: nonce por requisição via `middleware.ts` (depois renomeado `proxy.ts` — convenção trocada no Next 16, ver https://nextjs.org/docs/messages/middleware-to-proxy), seguindo o padrão oficial do Next.js para App Router. Quebrou em produção: o site é **100% pré-renderizado** (§4), então o HTML de cada rota — nonce incluso, embutido nos `<script>` que o próprio Next injeta para hidratação — é gerado uma vez em build e servido do cache em toda visita seguinte (`x-nextjs-cache: HIT`). O middleware, por rodar a cada requisição, gerava um nonce *novo* para o cabeçalho `Content-Security-Policy` a cada vez — diferente do nonce já embutido no HTML cacheado. O navegador bloqueava os scripts por descasamento de nonce, a hidratação nunca rodava, e a tela real (inclusive o 404) nunca aparecia — pego pelos testes E2E novos desta fase (`html-has-lang` do axe acusando o *shell* de erro do Next, `<html id="__next_error__">`, no lugar da página real).

A causa é estrutural, não um bug de implementação: nonce-CSP em Next.js exige renderização dinâmica por requisição (documentado pelo próprio Next como pré-requisito, fora do recurso experimental "Cache Components"). Três saídas possíveis, apresentadas ao usuário:

1. **CSP estática sem nonce** (escolhida) — troca `'nonce-…'` por `'unsafe-inline'` só em `script-src`, mantendo `style-src`, `connect-src` etc. sem nenhuma exceção. Preserva os dois princípios já comprometidos no §4 (site 100% pré-renderizado, zero requisição em runtime) e no orçamento de performance do §10. Risco real é baixo: a aplicação não tem nenhum ponto onde conteúdo de terceiro ou de usuário vire HTML — o registry é validado em build (`links-schema.ts`), não em runtime — então não existe injeção para essa política habilitar. `<Logo>` e `<PatternBackground>` perderam o atributo `style` (agora só classes Tailwind com valor arbitrário, ex. `h-[max(140px,var(--logo-min-height))]`) para que `style-src` continue sem `unsafe-inline` — essa parte da regra do §7 ("sem unsafe-inline em nenhuma diretiva") não foi enfraquecida, só `script-src`.
2. **Renderização dinâmica em toda rota** (`dynamic = 'force-dynamic'`) — mantida nonce e zero `unsafe-inline`, mas quebra "tudo pré-renderizado" do §4 e arrisca o orçamento de LCP/TTFB do §10 a cada requisição virar computação de servidor.
3. **CSP por hash calculada em build** — mantém 100% estático e zero `unsafe-inline`, mas exige build em duas fases (hash dos scripts inline só existe depois que o HTML já foi gerado, e o `headers()` do Next precisa do valor *antes* de gerar esse mesmo HTML) — infraestrutura real, não validável sem um deploy de verdade na Vercel.

O texto do §7 foi atualizado para refletir a política final: `script-src 'self' 'unsafe-inline'`, todo o resto sem `unsafe-inline`. `e2e/navigation.spec.ts` (`F5 — hardening`) trava o valor exato do cabeçalho, então uma regressão para nonce (ou para `unsafe-inline` em outra diretiva) quebra o teste.

### ADR-017 — Orçamento de JS recalibrado para a linha de base real do App Router
**Data:** 2026-07-27 · **Status:** aceito

O orçamento original do §10 ("JS transferido (home) < 90 KB gzip") nunca tinha sido medido — a seção `bench` do documento ficou `_pendente_` desde a F0. Ao instalar `size-limit` e Lighthouse CI nesta fase, a primeira medição real: o runtime compartilhado que o App Router injeta em **toda** rota (React 19 + roteador cliente do `next/link`, necessário para hidratação mesmo sem nenhum componente `'use client'` no projeto) pesa **≈111 KB** com Brotli — 23% acima do orçamento original, antes mesmo de somar o JS específico de cada página.

O número de 90 KB não tinha como ser cumprido sem abrir mão de algo que o projeto não decidiu abrir mão (navegação client-side via `next/link`, ou o App Router em si). Em vez de configurar uma checagem fadada a falhar em todo PR, o orçamento foi recalibrado para o que é real e ainda apertado:

- **`size-limit.config.mjs`:** mede só o runtime compartilhado (`rootMainFiles` do `build-manifest.json` do próprio Next — não um glob por nome de arquivo, que muda de hash a cada build) com Brotli, orçamento de **120 KB**. O bundle de polyfill (`polyfillFiles`) fica de fora de propósito: navegadores com suporte a `type="module"` nunca chegam a baixá-lo.
- **`.lighthouserc.json`:** audita a página real num navegador — `resource-summary:script:size` (todo o JS que uma rota específica transfere, runtime compartilhado + a própria página) com orçamento de **145 KB**; `total-byte-weight` (peso da rota inteira) manteve o valor original de **250 KB**, porque a medição real (~132 KB com Brotli, HTML+CSS+JS) já folga bastante dentro dele.

`npm run bench` (`scripts/bench.mjs`) builda, roda `size-limit` e depois `lhci autorun`, e falha (`exit 1`) se qualquer checagem estourar — é o que torna o job `bench` do CI real em vez do placeholder que a F0.5 deixou (`--if-present`, [DT-011](#12-débito-técnico)). Ver [DT-015](#12-débito-técnico) sobre a parte do Lighthouse não ter sido validada localmente.

### ADR-018 — `unsafe-eval` em `script-src` só em desenvolvimento
**Data:** 2026-07-28 · **Status:** aceito

A CSP estrita do §7 (`script-src 'self' 'unsafe-inline'`, sem `unsafe-eval`) vale para toda rota via `next.config.ts`, inclusive `npm run dev`. Isso nunca tinha sido notado porque o Next 16 passou a encaminhar erros de console do navegador para o terminal do `next dev` — e o erro sempre existiu: o React em modo dev usa `eval()` para reconstruir call stacks legíveis (DevTools, overlay de erro), e o navegador bloqueia por causa da CSP, poluindo o terminal com "eval() is not supported in this environment" a cada requisição.

`next.config.ts` agora acrescenta `'unsafe-eval'` a `script-src` só quando `process.env.NODE_ENV !== 'production'`. O `next build` que o CI e a Vercel servem nunca inclui essa exceção — `headers()` roda de novo em build de produção com `NODE_ENV=production`, então o texto do §7 continua descrevendo exatamente o que vai ao ar. Risco real é zero: `unsafe-eval` nunca chega à CSP servida em produção.

### ADR-019 — Ordem alfabética no registry e textura de fundo ancorada no viewport
**Data:** 2026-07-28 · **Status:** aceito

Dois ajustes de apresentação pedidos pelo usuário, sem mudança de conteúdo nem de schema.

**Ordem dos setores.** O array `sectors` estava na ordem em que os links foram migrados do `Links externos.docx` (Marketing primeiro, Controladoria por último) — uma ordem que só fazia sentido para quem tinha acompanhado a migração. Passou a ser **alfabética por `name`**, via `localeCompare(pt-BR)`: Comercial, Compras, Controladoria, Depto. Químico, Marketing, RH, TI. A alternativa seria ordenar na renderização (`page.tsx`), deixando o registry na ordem de origem — descartada porque criaria duas ordens diferentes para a mesma lista, e quem abrisse `links.ts` veria uma coisa e o site outra. A ordem do array **é** a ordem da tela, e `src/content/links.test.ts` trava isso: um setor novo inserido no lugar errado quebra o teste. Consequência aceita: "Controladoria (Em breve)" deixou de ficar no fim da lista e agora aparece em terceiro — ordem alfabética não abre exceção por status, senão volta a ser uma ordem que precisa ser explicada.

**Textura de fundo.** `<PatternBackground>` usava `absolute inset-0`, então se dimensionava pelo container — que tem a altura do documento, diferente em cada rota (a home tem 7 cards; Comercial, 12 links). Como os dois símbolos são dimensionados em porcentagem (`h-[140%]`, `w-[90%]`), o fundo mudava de escala e de posição a cada clique, e ainda rolava junto com o conteúdo: a "mexida" que o usuário relatou. Trocado por `fixed inset-0` — o fundo passa a ser do viewport, idêntico e imóvel em toda tela e em qualquer scroll. Medido no navegador: o símbolo fica em 1771×1008 px na mesma posição na home (documento de 1002 px) e em `/setor/comercial` (1316 px), e não se desloca após rolar 400 px. Continua `aria-hidden`, `pointer-events-none` e sem atributo `style` (a CSP do §7 não permite `unsafe-inline` em `style-src`). `PatternBackground.test.tsx` ganhou um teste que trava o `fixed`.

### ADR-020 — Favicon: símbolo verde sobre placa navy, mais fallback `.ico` gerado
**Data:** 2026-07-28 · **Status:** aceito · **supersede a arte do commit `5ad331b`**

O favicon anterior era o símbolo em verde sólido, sem fundo, no viewBox original (1582.88×1742.56). Dois problemas, ambos relatados como "não está com o logo da Bondmann na guia":

- **Ilegível no tamanho real.** O símbolo é um contorno de seis anéis finos. A 16 px, sem fundo e sobre a guia clara do navegador, os anéis somem — o traço fica com menos de 1 px. O ícone tecnicamente carregava, mas não se lia como a marca.
- **ViewBox retangular.** A guia desenha o ícone num quadrado; um viewBox 0.91:1 sobrava espaço lateral e encolhia ainda mais o desenho.

`src/app/icon.svg` passou a ser um canvas quadrado 512×512: placa navy de cantos arredondados (`rx=96`) com o símbolo em verde centralizado a 384 px — 64 px de respiro de cada lado, análogo à safe-area do manual (§2). Verde sobre navy é o par já aprovado no §2 (≈5.2:1); a proibição do verde vale para texto sobre fundo claro, não para ícone decorativo. A placa não é ornamento: é o que dá silhueta ao ícone num tamanho em que contorno fino não sobrevive.

**Fallback `.ico`.** Todo navegador atual lê favicon SVG, mas Safari anterior ao 16.4, atalhos do Windows e ferramentas que pedem `/favicon.ico` direto (sem ler o HTML) não. `scripts/generate-favicon.mjs` gera `public/favicon.ico` (PNG embutido, 16/32/48 px) a partir da **mesma geometria** do SVG — placa de cantos arredondados e seis coroas circulares em arranjo hexagonal, tudo analítico, com supersampling 4×4 para antialiasing. Sem dependência nova: o PNG sai do `zlib` do próprio Node e o container ICO são 22 bytes de cabeçalho. O arquivo é **commitado**; o build não roda o script. Rodar de novo só se `icon.svg` mudar. O `<link rel="icon">` continua vindo da convenção do App Router (`/icon.svg?<hash>`) — o hash é cache-buster, e trocá-lo por um `metadata.icons` manual perderia exatamente isso, que é o que faz o navegador largar o favicon velho.

Confirmado em produção (`links-bondmann.vercel.app`) em 2026-07-28: `/icon.svg` serve o canvas 512×512 com a placa navy e `/favicon.ico` responde 200 em `image/vnd.microsoft.icon`. Vale registrar por que a correção anterior (`5ad331b`, símbolo verde sem fundo) não resolveu apesar de estar no ar: o ícone carregava, mas era invisível no tamanho em que a guia o desenha — o diagnóstico inicial de "não está no ar" estava errado, e o que estava errado era a arte. Ver [DT-017](#12-débito-técnico).

### ADR-021 — Busca client-side na home entra no escopo
**Data:** 2026-07-28 · **Status:** aceito · **altera o §1**

O §1 listava "busca" entre o que **não** construir sem uma decisão registrada aqui. Esta é a decisão: o usuário pediu um campo de busca na home que ache "o link mais perto" do que foi digitado. O motivo do veto original era custo — busca costuma significar índice, backend ou biblioteca. Nenhum dos três é necessário com 31 links:

- **Sem dependência nova.** `src/lib/search.ts` é código próprio, funções puras, com 100% de cobertura. A alternativa seria Fuse.js ou MiniSearch (~10 KB *gzip* cada) para um corpus que cabe numa tela — não passa no teste do §3 ("toda biblioteca nova exige justificar bundle e superfície de ataque").
- **Sem backend e sem requisição.** O registry já vai embutido na página; a busca filtra o que já está em memória. O §4 ("tudo pré-renderizado, nenhuma requisição em runtime") continua verdadeiro — `npm run build` segue gerando as 11 rotas estáticas.
- **Sem estado persistido.** Nada de cookie, `localStorage` ou histórico de busca. A query vive no estado do React e morre com a aba, o que mantém o §7 (privacidade) intacto. Também não vai para a URL: `?q=` viraria termo de busca em log de servidor e em link compartilhado, e o §7 escolheu `Referrer-Policy: no-referrer` justamente para não vazar navegação.

**Custo aceito: a primeira ilha cliente do projeto.** Filtrar a cada tecla exige estado no navegador. As saídas sem `'use client'` seriam uma rota `/busca?q=` renderizada por requisição (contra o §4 e contra o orçamento de LCP do §10) ou submissão de formulário — que a CSP do §7 bloqueia com `form-action 'none'`. `<LinkSearch>` é a ilha, e é pequena: recebe `sectors` por prop e a lista de setores como `children` já renderizada no servidor, então o custo é o do componente, não o da lista.

**Medido, não estimado.** O runtime compartilhado do §10 **não mudou**: 113 549 bytes *brotli* (110.9 KiB), o mesmo valor de antes da busca — o código da ilha entra no chunk da própria rota, não em `rootMainFiles`. O custo marginal aparece comparando as duas telas do mesmo build: a home carrega 127.6 KiB de JS *brotli* (fora o bundle de polyfill, que navegador com `type="module"` não baixa) contra 125.3 KiB da tela de setor, que tem a mesma casca sem a ilha — **~2.3 KiB**. O que ainda não foi medido de verdade é o número que o Lighthouse audita na rota (`resource-summary:script:size`, 145 KB), preso na [DT-015](#12-débito-técnico); ver [DT-018](#12-débito-técnico).

**Heurística do ranking.** Por token da busca, do mais forte para o mais fraco: palavra idêntica (1.0) > começa com (0.9) > contém (0.7) > erro de digitação por distância de Levenshtein (0.55) > subsequência compacta (0.4). O casamento é procurado no título (peso 1), na descrição (0.75) e no nome do setor (0.6) — é o que faz "fb029" achar o MVV e "ti" achar os links da TI. Três decisões que valem registro:

1. **Todo token precisa casar em algum campo**, senão a entrada sai. Sem isso, "cotacao xyz" traria as cotações como se `xyz` não tivesse sido digitado — o oposto de "o link mais perto".
2. **Subsequência limitada a 2× o tamanho do token.** Sem esse limite, "cotacao" casava com "Solicitação de Alteração de Campanha" (as letras existem, espalhadas por 20 caracteres) — acaso virando resultado. Com ele, "dshbrd" continua achando "Dashboard Comercial". Calibrado observando o resultado real no navegador, não no papel.
3. **Empate desempatado pela ordem do registry**, e link cross-listado aparece uma vez só (o de maior pontuação): a mesma URL repetida no resultado se lê como defeito.

Nenhum desses números vem de dado de uso — ver [DT-019](#12-débito-técnico). A alternativa de campo aberto (mostrar tudo, ordenado por proximidade, sem corte) foi descartada: com 31 links, uma lista que nunca encurta não é busca, é a home com outra ordem.

**Acessibilidade e contraste.** Campo com `<label>` (visualmente oculto, não só `placeholder`), região `role="search"`, `role="status"` narrando a contagem de resultados, botão "Limpar busca" com nome acessível. Texto navy cheio sobre o card branco, inclusive o `placeholder` — a lição da F4 (`text-bond-navy/70` reprovava AA) vale para `placeholder:` também. Nenhum atributo `style` inline, para não precisar de `unsafe-inline` em `style-src` (§7). `e2e/navigation.spec.ts` roda axe na home **com resultados na tela**, não só no estado inicial.

### ADR-022 — `bench` sem sandbox do Chrome; `doc-drift` passa a depender de `bench`
**Data:** 2026-07-28 · **Status:** aceito

O job `bench` do CI falhava em **todo push** desde que existe (F5), e o `doc-drift` falhava junto — dois checks obrigatórios de `main` (§8) travados de forma estrutural, não por conteúdo. Achado ao investigar por que o [PR #5](https://github.com/OsvaldoBello/linktree-bondmann/pull/5) não fechava.

**Causa 1 — Chrome sem sandbox utilizável.** `npx lhci autorun` falhava com `No usable sandbox!` (`zygote_host_impl_linux.cc`). Runners `ubuntu-24.04` do GitHub Actions restringem *user namespaces* sem privilégio via AppArmor desde a base Ubuntu 23.10+, e o sandbox de processo do Chrome depende exatamente disso. `.lighthouserc.json` não passava nenhuma flag de Chrome. Corrigido com `chromeFlags: ["--no-sandbox", "--disable-dev-shm-usage"]` em `collect.settings`. Aceitável aqui: o runner é efêmero, de uso único, e audita o próprio build estático do projeto — não há conteúdo de terceiro ou não confiável carregado nessa sessão de Chrome para o sandbox do processo proteger contra. É a mitigação padrão documentada pelo próprio `treosh/lighthouse-ci-action` para CI containerizado.

Isso é uma causa **diferente** da [DT-015](#12-débito-técnico) (que continua aberta): DT-015 é o Lighthouse não conseguir nem *iniciar* um processo Chrome neste ambiente de desenvolvimento (`spawn UNKNOWN`, sandbox de execução do ambiente bloqueando o spawn); esta é o Chrome iniciar e recusar rodar sem a flag, um problema específico do runner do GitHub. Corrigir esta não resolve aquela — mas dá ao projeto, pela primeira vez, uma execução real do `bench` no CI, que é exatamente o que a DT-015 e o [ADR-011](#adr-011--doccheck-ignora-updated-e-changelog-na-comparação) previam como "primeira validação de verdade".

**Causa 2 — `doc-drift` não tinha como reproduzir a região `AUTO:bench` commitada.** O job baixa o artefato de cobertura (para `AUTO:tests`) mas nunca baixava `.size-limit.json`. `buildBench()` em `scripts/sync-master-doc.mjs`, sem esse arquivo, sempre recalcula a região como `_pendente_` — e o `PROJECT.md` commitado tem um número real (110.9 KB) desde que o `bench` foi rodado localmente pela primeira vez. Resultado: `doc:check` reprovava em **todo push que tocasse `PROJECT.md`**, mesmo com o documento perfeitamente sincronizado — o mesmo tipo de falso positivo estrutural que o ADR-011 já tinha resolvido para as regiões `updated`/`changelog`, só que para `bench`.

Corrigido replicando o padrão que já existe para `coverage-summary`: `bench` sobe `.size-limit.json` como artefato (`if: always()` — o arquivo é gravado antes do passo do Lighthouse, então sobrevive mesmo se o Lighthouse falhar depois); `doc-drift` passa a depender também de `bench` (`needs: [verify, bench]`) e baixa esse artefato antes de rodar `doc:check`. O download usa `continue-on-error: true`: se `bench` falhar cedo demais para gerar o arquivo, a região volta a `_pendente_` e o `doc:check` reprova pelo motivo certo (documento realmente desatualizado), em vez de travar num erro de "artefato não encontrado" que esconde a causa.

`doc-drift` também ganhou `if: ${{ !cancelled() }}`: sem isso, o comportamento padrão de `needs` faria o job pular inteiro sempre que `bench` falhasse — e `bench` falhava em todo push antes desta correção. Como `bench` já é check obrigatório por conta própria, isso não abre brecha: se `bench` falhar, o PR continua bloqueado por ele, e `doc-drift` roda mesmo assim com o que conseguiu baixar.

Deliberadamente **não** baixado: `.lighthouseci/manifest.json`. Incluir a tabela de pontuação do Lighthouse na região `AUTO:bench` faria `doc-drift` comparar números que variam de execução para execução (mesmo código, scores diferentes por ruído de medição) contra um valor fixo commitado — reintroduziria exatamente o tipo de falso positivo que este ADR corrige, só que para dados barulhentos em vez de ausentes. A tabela de `size-limit` (tamanho de bundle, determinístico) é a única parte da região `AUTO:bench` que faz sentido comparar byte a byte; a pontuação do Lighthouse continua sendo *gate* (falha o job `bench` se cair do orçamento) sem virar texto commitado.

Validado: `zizmor --persona=pedantic`, offline e online (com token), roda zero achados contra os workflows atualizados — mesmo padrão de validação do [ADR-009](#adr-009--gitleaks-semgrep-e-zizmor-via-cli-fixada-em-vez-de-actions-de-terceiros). Os nomes dos cinco jobs (`verify`, `doc-drift`, `e2e`, `bench`, `audit`) não mudaram — são os checks obrigatórios da proteção de `main` (§8), e alterá-los quebraria a correspondência por nome.

**Correção — `chromeFlags` é string, não array.** A primeira versão deste ADR configurou `chromeFlags: ["--no-sandbox", "--disable-dev-shm-usage"]` (array JSON) — e o CI continuou batendo em `No usable sandbox!` mesmo assim, com o run real confirmando que a flag nunca chegou ao Chrome. Causa: `node_modules/@lhci/cli/src/collect/node-runner.js` faz `chromeFlagsAsString = chromeFlags || ''; chromeFlagsAsString += ' --headless=new'` — um array, ao passar por essa concatenação, é coagido por `Array.prototype.toString()` (junta os elementos por **vírgula**, não espaço), virando `"--no-sandbox,--disable-dev-shm-usage --headless=new"`. O Chrome recebe isso como uma única flag inválida (com vírgula literal), não duas flags — o sandbox nunca foi desativado. Confirmado lendo o código-fonte instalado e o próprio `lighthouse/cli/cli-flags.js`, que declara `'chrome-flags': { type: 'string' }`, "espaço-delimitado" — exatamente o formato de um `--chrome-flags` de linha de comando, nunca um array JSON. Corrigido para `"chromeFlags": "--no-sandbox --disable-dev-shm-usage"` (string). Validado localmente reproduzindo a mesma lógica de concatenação do `node-runner.js` fora do Lighthouse (não dá para rodar o Chrome em si aqui — [DT-015](#12-débito-técnico)), confirmando que a string final fica `"--no-sandbox --disable-dev-shm-usage --headless=new"`, três flags corretas. A primeira execução real do `bench` no CI é quem confirma de fato — ver [DT-020](#12-débito-técnico).

**Correção 2 — `upload-artifact` ignora dotfile por padrão.** `.size-limit.json` nunca chegava ao `doc-drift`: `actions/upload-artifact` tem `include-hidden-files: false` por padrão, e qualquer caminho começando com `.` é silenciosamente pulado (achado lendo o log: `"No files were found with the provided path: .size-limit.json"`, com `include-hidden-files: false` listado entre os parâmetros do passo). Corrigido acrescentando `include-hidden-files: true` ao passo de upload.

Com os dois bugs corrigidos, `doc-drift` ficou verde pela primeira vez e o `bench` passou a medir de verdade — ver [ADR-023](#adr-023--orçamento-de-performance-recalibrado-contra-medição-real-numberofruns-3-permanente) para o que essa primeira medição revelou.

---

### ADR-023 — Orçamento de performance recalibrado contra medição real; `numberOfRuns: 3` permanente
**Data:** 2026-07-28 · **Status:** aceito · **altera o §10**

Com o `bench` finalmente rodando (ADR-022), a primeira execução real reprovou com um resultado estranho: Performance 97/98 na home, mas **80/98** em `/setor/marketing` — uma rota sem nenhum componente cliente, sem motivo óbvio para performar tão pior. Investigado antes de qualquer recalibração, por pedido do usuário.

**O "80" era ruído, não um problema da rota.** `.lighthouserc.json` rodava `numberOfRuns: 1` — uma única medição por URL, em runner de CI compartilhado, é conhecidamente instável (o próprio Lighthouse CI recomenda 3+ para mediana). Subir para `numberOfRuns: 3` e comparar:

| Rota | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| `/` | 0.99 | 0.99 | 0.99 |
| `/setor/marketing` | 0.96 | **0.99** | 0.97 |

Com a mediana, as categorias de Performance, Acessibilidade e Boas Práticas **passam** nas duas rotas — o `assert` do LHCI, que só lista falhas, confirma isso: nenhuma das três categorias aparece entre as reprovações do run recalibrado. `numberOfRuns: 3` fica **permanente**: o custo é ~1 minuto a mais de CI job, contra o risco real de reprovar um PR por acaso estatístico, como quase aconteceu aqui.

**O que sobrou é real, e vem do mesmo lugar nas duas rotas.** Três métricas reprovam de forma consistente, com números praticamente idênticos em `/` e `/setor/marketing` — não é a busca da home (ADR-021) causando isso, porque `/setor/marketing` não tem `<LinkSearch>` e reprova igual:

| Métrica | Orçamento antigo | Medido (mediana) | Causa, por trás do número |
|---|---|---|---|
| LCP | < 1200ms | ~2015–2020ms | 77% do tempo é *Render Delay* (não carregamento de recurso) — trabalho de hidratação sob a simulação de CPU limitada que o Lighthouse aplica em `formFactor: mobile`. O elemento LCP é texto puro (`<p>` do subtítulo), já com `font-display: swap`, então não é fonte bloqueando pintura |
| Peso total | < 250 KB | 294 KB (`/`) / 268 KB (`/setor/marketing`) | Script 159 KiB + Fonte 72 KiB (4 pesos do Fira Sans) + **~35–40 KB / 18 requisições de prefetch automático do `next/link`** — o Next busca em segundo plano os dados RSC dos 7 links de setor visíveis na home, mesmo sem clique |
| JS por rota | < 145 KB | 162.5 KB (idêntico nas duas rotas) | O runtime compartilhado do App Router (~111 KB, `ADR-017`) já citado ali como custo inevitável para hidratação e `next/link` funcionarem, mesmo sem componente cliente próprio |

Isolado por investigação, não por suposição: o achado do `next/link` prefetch veio de filtrar `network-requests` do relatório JSON do Lighthouse por URLs `?_rsc=` — 18 das 34 requisições da home são prefetch de rota, confirmando que uma fração real do excesso de peso é tráfego que o usuário não pediu ainda, não conteúdo da página em si.

**Decisão do usuário: recalibrar o orçamento, não investir em otimização agora.** O LCP de ~2000ms não tem correção barata — é o custo estrutural da hidratação do App Router sob a simulação do Lighthouse, o mesmo runtime que o `ADR-017` já aceitou como inevitável; reduzi-lo de verdade exigiria abrir mão de `next/link`/App Router. O prefetch automático e os 4 pesos do Fira Sans **são** otimizações viáveis e ficam registrados como [DT-021](#12-débito-técnico) para quando fizer sentido revisitar.

Orçamento novo em `.lighthouserc.json`, com margem sobre o medido (não o valor exato, para não reprovar por variação normal de execução):

| Métrica | Orçamento antigo | Medido | **Orçamento novo** | Margem |
|---|---|---|---|---|
| LCP | 1200ms | ~2020ms | **2500ms** | ~24% acima do medido |
| Peso total | 250 KB | 294 KB (pior caso) | **320 KB** | ~9% acima do pior caso |
| JS por rota | 145 KB | 162.5 KB | **175 KB** | ~7,6% acima do medido |

Os artefatos de investigação (`.lighthouseci/*.json` publicados como artefato `lighthouse-reports`) foram removidos do `ci.yml` depois de cumprirem o papel — eram temporários por definição, e o achado já está registrado aqui.

**Correção — `categories:performance` também precisou de margem.** A recalibração inicial deste ADR ajustou LCP, peso total e JS por rota, mas deixou `categories:performance` em `minScore: 0.98` — passou por acaso no run que gerou os números acima. No push seguinte (mesmo código, orçamento já recalibrado), a categoria reprovou nesse limiar: `found: 0.97` na home, a mesma faixa de variação (0.96–0.99) já registrada nesta seção como ruído normal de execução, mesmo com `numberOfRuns: 3`. Não é um metric novo nem uma decisão nova — é a mesma recalibração desta ADR, só que aplicada ao limiar que a primeira rodada de validação não tinha exercitado o suficiente para expor. Ajustado para `minScore: 0.95`, dando a mesma margem de segurança usada nos outros três limiares.

### ADR-024 — `dev.bat` libera a porta 3000 em vez de avisar
**Data:** 2026-08-04 · **Status:** aceito · **altera o §14**

O `dev.bat` da F0 apenas **avisava** quando a 3000 já estava ocupada, e deixava o Next escolher outra porta sozinho. Na prática isso produzia dois problemas recorrentes, ambos relatados pelo usuário: o endereço impresso pelo próprio script (`http://localhost:3000`) passava a mentir, e a causa mais comum da porta ocupada é um `next dev` **deste mesmo projeto** que ficou órfão de uma sessão anterior — encerrar a janela do console nem sempre mata o processo filho. O resultado era uma segunda instância servindo em 3001 enquanto a aba aberta no navegador continuava apontando para a instância velha, com código velho.

`dev.bat` agora chama `:liberar_porta` antes de subir: identifica quem escuta na 3000 (`netstat -ano -p tcp` + `findstr`), mostra o nome do processo e o PID, encerra com `taskkill /f /t` e só então inicia. Decisões dentro dessa rotina que valem registro:

- **Encerra sem perguntar**, por pedido explícito do usuário. É um script de conveniência para *ver o site rodando* (§14) — não roda em CI, não roda no build, e o alvo é sempre um processo local de desenvolvimento. A informação de qual processo morreu fica na tela, então a ação não é silenciosa.
- **PIDs 0 (Idle) e 4 (System) são pulados.** Nunca são o servidor de dev, e `taskkill` neles ou falha ou derruba a máquina.
- **`/t` (árvore).** O que escuta na porta é o `node` filho do `npm run dev`; matar só ele deixa o `npm` pai órfão.
- **Espera o socket ser devolvido** (até ~10 s, checando a cada segundo). O Windows não libera a porta no instante do `taskkill`, e sem essa espera o Next ainda a veria ocupada — o script trocaria um problema pelo outro.
- **Falha não é fatal.** Se o processo for de outro usuário ou elevado, `taskkill` falha, `PORTA_OCUPADA` continua definida e o script cai no aviso antigo ("o Next vai subir em outra porta") em vez de abortar.
- **`echo [^^!]` em vez de `[!]`.** Com `enabledelayedexpansion`, um `!` cru é delimitador de variável e some da saída — o `[!]` do script original já vinha sendo impresso como `[]` desde a F0, e uma linha com `[!]` *e* uma variável `!NOME_PROC!` imprimia texto corrompido. Corrigido nas duas ocorrências.

Consequência aceita: se você estiver rodando **outro** projeto na 3000, o `dev.bat` vai encerrá-lo. É o comportamento pedido, e o nome do processo aparece na tela antes de morrer.

Validado de verdade, não por inspeção: com um servidor HTTP ocupando a 3000, o `dev.bat` identificou `node.exe`, encerrou, esperou a liberação e o `next dev` subiu na 3000 (`GET / 200`, página real de 115 KB). Com a porta livre, a rotina não imprime nada e não faz nada.

### ADR-025 — GPTs da AlquimIA direto no registry; `chatgpt.com` na allowlist, `linktr.ee` fora
**Data:** 2026-08-04 · **Status:** aceito · **altera o §6 e o §7**

O Depto. Químico tinha um link só: `linktr.ee/gptsbondmann`, um hub que reunia os GPTs da AlquimIA. A pedido do usuário, os cinco GPTs passaram a ser links diretos no registry (Desengraxantes, Fluidos e Lubrificantes, Tratamento de Superfícies, Limpeza e Higienização, Produtos de Uso Específico) e o hub saiu. Faz sentido para o propósito do projeto: o §1 existe para acabar com o "qual é o link certo", e um agregador que aponta para outro agregador só adiciona um salto para quem já sabe de qual linha precisa. Como efeito colateral, os cinco passam a ser encontráveis pela busca da home ([ADR-021](#adr-021--busca-client-side-na-home-entra-no-escopo)) — antes, quem digitasse "desengraxante" não achava nada.

**Allowlist (§7).** `chatgpt.com` entrou; `linktr.ee` saiu. Duas decisões separadas:

- **Entrar com `chatgpt.com`** não fere a regra de "sem terceiros" do §7 — essa regra é sobre o que a *nossa página* carrega (script, fonte, cookie, pixel), e continua valendo integralmente: nada muda no bundle, na CSP ou na privacidade de quem visita. Um destino de link é outra categoria, e o registry já aponta para Microsoft, Google, Ploomes e Railway. Vale o mesmo tratamento dos demais: `rel="noopener noreferrer nofollow"` e `Referrer-Policy: no-referrer`, então a OpenAI não recebe de onde o clique veio.
- **Sair com `linktr.ee`** porque nenhum link do registry usa mais esse domínio. Uma entrada morta na allowlist não é neutra: ela deixa passar, sem ninguém perceber, qualquer URL `linktr.ee` que entre por engano no futuro — inclusive uma que não seja da Bondmann. A allowlist só carrega domínio em uso. Voltar é uma linha, se o hub for reintroduzido.

**Ressalva para o link health check da F7.** Os cinco destinos exigem conta ChatGPT e dependem de o GPT continuar compartilhado publicamente — mesma classe de fragilidade do [DT-004](#12-débito-técnico) (SharePoint com token). Pior: `chatgpt.com` fica atrás de proteção anti-bot, então um `HEAD` de runner de CI provavelmente responde 403 ou desafio mesmo com o link saudável. Quando a F7 for implementada, esses cinco precisam de tratamento próprio (verificação tolerante ou exclusão explícita da checagem), senão o cron abre issue toda semana por um problema que não existe.

**Convenção de título.** O usuário enviou os nomes como "AlquimIA - Desengraxantes"; foram gravados como `AlquimIA · Desengraxantes`, com o mesmo separador `·` que o registry já usa em toda família de links (`FB026 · …`, `Mídia Compartilhada · …`). É só apresentação — o conteúdo é o que foi enviado.

O contador do teste de sanidade (`src/content/links.test.ts`) foi de 31 para 35 links, e é ele que amarra o inventário do §6 ao registry: alterar um sem o outro quebra o CI.

## 12. Débito técnico

| ID | Item | Prioridade | Contexto |
|---|---|---|---|
| DT-001 | Link do app OnFly para a Controladoria | P2 | Setor permanece "Em breve" até obter |
| ~~DT-002~~ | ~~Confirmar qual Google Form é *Feedback* e qual é *Alteração de Campanha*~~ | — | **Resolvido em 2026-07-27.** Os dois formulários foram abertos na F2: `1FAIpQLSejna3J9...` é "Feedback BD - Campanhas Regionais Conversão" (confirma `midia-feedback`); `1FAIpQLScTwSUw...` é "BD - Campanhas Regionais - Novos Produtos ou Cidades" (confirma `midia-alteracao-campanha`). O mapeamento por ordem de envio já estava correto |
| DT-003 | Licença webfont da família Info | P3 | Substituiria a Fira Sans, alinhando 100% ao manual |
| DT-004 | Estabilidade dos links SharePoint com token `?e=…` | P2 | Podem expirar; mitigado pelo link health check da F7 |
| ~~DT-005~~ | ~~Domínio definitivo na Vercel~~ | — | **Resolvido em 2026-07-28.** Decisão do usuário: usar o subdomínio gratuito `*.vercel.app` em vez de comprar um domínio próprio — sem custo, ativo assim que o deploy existir. Reavaliar se a Bondmann quiser um domínio institucional próprio depois; a troca não perde histórico de deploy |
| DT-006 | `brace-expansion` vulnerável na árvore de dev | P2 | DoS por expansão ilimitada, corrigido só na `5.0.8`, cujo export quebra o `minimatch` do ESLint. Chega via `eslint-config-next → eslint-plugin-import/jsx-a11y/react`. É dependência de lint: o padrão de glob vem da nossa própria config, não de entrada hostil, e nada disso entra no bundle. Remover o `--omit=dev` do passo bloqueante assim que o `eslint-config-next` subir para `minimatch@10+`. Ver [ADR-007](#adr-007--overrides-de-postcss-e-sharp-política-de-npm-audit) |
| DT-007 | ESLint preso na linha 9 e TypeScript na linha 5 | P3 | Bloqueado por `eslint-plugin-react` (API do ESLint 10) e `typescript-eslint` (peer `<6.1.0`). Revisar a cada bump do `eslint-config-next`. Ver [ADR-008](#adr-008--eslint-fixado-na-linha-9-e-typescript-na-linha-5) |
| DT-008 | Navegadores do Playwright não instalados no ambiente local | P3 | `npm run test:e2e` exige `npx playwright install --with-deps` uma vez por máquina. O CI da F0.5 faz isso no job; localmente é passo manual. As specs da F0 são smoke — o E2E de verdade começa na F3 |
| ~~DT-009~~ | ~~Placeholder de rota em `src/app/page.tsx`~~ | — | **Resolvido em 2026-07-27.** Substituído pela grade real da F3 (`<PageShell>` + `<SectorCard>` por setor) |
| ~~DT-010~~ | ~~Repositório remoto no GitHub ainda não existia~~ | — | **Resolvido em 2026-07-27.** Repositório criado como público em [github.com/OsvaldoBello/linktree-bondmann](https://github.com/OsvaldoBello/linktree-bondmann) (branch protection em repo privado exige GitHub Pro — decisão do usuário foi tornar público) e `main` protegida |
| ~~DT-011~~ | ~~Job `bench` em `ci.yml` é um placeholder~~ | — | **Resolvido em 2026-07-27.** `npm run bench` (`scripts/bench.mjs`) roda `size-limit` + Lighthouse CI de verdade contra o orçamento do §10; `ci.yml` não precisou mudar além de instalar o Chromium do Playwright. Ver [ADR-017](#adr-017--orçamento-de-js-recalibrado-para-a-linha-de-base-real-do-app-router) e [DT-015](#12-débito-técnico) |
| DT-012 | `required_approving_review_count: 1` em `main` sem um segundo mantenedor | P3 | Só o usuário tem acesso ao repositório hoje; GitHub não permite auto-aprovar o próprio PR nem o Dependabot aprova os próprios PRs, então **toda** PR — inclusive patch do Dependabot com auto-merge habilitado — espera uma aprovação manual do usuário antes de poder mergear. É o comportamento mais seguro possível para um mantenedor solo (nada mergeia sem alguém olhar), mas revisar se isso virar atrito real: baixar para 0 é a alternativa, documentando aqui o motivo |
| DT-013 | Assinatura de commit (GPG/SSH) ainda não configurada na máquina do usuário | P1 | `required_signatures` está ativo em `main` por pedido do usuário mesmo sem assinatura configurada localmente. Squash-merge via UI do GitHub contorna isso (o commit de squash é assinado pelo próprio GitHub), mas qualquer push direto ou merge que preserve os commits originais será rejeitado até a assinatura existir. Configurar antes do primeiro merge que não seja squash |
| DT-014 | `--logo-safe-area: 0.3em` é aproximação de engenharia, não medida do manual | P2 | O manual mede a área de não-interferência pela altura de duas letras "B" do wordmark, que o `<Logo>` não renderiza (só o símbolo). Sem o PDF do manual disponível neste ambiente para extrair a proporção real, `0.3em` foi escolhido para preservar a propriedade de escalar com o tamanho do logo. Recalibrar contra o manual original quando o PDF estiver disponível. Ver [ADR-012](#adr-012--safe-area-do-logo-como-fração-proporcional-em-vez-de-medida-do-manual) |
| DT-015 | Lighthouse CI não validado localmente — só `size-limit` | P1 | `npx lhci autorun` falha neste ambiente com `spawn UNKNOWN` ao tentar abrir o Chromium do Playwright (mesmo binário, mesmo comando, falha idêntica no Git Bash e no PowerShell) — sandbox de execução deste ambiente parece bloquear o spawn direto de um processo de navegador fora da ferramenta de browser já provisionada. `size-limit` roda e passa normalmente (não depende de navegador). `.lighthouserc.json` e os limiares do §10 estão configurados e corretos por inspeção. Continua sem validação **local** — mas o CI, que tinha um bug **diferente** bloqueando o Chrome (sandbox do runner, não spawn), foi corrigido no [ADR-022](#adr-022--bench-sem-sandbox-do-chrome-doc-drift-passa-a-depender-de-bench); acompanhar a primeira execução real do job `bench` neste PR — se algum limiar do §10 se provar mal calibrado contra medição real (em vez de estimativa), é aqui e em [DT-020](#12-débito-técnico) que isso se resolve |
| DT-016 | Gate da F5 depende de um deploy que ainda não existe | P1 | `securityheaders.com` só audita uma URL pública — não há uma até a F6 terminar. O gate da F5 foi fechado com essa checagem pendente; roda-la contra o domínio de produção assim que a F6 concluir e registrar o resultado (nota ou achado) na entrada da F5 |
| DT-017 | **Produção deploya de uma branch de feature, não de `main`** | P1 | O projeto na Vercel é `osvaldo-s-projects3/links-bondmann`, e `links-bondmann.vercel.app` serve `feat/f2-registry-links` — não `main`, que segue no commit da F0.5 (`688e80b`), sete commits atrás. Conferido por resposta HTTP em 2026-07-28: produção já servia o build desta branch, com o favicon novo e a home redesenhada. Consequência prática: o §8 promete que "todo deploy de produção é rastreável a um commit assinado, revisado, com CI verde", e hoje isso não se sustenta — a branch de produção não é protegida, não exige revisão e nunca tinha passado pelo CI (o primeiro run foi o [PR #5](https://github.com/OsvaldoBello/linktree-bondmann/pull/5)). Corrigir apontando a *Production Branch* da Vercel de volta para `main` **depois** que o PR #5 mergear, para não deixar produção sem conteúdo no intervalo. **Atualização em 2026-08-04:** produção parou de acompanhar esta branch em algum momento após 28/07 — o push de `38e675e` gerou um deploy de **Preview** (protegido, responde 302 para autenticação, como o §8 exige), e não de Production. `links-bondmann.vercel.app` continua servindo o build de `c784aaa` (28/07, `Age` de ~7 dias na resposta HTTP), e `main` segue parada em `688e80b`. Consequência prática: **o que está no ar está congelado uma semana atrás desta branch** — os 5 GPTs da AlquimIA ([ADR-025](#adr-025--gpts-da-alquimia-direto-no-registry-chatgptcom-na-allowlist-linktree-fora)) não chegam ao ar até o PR #5 mergear. Não foi possível ler a configuração de *Production Branch* pela API (o conector Vercel disponível responde 403/404 para este projeto); conferir no painel |
| DT-018 | Custo de JS da ilha cliente medido por aproximação, não pelo orçamento que vale | P2 | `size-limit` mede só o runtime compartilhado, e ele não mudou com a busca (113 549 B *brotli*, dentro do teto de 120 000 B) — o código da ilha vai para o chunk da rota, que esse orçamento não enxerga. A aproximação local foi comparar home (127.6 KiB de JS *brotli*, sem polyfill) com a tela de setor (125.3 KiB), mesma casca sem ilha: **~2.3 KiB**. O número que o §10 realmente orça por rota (`resource-summary:script:size`, 145 KB) sai do Lighthouse, que não roda neste ambiente ([DT-015](#12-débito-técnico)) — a primeira leitura real é o job `bench` do CI neste PR. Acompanhar esse run; se apertar, recalibrar com medição, nunca com estimativa |
| DT-019 | Pesos e limiares da busca calibrados a olho, sem dado de uso | P3 | Os números do ranking ([ADR-021](#adr-021--busca-client-side-na-home-entra-no-escopo)) — pesos por campo, tolerância de digitação, dispersão máxima da subsequência, teto de 6 resultados — foram escolhidos contra os 31 links de hoje e conferidos no navegador com buscas reais ("dashbord comercial", "cotaçao"). Não há telemetria para saber o que as pessoas realmente digitam, e o §7 não permite coletá-la. Recalibrar por relato de uso, ou quando o registry crescer o bastante para que o teto de 6 comece a esconder resultado bom |
| ~~DT-020~~ | ~~Primeira medição real do Lighthouse reprova o orçamento do §10~~ | — | **Resolvido em 2026-07-28.** Investigado a pedido do usuário antes de decidir: o "80/98" de `/setor/marketing` era ruído de execução única em runner compartilhado (`numberOfRuns: 1`), não um problema real da rota — com mediana de 3 execuções as categorias de score passam nas duas rotas. LCP, peso total e JS por rota continuam reprovando de forma real e consistente, mesma causa nas duas rotas (custo estrutural de hidratação do App Router, não a busca da F6). Orçamento recalibrado contra a medição real. Ver [ADR-023](#adr-023--orçamento-de-performance-recalibrado-contra-medição-real-numberofruns-3-permanente) |
| DT-022 | **Tela de admin para o Marketing editar links — avaliada, decisão pendente** | P1 | Pedido do usuário em 2026-08-04: facilitar a alteração de links pelo Marketing sem passar por um desenvolvedor. É exatamente o gatilho de reavaliação previsto na [ADR-004](#adr-004--registry-no-repositório-em-vez-de-cms-ou-banco) ("reavaliar se a edição por não-desenvolvedores virar necessidade recorrente"), e o §1 lista "painel administrativo" e "autenticação" como fora de escopo sem decisão registrada. Avaliação: um admin **com gravação** (formulário que persiste sozinho) é inviável sem quebrar quatro compromissos estruturais de uma vez — §1 (sem auth/painel), §4 (100% pré-renderizado, zero requisição em runtime), §7 (sem backend, sem cookies, sem terceiros; CSP com `form-action 'none'` e `connect-src 'self'`) e §8 (meta de zero segredos: gravar no repo exige token/GitHub App na Vercel, e autenticar "quem é do Marketing" exige um IdP). Não é impossível — é uma fase inteira (F8), com auth Entra ID, rota de API, revisão de segurança nova e vários ADRs superseded. Um admin **sem gravação** (editor client-side que valida e devolve o trecho pronto de `links.ts` para colar no GitHub) cabe dentro de todas as regras atuais, custa ~1 dia e resolve a parte cara do problema (formato, validação, erro de digitação), mantendo revisão por PR. Decidir entre os dois — ou pelo caminho de custo zero, dar acesso de escrita ao Marketing e ensiná-lo a editar `src/content/links.ts` pela interface web do GitHub — antes de escrever qualquer código |
| DT-021 | Duas otimizações reais de performance identificadas, não aplicadas | P2 | A investigação da [ADR-023](#adr-023--orçamento-de-performance-recalibrado-contra-medição-real-numberofruns-3-permanente) achou dois candidatos concretos, não aplicados porque o usuário optou por recalibrar o orçamento em vez de investir em otimização agora: (1) `next/link` prefetch automático dos 7 `<SectorCard>` da home soma ~35–40 KB / 18 requisições de tráfego que o usuário não pediu ainda — desativável via `prefetch={false}`, com a contrapartida de perder a navegação instantânea; (2) Fira Sans carrega 4 pesos (400/500/600/700, ~72 KiB) — vale conferir quais pesos o design realmente usa antes de cortar. Nenhum dos dois altera o LCP estrutural (custo de hidratação do App Router), mas reduziriam o peso total e o tempo de script de forma mensurável. Revisitar se o orçamento apertar de novo ou se performance virar prioridade |

---

## 13. Changelog

<!-- AUTO:changelog:start -->
Histórico completo:

| Data | Commit | Descrição |
|---|---|---|
| 2026-08-04 | `38e675e` | dev.bat libera a porta 3000; AlquimIA vira 5 GPTs no registry |
| 2026-07-28 | `c784aaa` | recalibrar categories:performance também — mesma variação já documentada no ADR-023 |
| 2026-07-28 | `e0cbb03` | recalibrar orçamento de performance (§10) contra medição real; numberOfRuns 3 permanente |
| 2026-07-28 | `8fa4b5a` | investigação DT-020: 3 execuções do Lighthouse (mediana) + upload dos relatórios |
| 2026-07-28 | `61b1ee4` | docs: registrar a primeira medição real do bench — CI são, orçamento não |
| 2026-07-28 | `95444c8` | fix: upload-artifact ignora .size-limit.json por ser dotfile |
| 2026-07-28 | `42c8168` | fix: chromeFlags do Lighthouse CI precisa ser string, não array |
| 2026-07-28 | `73d39b0` | fix: bench e doc-drift falhavam em todo push — sandbox do Chrome e artefato ausente |
| 2026-07-28 | `2c22658` | F6: dashboard comercial cross-listado e busca client-side na home |
| 2026-07-28 | `febf9ce` | docs: corrigir o DT-017 — produção deploya desta branch, não de main |
| 2026-07-28 | `a5c3a77` | ajustes de home: texto, ordem alfabética, fundo fixo e favicon legível |
| 2026-07-28 | `5ad331b` | favicon verde + unsafe-eval na CSP só em desenvolvimento |
| 2026-07-28 | `cda9711` | F5: hardening da aplicação e do pipeline |
| 2026-07-28 | `6bff187` | F3 + F4: navegação em dois níveis (home → setor), redesenho visual Linktree |
| 2026-07-27 | `9798cd8` | F2: registry de links — schema Zod, 7 links do RH, DT-002 resolvido |
| 2026-07-27 | `9c181ff` | F1: design system — tokens do manual, Fira Sans, Logo e componentes base |
| 2026-07-27 | `e1bb558` | docs: fechar o gate da F0.5 — branch protection ativa, repo público |
| 2026-07-27 | `a7ff485` | fix: semgrep --config auto exige métricas; doc:check compara commit que não existe ainda |
| 2026-07-27 | `688e80b` | ci: bloquear Dependabot de propor eslint/typescript acima do limite do ADR-008 |
| 2026-07-27 | `c71c6db` | F0 + F0.5: fundação do projeto e hardening do pipeline de CI/CD |
<!-- AUTO:changelog:end -->

---

## 14. Runbook

### Desenvolvimento

```bash
npm ci
npm run dev
```

#### Sem terminal: `dev.bat`

Para quem só quer **ver o site rodando** — revisar um link, conferir um texto, mostrar a alguém — a raiz do repositório tem o `dev.bat`. Duplo clique e pronto.

| Comando | O que faz |
|---|---|
| `dev.bat` | Modo desenvolvimento com hot reload em `http://localhost:3000` |
| `dev.bat prod` | Build de produção e servidor local — é o artefato que vai ao ar |

O script confere se o Node está no PATH, instala as dependências com `npm ci --ignore-scripts` quando falta `node_modules`, e **libera a porta 3000 antes de subir** — se algo estiver escutando nela (tipicamente um `next dev` órfão de uma sessão anterior), o script mostra o nome do processo e o PID, encerra e espera a porta ser devolvida. Se o processo não puder ser encerrado (outro usuário, serviço elevado), volta ao aviso antigo e deixa o Next escolher outra porta. Ver [ADR-024](#adr-024--devbat-libera-a-porta-3000-em-vez-de-avisar) — inclusive para a consequência aceita: **outro projeto rodando na 3000 também será encerrado**. **Não substitui `npm run verify`**, que é o que o CI roda: serve para olhar, não para aprovar.

**Se uma tela parar de reagir a clique/digitação sem erro nenhum no console:** reinicie o `dev.bat` em vez de confiar no hot reload. Observado ao vivo em 2026-07-28, com a busca da home ([ADR-021](#adr-021--busca-client-side-na-home-entra-no-escopo)): o HTML novo carregava (campo visível), mas nada respondia — a aba tinha sido aberta antes de `<LinkSearch>` (primeira `'use client'` do projeto) existir, e o Fast Refresh do Turbopack não republica de forma confiável a referência de hidratação quando um Server Component passa a importar um Client Component novo no meio da sessão. Fechar e reabrir o `dev.bat` resolveu. Não é bug do componente — é uma limitação conhecida do Fast Refresh nessa fronteira; um `Ctrl+Shift+R` na aba não basta, porque o problema está no servidor de dev, não no cache do navegador.

### Verificação completa antes de abrir PR

```bash
npm run verify
```

Agrega typecheck, lint, `validate:links`, testes unitários com cobertura e build.

```bash
npm run test:e2e
```

**Feche o `dev.bat` antes.** `playwright.config.ts` tem `reuseExistingServer` fora do CI: com o `next dev` ocupando a 3000, o E2E testa o servidor de desenvolvimento em vez do build de produção que ele deveria auditar. E aí a suíte da busca falha por um motivo que não existe em produção — em `dev`, o cliente de HMR não conecta quando a URL é `127.0.0.1` (o navegador do Playwright) em vez de `localhost`, e sem ele a hidratação não termina, então o campo aceita texto e nada acontece. Contra `npm run start` os 17 testes passam.

Exige os navegadores do Playwright — uma vez por máquina ([DT-008](#12-débito-técnico)):

```bash
npx playwright install --with-deps
```

```bash
npm run bench
```

```bash
npm run doc:sync
```

### Adicionar ou alterar um link

1. Edite `src/content/links.ts` — e **somente** ele.
2. `npm run validate:links` (o build também valida, mas isso é mais rápido).
3. `npm run doc:sync` para atualizar o inventário deste documento.
4. Abra PR. O preview da Vercel permite conferir o destino antes do merge.

### Adicionar um setor

Além dos passos acima: o slug entra na URL e é permanente. Escolha com cuidado — renomear depois quebra links já compartilhados e exige um redirect mais uma entrada no ADR.

### Rollback de produção

Painel da Vercel → Deployments → selecionar o último deploy saudável → **Instant Rollback**. Em seguida abra uma issue registrando a causa, e uma entrada em [Débito técnico](#12-débito-técnico) se a correção não for imediata.

### Um link quebrou

O workflow `link-health.yml` abre uma issue automaticamente com o setor, o título e o status HTTP. Links SharePoint costumam falhar por permissão revogada, não por URL errada — confirme o acesso antes de trocar a URL.

---

## 15. Como manter este documento vivo

Este documento se mantém verdadeiro por mecanismo, não por boa vontade.

### 1. Regiões auto-geradas

Blocos entre `<!-- AUTO:nome:start -->` e `<!-- AUTO:nome:end -->` são reescritos por `scripts/sync-master-doc.mjs`. O script lê:

| Região | Fonte |
|---|---|
| `updated` | `git rev-parse`, data corrente |
| `overview` | `src/content/links.ts` |
| `stack` | `package.json` + lockfile |
| `progress` | checkboxes das fases neste próprio arquivo |
| `tests` | `coverage/coverage-summary.json` |
| `bench` | `.lighthouseci/` e saída do size-limit |
| `changelog` | `git log` desde a última tag |

O script **nunca toca fora dos marcadores**. Se um artefato não existir, a região exibe "pendente" em vez de falhar.

### 2. Hook do Claude Code

`.claude/settings.json` registra um hook `Stop` que roda `npm run doc:sync` ao fim de cada sessão. O documento se atualiza **durante** o trabalho do agente, não depois.

### 3. Trava no CI

O job `doc-drift` roda `doc:sync` e falha se `git diff --exit-code PROJECT.md` acusar diferença. **É impossível mergear com o documento defasado.**

### 4. Seções manuais são responsabilidade de quem altera o código

O CI exige que um PR que toque `src/` também toque `PROJECT.md`. Na prática, ao concluir uma feature você deve:

- marcar o checkbox da fase correspondente;
- registrar no [ADR](#11-registro-de-decisões-adr) qualquer decisão que alguém possa querer questionar depois — especialmente as que parecem óbvias hoje;
- registrar em [Débito técnico](#12-débito-técnico) qualquer atalho tomado, com o motivo;
- atualizar o [Inventário](#6-inventário-de-conteúdo) ao mexer em links.

**Se você mudou o comportamento do sistema e este documento continua igual, uma das duas coisas está errada.**
