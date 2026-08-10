import { describe, expect, it } from 'vitest';
import { assertValidSectors } from './links-schema';

function validSector(overrides: Partial<Record<string, unknown>> = {}) {
  return [
    {
      slug: 'marketing',
      name: 'Marketing',
      status: 'active',
      tagline: 'Tag',
      links: [{ id: 'a', title: 'Link A', href: 'https://forms.ploomes.com/form/x' }],
      ...overrides,
    },
  ];
}

describe('assertValidSectors', () => {
  it('aceita um registry válido', () => {
    expect(() => assertValidSectors(validSector())).not.toThrow();
  });

  it('aceita subdomínio dentro dos sufixos com wildcard', () => {
    const sectors = validSector({
      links: [
        { id: 'a', title: 'SharePoint', href: 'https://bondmannquimica.sharepoint.com/x' },
        { id: 'b', title: 'Railway', href: 'https://dashboard-x.up.railway.app/' },
      ],
    });
    expect(() => assertValidSectors(sectors)).not.toThrow();
  });

  it('rejeita http://', () => {
    const sectors = validSector({
      links: [{ id: 'a', title: 'Link', href: 'http://forms.ploomes.com/form/x' }],
    });
    expect(() => assertValidSectors(sectors)).toThrow(/protocolo inseguro/);
  });

  it('rejeita domínio fora da allowlist', () => {
    const sectors = validSector({
      links: [{ id: 'a', title: 'Link', href: 'https://example.com/x' }],
    });
    expect(() => assertValidSectors(sectors)).toThrow(/fora da allowlist/);
  });

  it('rejeita encurtador da denylist mesmo que alguém tente reintroduzir', () => {
    const sectors = validSector({
      links: [{ id: 'a', title: 'Link', href: 'https://bit.ly/xyz' }],
    });
    expect(() => assertValidSectors(sectors)).toThrow(/encurtador proibido/);
  });

  it('rejeita slug de setor duplicado', () => {
    const sectors = [...validSector(), ...validSector()];
    expect(() => assertValidSectors(sectors)).toThrow(/slug de setor duplicado/);
  });

  it('rejeita id duplicado dentro do mesmo setor', () => {
    const sectors = validSector({
      links: [
        { id: 'a', title: 'Link 1', href: 'https://forms.ploomes.com/form/x' },
        { id: 'a', title: 'Link 2', href: 'https://forms.ploomes.com/form/y' },
      ],
    });
    expect(() => assertValidSectors(sectors)).toThrow(/id duplicado/);
  });

  it('rejeita título vazio', () => {
    const sectors = validSector({
      links: [{ id: 'a', title: '', href: 'https://forms.ploomes.com/form/x' }],
    });
    expect(() => assertValidSectors(sectors)).toThrow();
  });

  it('rejeita status fora do union', () => {
    const sectors = validSector({ status: 'wip' });
    expect(() => assertValidSectors(sectors)).toThrow();
  });

  it('aceita setor "coming-soon" sem links e sem description nos links', () => {
    const sectors = [
      { slug: 'rh', name: 'RH', status: 'coming-soon', tagline: 'Em breve', links: [] },
    ];
    expect(() => assertValidSectors(sectors)).not.toThrow();
  });
});
