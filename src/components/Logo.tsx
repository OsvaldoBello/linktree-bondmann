import { SYMBOL_PATHS, SYMBOL_VIEW_BOX } from './brand-symbol';

export type LogoColor = 'navy' | 'green' | 'white';
export type LogoSize = 'sm' | 'md' | 'lg';

export interface LogoProps {
  readonly color?: LogoColor;
  readonly size?: LogoSize;
}

// `switch` em vez de lookup por objeto: evita indexação dinâmica
// (`security/detect-object-injection`) e ainda cobre o caso hostil (valor
// fora do union, só possível via bypass de tipo) caindo no padrão.
function colorValueFor(color: LogoColor): string {
  switch (color) {
    case 'green':
      return 'var(--color-bond-green)';
    case 'white':
      return '#ffffff';
    case 'navy':
    default:
      return 'var(--color-bond-navy)';
  }
}

// Altura de referência por preset, em px. O piso real — que nenhum destes
// casos pode violar, mesmo se editado incorretamente no futuro — é
// `--logo-min-height` em tokens.css (redução mínima do manual, ver PROJECT.md
// §2). A largura segue do `aspectRatio` abaixo: nunca é escolhida direto.
function heightPxFor(size: LogoSize): number {
  switch (size) {
    case 'sm':
      return 80;
    case 'lg':
      return 220;
    case 'md':
    default:
      return 140;
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
 * A geometria vem de `./brand-symbol` (que espelha `public/brand/logo.svg`)
 * em vez de importar o arquivo, porque renderizar SVG externo como HTML
 * exigiria `dangerouslySetInnerHTML` — proibido pelo lint (`react/no-danger`).
 */
export function Logo({ color = 'navy', size = 'md' }: LogoProps) {
  const heightPx = heightPxFor(size);
  const colorValue = colorValueFor(color);

  return (
    <span
      role="img"
      aria-label="Bondmann Química"
      style={{
        display: 'inline-flex',
        boxSizing: 'content-box',
        height: `max(${heightPx}px, var(--logo-min-height))`,
        aspectRatio: '1582.88 / 1742.56',
        padding: 'var(--logo-safe-area)',
        color: colorValue,
      }}
    >
      <svg
        viewBox={SYMBOL_VIEW_BOX}
        fill="currentColor"
        aria-hidden="true"
        style={{ width: '100%', height: '100%' }}
      >
        {SYMBOL_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </span>
  );
}
