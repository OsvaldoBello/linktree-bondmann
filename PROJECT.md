# PROJECT.md — Linktree Bondmann

> **Este é o documento mestre do projeto.** Ele é o norte permanente para qualquer pessoa ou agente que trabalhe neste repositório.
>
> **Leia antes de alterar qualquer coisa. Atualize ao terminar.**
>
> Blocos marcados com `<!-- AUTO:… -->` são gerados por `npm run doc:sync` — **não edite à mão**, suas alterações serão sobrescritas. Todo o resto é mantido por humanos e agentes, e é obrigatório mantê-lo verdadeiro.

<!-- AUTO:updated:start -->
| Última sincronização | Commit | Branch |
|---|---|---|
| 2026-07-27 17:13 UTC | `688e80b` | `main` |
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

**Dentro:** site estático, público mas não indexável, hospedado na Vercel. Navegação em dois níveis (home → setor). Conteúdo versionado no repositório.

**Fora (não construir sem nova decisão registrada aqui):** autenticação, painel administrativo, banco de dados, API, busca, favoritos, cookies, qualquer coleta de dado pessoal.

<!-- AUTO:overview:start -->
| Setores | Setores ativos | Links | Domínios distintos |
|---|---|---|---|
| 7 | 5 | 23 | 7 |
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

Garantido por teste automatizado em `src/lib/contrast.test.ts` — qualquer par token/token usado na interface é verificado contra WCAG AA.

### Logotipo

`public/brand/logo.svg` — símbolo de seis anéis em arranjo hexagonal, `viewBox="0 0 1582.88 1742.56"`. Importado com `fill="currentColor"`, permitindo renderizar em verde, navy ou branco conforme o fundo.

Regras do manual traduzidas em código:

- **Área de não-interferência:** equivale à altura de **duas letras "B" maiúsculas** de "BONDMANN". Implementada como o token `--logo-safe-area`, aplicada como padding obrigatório pelo componente `<Logo>`.
- **Redução mínima:** 25 mm (vertical) / 20 mm (horizontal) com byline; 20 / 15 mm sem byline. Traduzida para um `min-width` em px no componente, que não pode ser sobrescrito por prop.
- **Textura de fundo:** o próprio símbolo, ampliado e em baixa opacidade, via `<PatternBackground>` — sempre `aria-hidden`, nunca em tamanho que compita com o logo legível.

### Tipografia

O manual (pág. 3) especifica **Info Book Italic** para títulos e textos principais, e **Info Text / Info Display Book Italic** para subtítulos e textos secundários. A família Info é comercial e não possui webfont livre.

