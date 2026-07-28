import { describe, expect, it } from 'vitest';
import { sectors } from './links';

/**
 * Testes de sanidade do registry.
 *
 * A validação de verdade (HTTPS obrigatório, allowlist de domínios, denylist
 * de encurtadores, slug/id únicos) é `src/lib/links-schema.ts` — roda a cada
 * import de `sectors` (ver final de `links.ts`), inclusive aqui. Os testes
 * abaixo cobrem invariantes de conteúdo que o schema não modela.
 */
describe('registry de setores', () => {
  it('bate com o inventário do PROJECT.md §6: 7 setores, 31 links', () => {
    expect(sectors).toHaveLength(7);
    expect(sectors.flatMap((sector) => sector.links)).toHaveLength(31);
  });

  it('mantém a mesma URL para os links divulgados por mais de um setor', () => {
    // Portal de Chamados (Marketing + TI) e Dashboard Comercial (Comercial +
    // TI) são cross-listados de propósito. O risco real é uma das cópias ser
    // atualizada e a outra não — este teste transforma isso em falha de CI.
    const hrefsById = new Map<string, Set<string>>();
    for (const sector of sectors) {
      for (const link of sector.links) {
        const hrefs = hrefsById.get(link.id) ?? new Set<string>();
        hrefs.add(link.href);
        hrefsById.set(link.id, hrefs);
      }
    }

    for (const [id, hrefs] of hrefsById) {
      expect(hrefs.size, `o id "${id}" aparece com URLs diferentes entre setores`).toBe(1);
    }
  });

  it('está em ordem alfabética por nome (pt-BR) — é a ordem exibida na home', () => {
    const names = sectors.map((sector) => sector.name);
    const ordered = [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    expect(names).toEqual(ordered);
  });

  it('tem slug único por setor', () => {
    const slugs = sectors.map((sector) => sector.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('tem id único dentro de cada setor', () => {
    for (const sector of sectors) {
      const ids = sector.links.map((link) => link.id);
      expect(new Set(ids).size, `ids duplicados em "${sector.slug}"`).toBe(ids.length);
    }
  });

  it('não expõe setor ativo sem link, nem setor "em breve" com link', () => {
    for (const sector of sectors) {
      if (sector.status === 'active') {
        expect(sector.links.length, `setor ativo vazio: "${sector.slug}"`).toBeGreaterThan(0);
      } else {
        expect(sector.links, `setor "em breve" com links: "${sector.slug}"`).toHaveLength(0);
      }
    }
  });

  it('usa apenas https em todo href', () => {
    for (const link of sectors.flatMap((sector) => sector.links)) {
      expect(link.href, `href não-https em "${link.id}"`).toMatch(/^https:\/\//);
    }
  });
});
