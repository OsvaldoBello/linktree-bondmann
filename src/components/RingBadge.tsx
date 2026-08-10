import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from './brand-symbol';

export type RingBadgeTone = 'solid' | 'outline';

export interface RingBadgeProps {
  readonly tone?: RingBadgeTone;
}

/**
 * Medalhão decorativo com o símbolo de seis anéis — reaproveitado em todo
 * card de setor e de link, para que a marca fique presente em cada item da
 * lista, não só no cabeçalho. `tone="outline"` marca estado "em breve".
 *
 * Sempre `aria-hidden`: o nome do setor/link ao lado já carrega a informação.
 */
export function RingBadge({ tone = 'solid' }: RingBadgeProps) {
  const isOutline = tone === 'outline';

  return (
    <span
      aria-hidden="true"
      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
        isOutline
          ? 'border border-dashed border-bond-navy/25 text-bond-navy/25'
          : 'bg-bond-green text-bond-navy'
      }`}
    >
      <svg viewBox={SYMBOL_VIEW_BOX} fill="currentColor" className="h-4 w-4">
        {SYMBOL_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}
