/**
 * REGISTRY DE LINKS — fonte única de verdade do projeto.
 *
 * Regras (ver PROJECT.md §7):
 *   - Nenhuma URL vive fora deste arquivo.
 *   - Somente `https://`. Encurtadores são proibidos.
 *   - O `slug` do setor entra na URL pública e é PERMANENTE. Renomear quebra
 *     links já compartilhados — exige redirect e entrada no ADR.
 *
 * Na fase F2 este arquivo passa a ser validado por `src/lib/links-schema.ts`
 * (Zod) em tempo de build. Até lá, os tipos abaixo são a única garantia.
 *
 * Origem dos dados: "Links externos.docx" (Bondmann).
 */

export type SectorStatus = 'active' | 'coming-soon';

export interface SectorLink {
  /** Identificador estável dentro do setor. Usado como key e em testes. */
  readonly id: string;
  readonly title: string;
  /** Contexto curto opcional, exibido abaixo do título. */
  readonly description?: string;
  readonly href: string;
}

export interface Sector {
  readonly slug: string;
  readonly name: string;
  readonly status: SectorStatus;
  /** Frase curta no card da home. */
  readonly tagline: string;
  readonly links: readonly SectorLink[];
}

/**
 * O Portal de Chamados é intencionalmente listado em Marketing e em TI: os dois
 * setores o divulgam como porta de entrada própria. Mesma URL, dois pontos de
 * acesso — não é duplicação acidental.
 */
const PORTAL_DE_CHAMADOS = 'https://portal-chamados-bondmann-production.up.railway.app/workspace';

