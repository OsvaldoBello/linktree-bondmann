import { describe, expect, it } from 'vitest';
import type { Sector } from '@/content/links';
import { sectors } from '@/content/links';
import { editDistance, normalize, searchLinks, subsequenceSpan } from './search';

/**
 * Fixture pequena e estável: os testes de ranking não podem quebrar toda vez
 * que alguém adiciona um link ao registry real. O registry real é exercitado
 * separadamente, no fim do arquivo, só com asserções que sobrevivem a ele
 * crescer.
 */
const fixture: readonly Sector[] = [
  {
    slug: 'comercial',
    name: 'Comercial',
    status: 'active',
    tagline: 'Cotações',
    links: [
      {
        id: 'dashboard-comercial',
        title: 'Dashboard Comercial',
        description: 'Indicadores de vendas',
        href: 'https://dashboard.example.com/',
      },
      {
        id: 'cotacao-pj',
        title: 'Solicitação de Cotação PJ',
        href: 'https://forms.example.com/cotacao-pj',
      },
      {
        id: 'fb029-mvv-pj',
        title: 'Solicitação de MVV PJ',
        description: 'FB029/00',
        href: 'https://forms.example.com/mvv-pj',
      },
    ],
  },
  {
    slug: 'ti',
    name: 'TI',
    status: 'active',
    tagline: 'Dashboards',
    links: [
      {
        id: 'dashboard-comercial',
        title: 'Dashboard Comercial',
        href: 'https://dashboard.example.com/',
      },
      {
        id: 'portal-chamados',
        title: 'Portal de Chamados',
        href: 'https://portal.example.com/workspace',
      },
    ],
  },
  {
    slug: 'controladoria',
    name: 'Controladoria',
    status: 'coming-soon',
    tagline: 'Em breve',
    links: [],
  },
];

const titlesFor = (query: string, limit?: number) =>
  searchLinks(fixture, query, limit).map((hit) => hit.link.title);

describe('normalize', () => {
  it('remove acento, caixa e pontuação', () => {
    expect(normalize('Solicitação de Cotação PJ')).toBe('solicitacao de cotacao pj');
    expect(normalize('FB029/00')).toBe('fb029 00');
    expect(normalize('  Depto.  Químico  ')).toBe('depto quimico');
  });

  it('devolve string vazia quando não sobra nada útil', () => {
    expect(normalize('   ')).toBe('');
    expect(normalize('!!! ??? ...')).toBe('');
  });
});

describe('editDistance', () => {
  it('é zero para strings idênticas', () => {
    expect(editDistance('cotacao', 'cotacao')).toBe(0);
  });

  it('degenera para o tamanho da outra string quando uma é vazia', () => {
    expect(editDistance('', 'portal')).toBe(6);
    expect(editDistance('portal', '')).toBe(6);
  });

  it('conta substituição, inserção, remoção e transposição', () => {
    expect(editDistance('cotacao', 'cotacoo')).toBe(1); // substituição
    expect(editDistance('cotacao', 'cotacaos')).toBe(1); // inserção
    expect(editDistance('cotacao', 'cotaca')).toBe(1); // remoção
    expect(editDistance('cotacao', 'cotacaa')).toBe(1);
    expect(editDistance('cotacao', 'ctoacao')).toBe(2); // transposição = 2 edições
    expect(editDistance('dashboard', 'portal')).toBe(8);
    // Caso canônico da literatura — se este passa, a matriz está certa.
    expect(editDistance('kitten', 'sitting')).toBe(3);
  });
});

describe('subsequenceSpan', () => {
  it('mede o trecho que contém os caracteres na ordem', () => {
    expect(subsequenceSpan('dash', 'dashboard')).toBe(4);
    expect(subsequenceSpan('dshbrd', 'dashboard comercial')).toBe(9);
  });

  it('devolve -1 quando falta caractere ou a ordem está errada', () => {
    expect(subsequenceSpan('dashz', 'dashboard')).toBe(-1);
    expect(subsequenceSpan('draob', 'dashboard')).toBe(-1);
  });

  it('escolhe o menor trecho, não o primeiro encontrado', () => {
    // Começar pelo primeiro "c" daria um trecho de ponta a ponta; o segundo
    // "c" dá o casamento compacto, que é o que importa para o ranking.
    expect(subsequenceSpan('cot', 'casa cot')).toBe(3);
    // E mantém o menor quando a ocorrência seguinte é mais espalhada.
    expect(subsequenceSpan('cot', 'cot coot')).toBe(3);
  });
});

