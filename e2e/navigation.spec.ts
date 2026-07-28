import { expect, test, type Page } from '@playwright/test';
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

test.describe('Busca na home (ADR-021)', () => {
  /**
   * A busca é a única ilha cliente do site: até a hidratação rodar, o `input`
   * existe mas não tem `onChange` ligado, e um `fill` cedo demais se perde.
   * O botão "Limpar busca" só é renderizado por estado do React — vê-lo é a
   * prova de que a hidratação aconteceu.
   *
   * O `fill('')` antes do valor não é supérfluo: se o texto entrou no DOM
   * antes da hidratação, o React adota esse texto como último valor conhecido
   * do campo ao montar, e repetir o mesmo `fill` não geraria evento de
   * mudança nenhum — a tentativa seguinte ficaria presa. Zerar primeiro
   * garante uma transição real de valor em toda tentativa.
   */
  async function search(page: Page, query: string) {
    const input = page.getByLabel('Buscar link');
    await expect(async () => {
      await input.fill('');
      await input.fill(query);
      await expect(page.getByRole('button', { name: 'Limpar busca' })).toBeVisible({
        timeout: 2_000,
      });
    }).toPass({ timeout: 20_000 });
    return input;
  }

  test('acha o link de qualquer setor e mantém o rel seguro', async ({ page }) => {
    await page.goto('/');
    await search(page, 'dashboard comercial');

    const result = page.getByRole('link', { name: /Dashboard Comercial/ });
    await expect(result).toHaveAttribute(
      'href',
      'https://dashboard-bondmann-production.up.railway.app/',
    );
    await expect(result).toHaveAttribute('target', '_blank');
    await expect(result).toHaveAttribute('rel', 'noopener noreferrer nofollow');

    // Enquanto há busca, a lista de setores sai da tela.
    await expect(page.locator('a[href^="/setor/"]')).toHaveCount(0);
  });

  test('tolera acento e erro de digitação', async ({ page }) => {
    await page.goto('/');
    await search(page, 'cotaçao pj');
    await expect(page.getByRole('link', { name: /Cotação PJ/ })).toBeVisible();
  });

  test('busca sem resultado avisa em vez de deixar a tela vazia', async ({ page }) => {
    await page.goto('/');
    await search(page, 'xyzwk');

    await expect(page.getByText(/Nenhum link encontrado para/)).toBeVisible();
    await expect(page.getByRole('link')).toHaveCount(0);
  });

  test('limpar a busca devolve a lista de setores', async ({ page }) => {
    await page.goto('/');
    const input = await search(page, 'dashboard');

    await page.getByRole('button', { name: 'Limpar busca' }).click();
    await expect(input).toHaveValue('');
    await expect(page.getByRole('link')).toHaveCount(activeSectors.length);
  });

  test('home com resultados não tem violações de acessibilidade', async ({ page }) => {
    await page.goto('/');
    await search(page, 'solicitacao');

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
