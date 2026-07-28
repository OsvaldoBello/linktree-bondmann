import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sectors } from '../src/content/links';

const activeSectors = sectors.filter((sector) => sector.status === 'active');
const comingSoonSectors = sectors.filter((sector) => sector.status === 'coming-soon');

test.describe('F3 — home de setores', () => {
  test('lista todos os setores, com os "em breve" desabilitados', async ({ page }) => {
    await page.goto('/');

    const links = page.getByRole('link');
    await expect(links).toHaveCount(activeSectors.length);

    for (const sector of activeSectors) {
      await expect(page.locator(`a[href="/setor/${sector.slug}"]`)).toBeVisible();
    }

    for (const sector of comingSoonSectors) {
      await expect(page.getByText(sector.name, { exact: true })).toBeVisible();
      await expect(page.locator(`a[href="/setor/${sector.slug}"]`)).toHaveCount(0);
    }
  });

  test('cards "em breve" não entram na ordem de tab', async ({ page }) => {
    await page.goto('/');

    for (const sector of comingSoonSectors) {
      const card = page.getByText(sector.name, { exact: true }).locator('..');
      await expect(card).not.toHaveAttribute('tabindex');
    }
  });

  test('home não tem violações de acessibilidade', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('F4 — telas de setor', () => {
  test('percorre home → setor → link externo com rel seguro', async ({ page, context }) => {
    const sector = activeSectors[0];
    if (!sector) throw new Error('nenhum setor ativo no registry');
    const firstLink = sector.links[0];
    if (!firstLink) throw new Error(`setor "${sector.slug}" não tem links`);

    await page.goto('/');
    await page.locator(`a[href="/setor/${sector.slug}"]`).click();
    await expect(page).toHaveURL(`/setor/${sector.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(sector.name);

    const externalLink = page.getByRole('link', { name: firstLink.title });
    await expect(externalLink).toHaveAttribute('href', firstLink.href);
    await expect(externalLink).toHaveAttribute('target', '_blank');
    await expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer nofollow');

    const [popup] = await Promise.all([context.waitForEvent('page'), externalLink.click()]);
    await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
    await popup.close();
  });

  test('slug inválido cai em 404', async ({ page }) => {
    const response = await page.goto('/setor/nao-existe');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada');
  });

  test('setor sem links exibe estado "em breve"', async ({ page }) => {
    const sector = comingSoonSectors[0];
    if (!sector) throw new Error('nenhum setor "em breve" no registry');

    await page.goto(`/setor/${sector.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(sector.name);
    await expect(page.getByText('Nenhum link disponível ainda.')).toBeVisible();
  });

  test('setor "em breve" não tem violações de acessibilidade', async ({ page }) => {
    const sector = comingSoonSectors[0];
    if (!sector) throw new Error('nenhum setor "em breve" no registry');

    await page.goto(`/setor/${sector.slug}`);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('link de volta retorna para a home', async ({ page }) => {
    const sector = activeSectors[0];
    if (!sector) throw new Error('nenhum setor ativo no registry');

    await page.goto(`/setor/${sector.slug}`);
    await page.getByRole('link', { name: 'Todos os setores' }).click();
    await expect(page).toHaveURL('/');
  });

  test('setor não tem violações de acessibilidade', async ({ page }) => {
    const sector = activeSectors[0];
    if (!sector) throw new Error('nenhum setor ativo no registry');

    await page.goto(`/setor/${sector.slug}`);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