**Substituta adotada: Fira Sans** — projetada por Erik Spiekermann, o mesmo designer da família Info, gratuita e com itálico completo. É o proxy mais fiel disponível. Títulos de setor usam itálico, preservando a personalidade especificada. Ver [ADR-002](#adr-002--fira-sans-como-proxy-da-família-info).

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
| `@playwright/test` | 1.62.0 | dev |
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
| `postcss` | 8.5.23 | dev |
| `prettier` | 3.9.6 | dev |
| `tailwindcss` | 4.3.3 | dev |
| `typescript` | 5.9.3 | dev |
| `typescript-eslint` | 8.65.0 | dev |
| `vitest` | 4.1.10 | dev |
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
  validate-links.mjs          ← valida o registry fora do build
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
    page.tsx                  ← home: grade de setores
    setor/[slug]/page.tsx     ← tela de setor (estática)
    not-found.tsx
  content/
    links.ts                  ← REGISTRY: fonte única de verdade
  lib/
    links-schema.ts           ← Zod + allowlist + denylist
    contrast.ts               ← cálculo de contraste WCAG
  components/
    Logo.tsx                  ← safe-area e tamanho mínimo do manual
    PatternBackground.tsx
    PageShell.tsx
    SectorCard.tsx
    LinkButton.tsx            ← rel seguro obrigatório
  styles/tokens.css           ← tokens do manual
e2e/                          ← specs do Playwright
public/brand/                  ← logo.svg, favicons
```

### Fluxo de dados

`links.ts` → validado por `links-schema.ts` em build → consumido por `page.tsx` (home) e `setor/[slug]/page.tsx` via `generateStaticParams`. Tudo pré-renderizado; nenhuma requisição em runtime.

### Convenções

- Componentes são Server Components por padrão. `'use client'` exige justificativa em comentário.
- Slugs de setor são gerados no registry e imutáveis — mudá-los quebra links compartilhados. Renomear exige entrada no ADR e um redirect.
- Nenhum componente recebe URL por prop arbitrária; sempre um objeto `Link` já validado.

---

## 5. Cronograma de fases

Progresso: marque `[x]` ao concluir. O gate de saída é obrigatório — uma fase não fecha sem ele.

<!-- AUTO:progress:start -->
`████████░░░░░░░░░░░░` **39%** — 13 de 33 itens concluídos
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
- [ ] Proteção de `main`: checks obrigatórios, revisão, commits assinados, histórico linear
- [x] SBOM CycloneDX + `attest-build-provenance`

**Gate:** zizmor sem achados; branch protection ativa; CodeQL e gitleaks limpos. `zizmor --persona=pedantic` (offline e online) roda zero achados contra os cinco workflows — ver [ADR-009](#adr-009--gitleaks-semgrep-e-zizmor-via-cli-fixada-em-vez-de-actions-de-terceiros). O restante do gate (branch protection ativa; CodeQL/gitleaks limpos *em execução real*) depende de um repositório remoto no GitHub, que ainda não existe — ver [DT-010](#12-débito-técnico). **Fase permanece aberta até isso ser resolvido.**

### F1 — Design system
- [ ] `tokens.css` com o padrão cromático do manual
- [ ] Fira Sans via `next/font` (self-hosted)
- [ ] `<Logo>` com safe-area e tamanho mínimo do manual
- [ ] `<PatternBackground>`, `<PageShell>`, `<SectorCard>`, `<LinkButton>`
- [ ] Teste automatizado de contraste WCAG AA

**Gate:** teste de contraste passando; cobertura ≥ 90% nos componentes.

### F2 — Registry de links
- [x] `src/content/links.ts` com os 7 setores e 23 links
- [ ] `links-schema.ts`: HTTPS obrigatório, allowlist de domínios, denylist de encurtadores, slug único
- [ ] `npm run validate:links`
- [ ] Confirmar qual Google Form é *Feedback* e qual é *Alteração de Campanha* ([DT-002](#12-débito-técnico))

**Gate:** build falha com URL `http://`, domínio fora da allowlist ou slug duplicado.

### F3 — Home de setores
- [ ] Grade responsiva mobile-first com os 7 setores
- [ ] Estado "Em breve" para RH e Controladoria (não focável como link)

**Gate:** E2E confirma 7 cards, 2 desabilitados.

### F4 — Telas de setor
- [ ] Rota estática `/setor/[slug]` via `generateStaticParams`
- [ ] Lista de links, navegação de volta, 404 para slug inválido

**Gate:** E2E percorre home → setor → link externo com `rel` seguro.

### F5 — Hardening da aplicação
- [ ] CSP estrita com nonce, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] `X-Robots-Tag`, `robots.txt`, metadata `noindex`
- [ ] axe em todas as rotas

**Gate:** `securityheaders.com` A+; axe sem violações; LHCI dentro do orçamento.

### F6 — Deploy
- [ ] Projeto na Vercel, domínio, preview protegido por PR
- [ ] Runbook de rollback validado na prática

**Gate:** produção no ar, os 23 links conferidos manualmente.

### F7 — Operação
- [ ] Link health check semanal (HEAD nas URLs, abre issue em 4xx/5xx)
- [ ] Vercel Analytics cookieless

**Gate:** primeira execução do cron verde.

---

## 6. Inventário de conteúdo

**7 setores, 23 links.** Fonte original: `Links externos.docx`. Este inventário é a referência humana; a verdade executável é `src/content/links.ts`.

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

### TI — 2 links
| Título | Destino |
|---|---|
| Dashboard Comercial | `dashboard-bondmann-production.up.railway.app` |
| Portal de Chamados | `portal-chamados-bondmann-production.up.railway.app/workspace` |

### Compras — 1 link
| Título | Destino |
|---|---|
| Transportadoras Habilitadas para Frete CIF | SharePoint (planilha) |

### Comercial — 12 links
| Título | Destino |
|---|---|
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

### Depto. Químico — 1 link
| Título | Destino |
|---|---|
| AlquimIA | `linktr.ee/gptsbondmann` |

### RH — *Em breve*
Sem links definidos.

