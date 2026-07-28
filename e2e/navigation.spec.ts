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

test.describe('F5 — hardening', () => {
  test('cabeçalhos de segurança estão presentes em toda rota', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() ?? {};

    expect(headers['content-security-policy']).toBe(
      "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );
    expect(headers['strict-transport-security']).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('no-referrer');
    expect(headers['permissions-policy']).toBe(
      'camera=(), microphone=(), geolocation=(), payment=()',
    );
    expect(headers['x-robots-tag']).toBe('noindex, nofollow, noarchive');
    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('robots.txt nega todo indexador', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    expect(await response?.text()).toContain('Disallow: /');
  });

  test('404 não tem violações de acessibilidade', async ({ page }) => {
    await page.goto('/setor/nao-existe');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
