/**
 * Contraste WCAG 2.2 — fórmula oficial (relative luminance + contrast ratio),
 * ver https://www.w3.org/TR/WCAG22/#dfn-relative-luminance.
 *
 * Existe para que a regra do PROJECT.md §2 ("o verde nunca é cor de texto
 * sobre fundo claro") seja travada por código, não por revisão humana.
 */

const HEX_PATTERN = /^#([0-9a-f]{6})$/i;

function toLinearChannel(channel8bit: number): number {
  const srgb = channel8bit / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const match = HEX_PATTERN.exec(hex);
  const value = match?.[1];
  if (!value) {
    throw new Error(`cor inválida: "${hex}" — esperado #rrggbb`);
  }
  const r = toLinearChannel(parseInt(value.slice(0, 2), 16));
  const g = toLinearChannel(parseInt(value.slice(2, 4), 16));
  const b = toLinearChannel(parseInt(value.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores, sempre ≥ 1. */
export function contrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexA);
  const luminanceB = relativeLuminance(hexB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Limiares WCAG 2.2 AA para texto. */
export const WCAG_AA_NORMAL_TEXT = 4.5;
export const WCAG_AA_LARGE_TEXT = 3;

export function meetsWcagAA(hexA: string, hexB: string, isLargeText = false): boolean {
  const threshold = isLargeText ? WCAG_AA_LARGE_TEXT : WCAG_AA_NORMAL_TEXT;
  return contrastRatio(hexA, hexB) >= threshold;
}
