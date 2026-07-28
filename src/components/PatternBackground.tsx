import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from './brand-symbol';

/**
 * Textura de fundo: o próprio símbolo, ampliado e em baixa opacidade, mais
 * uma grade de pontos sutil (papel de laboratório) — ver PROJECT.md §2 e
 * ADR-014/ADR-015. O fundo da página é navy (ADR-015), então a textura usa
 * tons claros (verde, branco) em baixa opacidade, não navy sobre navy.
 * Sempre decorativo: `aria-hidden` e `pointer-events-none` para nunca
 * competir com o `<Logo>` legível nem interceptar cliques.
 *
 * Ancorado no viewport (`fixed`), não no fluxo da página — ver ADR-019. Com
 * `absolute`, a textura acompanhava a altura do documento: cada rota tem uma
 * quantidade diferente de cards, então os símbolos (dimensionados em `%` do
 * container) mudavam de escala e de posição a cada navegação, e ainda
 * rolavam junto com o conteúdo. `fixed` deixa o fundo idêntico e imóvel em
 * toda tela.
 */
export function PatternBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-dot-grid absolute inset-0 opacity-[0.06]" />
      <svg
        viewBox={SYMBOL_VIEW_BOX}
        fill="currentColor"
        className="absolute -top-1/4 -right-1/3 h-[140%] w-[140%] text-bond-green opacity-10"
      >
        {SYMBOL_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
      <svg
        viewBox={SYMBOL_VIEW_BOX}
        fill="currentColor"
        className="absolute -bottom-1/4 -left-1/4 h-[90%] w-[90%] rotate-12 text-white opacity-[0.05]"
      >
        {SYMBOL_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>
  );
}