### Controladoria — *Em breve*
Pendência: link do aplicativo OnFly a confirmar ([DT-001](#12-débito-técnico)).

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
| `Content-Security-Policy` | `default-src 'none'; script-src 'self' 'nonce-…'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `no-referrer` |
| `Permissions-Policy` | câmera, microfone, geolocalização e pagamento negados |
| `X-Robots-Tag` | `noindex, nofollow, noarchive` |

Sem `unsafe-inline` em nenhuma diretiva. `Referrer-Policy: no-referrer` impede que a URL interna do linktree vaze para SharePoint, Ploomes ou Google.

### Links externos

Todo `<LinkButton>` renderiza `target="_blank" rel="noopener noreferrer nofollow"`. Garantido por um teste unitário que varre o registry inteiro — não por revisão manual.

### Validação do registry

`links-schema.ts` exige:

- Protocolo `https://` — `http://` é rejeitado
- Hostname na **allowlist**: `*.bondmannquimica.sharepoint.com`, `forms.ploomes.com`, `docs.google.com`, `drive.google.com`, `*.up.railway.app`, `linktr.ee`
- Hostname fora da **denylist de encurtadores**: `bit.ly`, `tinyurl.com`, `t.co`, `goo.gl`, `ow.ly`, `is.gd`
- Slug único por setor, título não vazio

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

### E2E (Playwright)

Chromium + WebKit, viewport mobile e desktop: home lista os 7 setores; RH e Controladoria não navegáveis; setor exibe os links corretos; slug inválido cai em 404; percurso completo por teclado com foco visível.

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
| JS transferido (home) | < 90 KB gzip |
| Peso total da rota | < 250 KB |

<!-- AUTO:bench:start -->
_pendente_ — rode `npm run bench` e depois `npm run doc:sync`.
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

---

## 12. Débito técnico

| ID | Item | Prioridade | Contexto |
|---|---|---|---|
| DT-001 | Link do app OnFly para a Controladoria | P2 | Setor permanece "Em breve" até obter |
| DT-002 | Confirmar qual Google Form é *Feedback* e qual é *Alteração de Campanha* | P1 | Mapeados pela ordem de envio; as URLs `viewform` são indistinguíveis. Verificar abrindo ambos na F2 |
| DT-003 | Licença webfont da família Info | P3 | Substituiria a Fira Sans, alinhando 100% ao manual |
| DT-004 | Estabilidade dos links SharePoint com token `?e=…` | P2 | Podem expirar; mitigado pelo link health check da F7 |
| DT-005 | Domínio definitivo na Vercel | P1 | Necessário antes da F6 |
| DT-006 | `brace-expansion` vulnerável na árvore de dev | P2 | DoS por expansão ilimitada, corrigido só na `5.0.8`, cujo export quebra o `minimatch` do ESLint. Chega via `eslint-config-next → eslint-plugin-import/jsx-a11y/react`. É dependência de lint: o padrão de glob vem da nossa própria config, não de entrada hostil, e nada disso entra no bundle. Remover o `--omit=dev` do passo bloqueante assim que o `eslint-config-next` subir para `minimatch@10+`. Ver [ADR-007](#adr-007--overrides-de-postcss-e-sharp-política-de-npm-audit) |
| DT-007 | ESLint preso na linha 9 e TypeScript na linha 5 | P3 | Bloqueado por `eslint-plugin-react` (API do ESLint 10) e `typescript-eslint` (peer `<6.1.0`). Revisar a cada bump do `eslint-config-next`. Ver [ADR-008](#adr-008--eslint-fixado-na-linha-9-e-typescript-na-linha-5) |
| DT-008 | Navegadores do Playwright não instalados no ambiente local | P3 | `npm run test:e2e` exige `npx playwright install --with-deps` uma vez por máquina. O CI da F0.5 faz isso no job; localmente é passo manual. As specs da F0 são smoke — o E2E de verdade começa na F3 |
| DT-009 | Placeholders de rota em `src/app/page.tsx` e `layout.tsx` | P1 | Existem só para o build da F0 ter rota real. São substituídos pelas entregas das F1 e F3 — não são design |
| DT-010 | Repositório remoto no GitHub ainda não existe | P1 | `.github/workflows/*` e `dependabot.yml` estão prontos e validados localmente (`zizmor` limpo), mas nunca rodaram de verdade — não há remoto, não há branch protection, não há commits assinados. Bloqueia o fechamento do gate da F0.5. Decisão pendente com o usuário: conta pessoal ou organização (afeta o ADR-009 — gitleaks-action pago em organização), visibilidade (público/privado) e configuração de assinatura de commit |
| DT-011 | Job `bench` em `ci.yml` é um placeholder | P2 | Roda `npm run bench --if-present`, que é um no-op enquanto o script não existir. Deixa de ser débito quando a F5/F10 instalar Lighthouse CI + size-limit e o script real for adicionado — nenhuma mudança no workflow será necessária nesse dia |

---

## 13. Changelog

<!-- AUTO:changelog:start -->
Histórico completo:

| Data | Commit | Descrição |
|---|---|---|
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

O script confere se o Node está no PATH, instala as dependências com `npm ci --ignore-scripts` quando falta `node_modules`, e avisa se a porta 3000 já está ocupada. **Não substitui `npm run verify`**, que é o que o CI roda: serve para olhar, não para aprovar.

### Verificação completa antes de abrir PR

```bash
npm run verify
```

Agrega typecheck, lint, `validate:links`, testes unitários com cobertura e build.

```bash
npm run test:e2e
```

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
