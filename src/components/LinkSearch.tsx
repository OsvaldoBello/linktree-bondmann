'use client';

/**
 * PRIMEIRO COMPONENTE CLIENTE DO PROJETO — a convenção do §4 do PROJECT.md
 * exige justificar `'use client'` em comentário:
 *
 * a busca filtra a lista a cada tecla, e isso não existe sem estado no
 * navegador. As alternativas seriam uma rota `/busca?q=` (renderização por
 * requisição, contra o "tudo pré-renderizado" do §4) ou um backend (fora de
 * escopo por definição). Ver ADR-021.
 *
 * A ilha cliente é só esta: o registry chega por prop já validado em build, a
 * heurística mora em `@/lib/search` (pura, testada) e nada aqui faz rede,
 * cookie ou `localStorage`.
 */

import { useId, useMemo, useState, type ReactNode } from 'react';
import type { Sector } from '@/content/links';
import { searchLinks } from '@/lib/search';
import { LinkButton } from './LinkButton';

export interface LinkSearchProps {
  readonly sectors: readonly Sector[];
  /** Lista de setores da home — o que fica na tela enquanto a busca está vazia. */
  readonly children: ReactNode;
}

export function LinkSearch({ sectors, children }: LinkSearchProps) {
  const inputId = useId();
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  const isSearching = trimmed !== '';
  const hits = useMemo(
    () => (isSearching ? searchLinks(sectors, trimmed) : []),
    [isSearching, sectors, trimmed],
  );

  // Leitor de tela não vê a lista trocar sozinha — o `role="status"` narra.
  const status = !isSearching
    ? ''
    : hits.length === 0
      ? `Nenhum resultado para ${trimmed}`
      : `${hits.length} ${hits.length === 1 ? 'link encontrado' : 'links encontrados'} para ${trimmed}`;

  return (
    <div className="flex flex-col gap-5">
      <div role="search" className="mx-auto w-full max-w-md">
        <label htmlFor={inputId} className="sr-only">
          Buscar link
        </label>

        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-bond-navy"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="m13.5 13.5 3.5 3.5" />
          </svg>

          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar link"
            autoComplete="off"
            // O X nativo do WebKit sairia ao lado do nosso botão de limpar.
            className="w-full rounded-[28px] border border-bond-navy/15 bg-white py-3 pr-11 pl-11 text-bond-navy shadow-sm placeholder:text-bond-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [&::-webkit-search-cancel-button]:appearance-none"
          />

          {isSearching ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpar busca"
              className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-bond-navy hover:bg-bond-navy/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="size-3.5"
              >
                <path d="m6 6 8 8M14 6l-8 8" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>

      {!isSearching ? (
        children
      ) : hits.length > 0 ? (
        <ul className="mx-auto flex w-full max-w-md flex-col gap-2">
          {hits.map((hit) => (
            <li key={`${hit.sector.slug}/${hit.link.id}`}>
              <LinkButton link={hit.link} sectorName={hit.sector.name} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mx-auto w-full max-w-md rounded-[28px] border border-dashed border-white/40 px-4 py-6 text-center text-sm text-white">
          Nenhum link encontrado para “{trimmed}”.
        </p>
      )}
    </div>
  );
}
