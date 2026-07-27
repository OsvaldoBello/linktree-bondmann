import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from './brand-symbol';

/**
 * Textura de fundo: o próprio símbolo, ampliado e em baixa opacidade —
 * ver PROJECT.md §2. Sempre decorativo: `aria-hidden` e `pointer-events-none`
 * para nunca competir com o `<Logo>` legível nem interceptar cliques.
 */
export function PatternBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <svg
        viewBox={SYMBOL_VIEW_BOX}
        fill="currentColor"
        className="absolute -right-1/3 -top-1/4 h-[140%] w-[140%] text-bond-green opacity-10"
      >
        {SYMBOL_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>
  );
}
