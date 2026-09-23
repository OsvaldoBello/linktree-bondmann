import { describe, expect, it } from 'vitest';
import { contrastRatio, meetsWcagAA, WCAG_AA_LARGE_TEXT, WCAG_AA_NORMAL_TEXT } from './contrast';

/**
 * Tokens do manual — ver PROJECT.md §2. Duplicados aqui (em vez de
 * importados de `tokens.css`) porque o teste precisa do valor bruto, não da
 * custom property resolvida pelo navegador.
 */
const NAVY = '#2E466F';
const GREEN = '#99C76B';
const WHITE = '#FFFFFF';

describe('contrastRatio', () => {
  it('preto sobre branco é o extremo 21:1 da especificação WCAG', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  it('é simétrico — ordem dos argumentos não importa', () => {
    expect(contrastRatio(NAVY, WHITE)).toBeCloseTo(contrastRatio(WHITE, NAVY), 10);
  });

  it('mesma cor produz razão 1:1', () => {
    expect(contrastRatio(NAVY, NAVY)).toBeCloseTo(1, 10);
  });

  it('rejeita cor fora do formato #rrggbb', () => {
    expect(() => contrastRatio('navy', WHITE)).toThrow(/cor inválida/);
  });
});

describe('pares usados na interface (PROJECT.md §2)', () => {
  it('texto navy sobre fundo branco passa AA (corpo de texto padrão)', () => {
    expect(meetsWcagAA(NAVY, WHITE)).toBe(true);
  });

  it('texto branco sobre fundo navy passa AA (botões, destaques)', () => {
    expect(meetsWcagAA(WHITE, NAVY)).toBe(true);
  });

  it('texto navy sobre fundo verde passa AA (≈5.2:1, único uso de texto sobre verde permitido)', () => {
    expect(meetsWcagAA(NAVY, GREEN)).toBe(true);
    expect(contrastRatio(NAVY, GREEN)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('texto verde sobre fundo navy passa AA (mesmo par, ordem invertida — cabeçalho/hero do redesenho, ADR-015)', () => {
    expect(meetsWcagAA(GREEN, NAVY)).toBe(true);
    expect(contrastRatio(GREEN, NAVY)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('verde nunca é cor de texto sobre fundo claro — reprova AA (≈2.0:1)', () => {
    const ratio = contrastRatio(GREEN, WHITE);
    expect(ratio).toBeGreaterThan(1.5);
    expect(ratio).toBeLessThan(2.5);
    expect(meetsWcagAA(GREEN, WHITE)).toBe(false);
  });

  it('texto grande aceita o limiar reduzido de 3:1', () => {
    expect(WCAG_AA_LARGE_TEXT).toBeLessThan(WCAG_AA_NORMAL_TEXT);
    expect(meetsWcagAA(GREEN, WHITE, true)).toBe(false);
  });
});
