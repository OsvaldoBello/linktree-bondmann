import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from './brand-symbol';

export type LogoColor = 'navy' | 'green' | 'white';
export type LogoSize = 'sm' | 'md' | 'lg';

export interface LogoProps {
  readonly color?: LogoColor;
  readonly size?: LogoSize;
}

// `switch` em vez de lookup por objeto: evita indexação dinâmica
// (`security/detect-object-injection`) e ainda cobre o caso hostil (valor
// fora do union, só possível via bypass de tipo) caindo no padrão. Classes
// completas e estáticas (não montadas por interpolação) porque o Tailwind
// escaneia o texto-fonte procurando literais — uma string construída em
// runtime não seria encontrada e cairia fora do CSS gerado.
function colorClassFor(color: LogoColor): string {
  switch (color) {
    case 'green':
      return 'text-[var(--color-bond-green)]';
    case 'white':
      return 'text-white';
    case 'navy':
    default:
      return 'text-[var(--color-bond-navy)]';
  }
}

// Altura de referência por preset, sempre com o piso de `--logo-min-height`
// (tokens.css, redução mínima do manual — PROJECT.md §2) via `max()` dentro
// do valor arbitrário do Tailwind. A largura segue do `aspect-[...]` no
// wrapper: nunca é escolhida direto.
function heightClassFor(size: LogoSize): string {
  switch (size) {
    case 'sm':
      return 'h-[max(80px,var(--logo-min-height))]';
    case 'lg':
      return 'h-[max(220px,var(--logo-min-height))]';
    case 'md':
    default:
      return 'h-[max(140px,var(--logo-min-height))]';
  }
}

/**
 * Símbolo oficial de seis anéis da Bondmann Química.
 *
 * Deliberadamente sem prop de `className`/`style`: a área de não-interferência
 * (`--logo-safe-area`) e o tamanho mínimo (`--logo-min-height`) são regras do
 * manual, não escolhas de quem usa o componente — não podem ser
 * sobrescritos por fora. `color`/`size` aceitam apenas os presets acima; um
 * valor fora do union (só possível via bypass de tipo) cai no padrão em vez
 * de quebrar o layout.
 *
 * Só classes Tailwind, nenhum atributo `style`: a CSP da F5 (PROJECT.md §7)
 * não abre `unsafe-inline` em `style-src`, então um `style={{...}}` aqui
 * seria bloqueado pelo navegador em produção.
 *
 * A geometria vem de `./brand-symbol` (que espelha `public/brand/logo.svg`)
 * em vez de importar o arquivo, porque renderizar SVG externo como HTML
 * exigiria `dangerouslySetInnerHTML` — proibido pelo lint (`react/no-danger`).
 */
export function Logo({ color = 'navy', size = 'md' }: LogoProps) {
  return (
    <span
      role="img"
      aria-label="Bondmann Química"
      className={`inline-flex box-content aspect-[1582.88/1742.56] p-[var(--logo-safe-area)] ${heightClassFor(size)} ${colorClassFor(color)}`}
    >
      <svg
        viewBox={SYMBOL_VIEW_BOX}
        fill="currentColor"
        aria-hidden="true"
        className="h-full w-full"
      >
        {SYMBOL_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}