export const sectors: readonly Sector[] = [
  {
    slug: 'marketing',
    name: 'Marketing',
    status: 'active',
    tagline: 'Chamados, campanhas e mídia compartilhada',
    links: [
      {
        id: 'portal-chamados',
        title: 'Portal de Chamados',
        href: PORTAL_DE_CHAMADOS,
      },
      {
        id: 'midia-solicitacao-entrada',
        title: 'Solicitação de Entrada',
        description: 'Mídia Compartilhada',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSeKM6Zf156lvIcJkHTx-kYyqd8DmEDoHB6Sv_x1Chbm9rtaPA/viewform',
      },
      {
        id: 'midia-detalhes-campanha',
        title: 'Detalhes da Campanha',
        description: 'Mídia Compartilhada',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSf3pXNjoc4XrYhGUcvzIh6InowH8CBiqkCPGuHp_djItndTpg/viewform',
      },
      {
        id: 'midia-planilhas-leads',
        title: 'Planilhas de Leads',
        description: 'Mídia Compartilhada',
        href: 'https://docs.google.com/spreadsheets/d/1JpBSINVkN9K8EBcgbzq3TWdb-fudAemlZaymV7-orMQ/edit?gid=1984125120#gid=1984125120',
      },
      {
        // DT-002: mapeamento a confirmar — ver PROJECT.md §12.
        id: 'midia-feedback',
        title: 'Formulário de Feedback',
        description: 'Mídia Compartilhada',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSejna3J989_DUDwvXOnS1nOYe7PnSRS3CI_4FRIzcyaDy7qWA/viewform',
      },
      {
        // DT-002: mapeamento a confirmar — ver PROJECT.md §12.
        id: 'midia-alteracao-campanha',
        title: 'Solicitação de Alteração de Campanha',
        description: 'Mídia Compartilhada',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLScTwSUwyVE4Rvn5EEvEN5VnU7muZHLcn9N09ywrjeJHm98kzA/viewform',
      },
      {
        id: 'midia-criativos',
        title: 'Criativos',
        description: 'Mídia Compartilhada',
        href: 'https://drive.google.com/drive/folders/1LcuhAMDepDLf2qASl94uxrSDeh_MKREh?usp=sharing',
      },
    ],
  },

  {
    slug: 'ti',
    name: 'TI',
    status: 'active',
    tagline: 'Dashboards e suporte técnico',
    links: [
      {
        id: 'dashboard-comercial',
        title: 'Dashboard Comercial',
        href: 'https://dashboard-bondmann-production.up.railway.app/',
      },
      {
        id: 'portal-chamados',
        title: 'Portal de Chamados',
        href: PORTAL_DE_CHAMADOS,
      },
    ],
  },

  {
    slug: 'compras',
    name: 'Compras',
    status: 'active',
    tagline: 'Fornecedores e logística',
    links: [
      {
        id: 'transportadoras-cif',
        title: 'Transportadoras Habilitadas para Frete CIF',
        href: 'https://bondmannquimica.sharepoint.com/:x:/s/comite.gestao/IQB0rE0ILcgcTKd0LFYVm7EsAYv8wIcWhTOgdYgqEZOogYU?e=uOaSPm',
      },
    ],
  },

  {
    slug: 'comercial',
    name: 'Comercial',
    status: 'active',
    tagline: 'Cotações, cadastros e formulários de campo',
    links: [
      {
        id: 'cotacao-pj',
        title: 'Solicitação de Cotação PJ',
        href: 'https://forms.ploomes.com/form/0777b63c21834a7e939df63d9e5b6b45',
      },
      {
        id: 'cotacao-pf',
        title: 'Solicitação de Cotação PF',
        href: 'https://forms.ploomes.com/form/fe6c058098484383b0a8d84092ab2a8a',
      },
      {
        id: 'rastreio',
        title: 'Solicitação de Rastreio',
        href: 'https://forms.ploomes.com/form/f396f5c9f837450481b8748aca61e046',
      },
      {
        id: 'fb026-diluidor',
        title: 'Solicitação de Diluidor',
        description: 'FB026',
        href: 'https://forms.ploomes.com/form/4080502db21445f2bdb6654aa9f0e211',
      },
      {
        id: 'fb029-mvv-pj',
        title: 'Solicitação de MVV PJ',
        description: 'FB029/00',
        href: 'https://forms.ploomes.com/form/04c1fa429aad4df68ad50995e4ee415f',
      },
      {
        id: 'fb029-mvv-pf',
        title: 'Solicitação de MVV PF',
        description: 'FB029/00',
        href: 'https://forms.ploomes.com/form/9f7ceab64e78485ebecb71a06ef42185',
      },
      {
        id: 'fb060-manutencao-limpeza',
        title: 'Manutenção e Limpeza',
        description: 'FB060/00',
        href: 'https://forms.ploomes.com/form/ac192c1e826147d2b301506e0a4ee3b0',
      },
      {
        id: 'fb074-teste',
        title: 'Solicitação de Teste',
        description: 'FB074/00',
        href: 'https://forms.ploomes.com/form/92ab099234e742f89718bb35a30273f2',
      },
      {
        id: 'ficha-cadastral-matriz',
        title: 'Ficha Cadastral Matriz',
        href: 'https://bondmannquimica.sharepoint.com/sites/bd.representantes/Shared%20Documents/General/Formul%C3%A1rios%20Comerciais/2026/Cadastro_MATRIZ.pdf',
      },
      {
        id: 'ficha-cadastral-filial',
        title: 'Ficha Cadastral Filial',
        href: 'https://bondmannquimica.sharepoint.com/sites/bd.representantes/Shared%20Documents/General/Formul%C3%A1rios%20Comerciais/2026/CADASTRO%20FILIAL.pdf',
      },
      {
        id: 'ficha-cadastral-clientes',
        title: 'Ficha Cadastral para Clientes',
        href: 'https://bondmannquimica.sharepoint.com/:w:/s/bd.representantes/IQCz4gVq0yHCRKKsDtiwlryoAYTxkTFSckctiYh_f4U8EtM?e=Rvcynu',
      },
      {
        // O docx trazia esta URL com `&amp;` (escape de XML); aqui está com `&`
        // literal, como o SharePoint espera.
        id: 'fb037-relacao-amostras',
        title: 'Relação de Amostras',
        description: 'FB037/10',
        href: 'https://bondmannquimica.sharepoint.com/:w:/r/sites/bd.representantes/_layouts/15/Doc.aspx?action=edit&sourcedoc=%7Bed14340c-ad82-4121-ae80-142392adb6a4%7D&wdExp=TEAMS-TREATMENT&web=1&TeamsCID=338ba1e8-644b-45bb-a641-9534c4c8ced2',
      },
    ],
  },

  {
    slug: 'departamento-quimico',
    name: 'Depto. Químico',
    status: 'active',
    tagline: 'Ferramentas de IA aplicadas à química',
    links: [
      {
        id: 'alquimia',
        title: 'AlquimIA',
        description: 'Assistentes de IA da Bondmann',
        href: 'https://linktr.ee/gptsbondmann',
      },
    ],
  },

  {
    slug: 'rh',
    name: 'RH',
    status: 'coming-soon',
    tagline: 'Em breve',
    links: [],
  },

  {
    slug: 'controladoria',
    name: 'Controladoria',
    status: 'coming-soon',
    // DT-001: aguardando o link do aplicativo OnFly.
    tagline: 'Em breve',
    links: [],
  },
];
