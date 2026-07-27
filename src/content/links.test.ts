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
  it('bate com o inventário do PROJECT.md §6: 7 setores, 30 links', () => {
    expect(sectors).toHaveLength(7);
    expect(sectors.flatMap((sector) => sector.links)).toHaveLength(30);
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
