# CLAUDE.md

## Leia o PROJECT.md antes de qualquer coisa

[`PROJECT.md`](./PROJECT.md) é o documento mestre deste projeto. Ele contém a visão, a identidade visual, a stack, o cronograma de fases, as políticas de segurança, testes e benchmark, e o registro de decisões.

**Antes de escrever código:** leia o `PROJECT.md`, sobretudo a fase corrente no cronograma e o registro de decisões (ADR). Muita coisa que parece uma escolha livre já foi decidida — e o motivo está registrado lá.

**Ao terminar:** atualize o `PROJECT.md`. O hook `Stop` roda `npm run doc:sync` automaticamente para as regiões auto-geradas, mas as seções abaixo são responsabilidade sua:

- marcar o checkbox da fase concluída;
- registrar no **ADR** qualquer decisão que alguém possa querer questionar depois;
- registrar em **Débito técnico** qualquer atalho tomado, com o motivo;
- atualizar o **Inventário de conteúdo** ao mexer em links.

O CI tem um job `doc-drift` que falha se o documento estiver defasado. Não há como contornar.

## Regras que não se negociam

1. **Todo link vive em `src/content/links.ts`.** Nada de URL solta em componente.
2. **O verde `#99C76B` nunca é cor de texto sobre fundo claro** — contraste ≈ 2.0:1, reprova WCAG AA. Fundo, borda, logo e realce, sim. Há teste automatizado.
3. **Sem dependência de runtime nova** sem uma entrada no ADR justificando bundle e superfície de ataque.
4. **Sem cookies, sem terceiros, sem backend.** Se a tarefa parece exigir isso, pare e pergunte — provavelmente há um jeito estático.
5. **Slug de setor é permanente.** Renomear quebra links já compartilhados; exige redirect e entrada no ADR.

## Comandos

```bash
npm run verify
```

Typecheck, lint, validação dos links, testes unitários com cobertura e build. É o que o CI roda.

```bash
npm run doc:sync
```

Atualiza as regiões auto-geradas do `PROJECT.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
