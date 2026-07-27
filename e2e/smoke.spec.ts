import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Smoke da F0 — prova que o harness E2E sobe o build e navega.
 *
 * Os testes de comportamento (7 cards, RH e Controladoria não focáveis, percurso
 * home → setor → link externo) são das F3 e F4.
 */
test('a home responde e renderiza', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('a home não tem violações de acessibilidade', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