describe('searchLinks', () => {
  it('devolve vazio para busca vazia ou só com pontuação', () => {
    expect(searchLinks(fixture, '')).toEqual([]);
    expect(searchLinks(fixture, '   ')).toEqual([]);
    expect(searchLinks(fixture, '!!!')).toEqual([]);
  });

  it('põe o casamento exato de título em primeiro, com score máximo', () => {
    const hits = searchLinks(fixture, 'dashboard comercial');
    expect(hits[0]?.link.title).toBe('Dashboard Comercial');
    expect(hits[0]?.score).toBe(1);
  });

  it('acha por prefixo', () => {
    expect(titlesFor('dash')).toContain('Dashboard Comercial');
  });

  it('acha por trecho no meio da palavra', () => {
    expect(titlesFor('hamados')).toContain('Portal de Chamados');
  });

  it('tolera erro de digitação', () => {
    expect(titlesFor('cotacaoo')).toContain('Solicitação de Cotação PJ');
    expect(titlesFor('portao')).toContain('Portal de Chamados');
  });

  it('acha por subsequência compacta quando nada mais casa', () => {
    expect(titlesFor('dshbrd')).toContain('Dashboard Comercial');
  });

  it('ignora subsequência espalhada por um título inteiro', () => {
    // "cotacao" é subsequência de "solicitação de mvv pj"? não — mas de
    // títulos longos costuma ser, por acaso. O limite de dispersão existe
    // para que acaso não vire resultado.
    const spread: readonly Sector[] = [
      {
        slug: 'marketing',
        name: 'Marketing',
        status: 'active',
        tagline: 'Campanhas',
        links: [
          {
            id: 'alteracao-campanha',
            title: 'Solicitação de Alteração de Campanha',
            href: 'https://forms.example.com/alteracao',
          },
        ],
      },
    ];
    expect(searchLinks(spread, 'cotacao')).toEqual([]);
  });

  it('ignora acento e caixa da busca', () => {
    expect(titlesFor('COTAÇÃO')).toContain('Solicitação de Cotação PJ');
  });

  it('acha pelo código do formulário, que vive na descrição', () => {
    expect(titlesFor('fb029')).toEqual(['Solicitação de MVV PJ']);
  });

  it('acha pelo nome do setor', () => {
    expect(titlesFor('ti')).toContain('Portal de Chamados');
  });

  it('exige que todo token da busca case em algum campo', () => {
    expect(titlesFor('cotacao pj')).toContain('Solicitação de Cotação PJ');
    expect(titlesFor('cotacao xyzwk')).toEqual([]);
  });

  it('não repete link cross-listado — e não atribui a nenhum setor', () => {
    const hits = searchLinks(fixture, 'dashboard');
    const dashboards = hits.filter((hit) => hit.link.title === 'Dashboard Comercial');
    expect(dashboards).toHaveLength(1);
    // Comercial e TI divulgam o mesmo link — nenhum dos dois é "o dono".
    expect(dashboards[0]?.sector).toBeUndefined();
  });

  it('leva junto o setor de origem de cada resultado, quando não é cross-listado', () => {
    const hit = searchLinks(fixture, 'chamados')[0];
    expect(hit?.sector).toEqual({ slug: 'ti', name: 'TI' });
  });

  it('respeita o limite e devolve os melhores primeiro', () => {
    const hits = searchLinks(fixture, 'solicitacao', 1);
    expect(hits).toHaveLength(1);
    const scores = searchLinks(fixture, 'solicitacao').map((hit) => hit.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('não devolve setor "em breve" — ele não tem link', () => {
    expect(titlesFor('controladoria')).toEqual([]);
  });
});

describe('busca contra o registry real', () => {
  it('acha o Dashboard Comercial sem atribuí-lo a Comercial ou TI — é cross-listado', () => {
    const hit = searchLinks(sectors, 'dashboard comercial')[0];
    expect(hit?.link.href).toBe('https://dashboard-bondmann-production.up.railway.app/');
    expect(hit?.sector).toBeUndefined();
  });

  it('acha o Portal de Chamados sem atribuí-lo a um único setor — é cross-listado', () => {
    const hit = searchLinks(sectors, 'portal de chamados')[0];
    expect(hit?.link.href).toBe(
      'https://portal-chamados-bondmann-production.up.railway.app/workspace',
    );
    expect(hit?.sector).toBeUndefined();
  });

  it('acha um formulário do RH mesmo com a busca escrita errado', () => {
    expect(searchLinks(sectors, 'ajuda de custo').length).toBeGreaterThan(0);
    expect(searchLinks(sectors, 'ajuda de cust').length).toBeGreaterThan(0);
  });

  it('devolve apenas links que existem no registry', () => {
    const hrefs = new Set(sectors.flatMap((sector) => sector.links).map((link) => link.href));
    for (const hit of searchLinks(sectors, 'solicitacao', 50)) {
      expect(hrefs.has(hit.link.href)).toBe(true);
    }
  });
});
