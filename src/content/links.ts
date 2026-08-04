/**
 * REGISTRY DE LINKS — fonte única de verdade do projeto.
 *
 * Regras (ver PROJECT.md §7):
 *   - Nenhuma URL vive fora deste arquivo.
 *   - Somente `https://`. Encurtadores são proibidos.
 *   - O `slug` do setor entra na URL pública e é PERMANENTE. Renomear quebra
 *     links já compartilhados — exige redirect e entrada no ADR.
 *   - Os setores ficam em ordem alfabética por `name` (pt-BR) — a ordem deste
 *     array é a ordem exibida na home. Travado por teste em `links.test.ts`.
 *
 * Validado por `../lib/links-schema` (Zod) a cada import de `sectors` — um
 * link malicioso ou com typo derruba o build antes de chegar a produção.
 * Import relativo (não `@/lib/...`) de propósito: `scripts/validate-links.ts`
 * executa este arquivo direto pelo Node, sem resolução de alias do bundler.
 *
 * Origem dos dados: "Links externos.docx" (Bondmann), mais os links do RH
 * enviados diretamente pelo usuário em 2026-07-27.
 */

import { assertValidSectors } from '../lib/links-schema.ts';

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

/**
 * Mesmo caso do Portal de Chamados: o Dashboard Comercial é mantido pela TI,
 * mas quem o consome no dia-a-dia é o Comercial. Aparece nos dois setores, com
 * a mesma URL — quem procura o dashboard não deveria precisar saber de quem é
 * a infraestrutura por trás dele.
 */
const DASHBOARD_COMERCIAL = 'https://dashboard-bondmann-production.up.railway.app/';

export const sectors: readonly Sector[] = [
  {
    slug: 'comercial',
    name: 'Comercial',
    status: 'active',
    tagline: 'Dashboard, cotações, cadastros e formulários de campo',
    links: [
      {
        id: 'dashboard-comercial',
        title: 'Dashboard Comercial',
        description: 'Indicadores de vendas',
        href: DASHBOARD_COMERCIAL,
      },
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
    slug: 'controladoria',
    name: 'Controladoria',
    status: 'coming-soon',
    // DT-001: aguardando o link do aplicativo OnFly.
    tagline: 'Em breve',
    links: [],
  },

  {
    slug: 'departamento-quimico',
    name: 'Depto. Químico',
    status: 'active',
    tagline: 'Ferramentas de IA aplicadas à química',
    // Os cinco GPTs da AlquimIA substituíram, em 2026-08-04, o hub único no
    // linktr.ee que apontava para eles: um salto a menos para quem já sabe de
    // qual linha precisa. Ver ADR-025.
    links: [
      {
        id: 'alquimia-desengraxantes',
        title: 'AlquimIA · Desengraxantes',
        href: 'https://chatgpt.com/g/g-6a038e60c6d481919ae59b4ee52741f2-alquimia-desengraxantes',
      },
      {
        id: 'alquimia-fluidos-lubrificantes',
        title: 'AlquimIA · Fluidos e Lubrificantes',
        href: 'https://chatgpt.com/g/g-6a04e37ff97081919701b5202ccf9468-alquimia-fluidos-e-lubrificantes',
      },
      {
        id: 'alquimia-tratamento-superficies',
        title: 'AlquimIA · Tratamento de Superfícies',
        href: 'https://chatgpt.com/g/g-6a04e536a5348191bb5e53ec9b9690f3-alquimia-tratamento-de-superficies',
      },
      {
        id: 'alquimia-limpeza-higienizacao',
        title: 'AlquimIA · Limpeza e Higienização',
        href: 'https://chatgpt.com/g/g-6a32a16ffa4c819192f221b7ddf158bb-alquimia-limpeza-e-higienizacao',
      },
      {
        id: 'alquimia-uso-especifico',
        title: 'AlquimIA · Produtos de Uso Específico',
        href: 'https://chatgpt.com/g/g-6a32b355a7a88191995be0d96c415da1-alquimia-uso-especifico',
      },
    ],
  },

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
        id: 'midia-feedback',
        title: 'Formulário de Feedback',
        description: 'Mídia Compartilhada',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSejna3J989_DUDwvXOnS1nOYe7PnSRS3CI_4FRIzcyaDy7qWA/viewform',
      },
      {
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
    slug: 'rh',
    name: 'RH',
    status: 'active',
    tagline: 'Ajuda de custo, contratação e incentivo à educação',
    links: [
      {
        id: 'ajuda-custo-solicitacao',
        title: 'Solicitação de Ajuda de Custo',
        href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=yHI_dbastEqyd9z4ODo4ZhPzhx3jf2FFkZZPqcXjYU1UMU9FT0E0OEE2UFQzRExIMzUwMlA5UlNHVy4u',
      },
      {
        id: 'ajuda-custo-prorrogacao',
        title: 'Prorrogação de Ajuda de Custo',
        href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=yHI_dbastEqyd9z4ODo4ZhPzhx3jf2FFkZZPqcXjYU1UQU5SNENISFhXNVQzNzdSR1JKN042UDlEWC4u',
      },
      {
        id: 'ajuda-custo-acompanhamento',
        title: 'Acompanhamento de Ajuda de Custo',
        href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=yHI_dbastEqyd9z4ODo4ZhPzhx3jf2FFkZZPqcXjYU1URE1FTUhPWlVaOUpBTUJBSU1LMzJVNlFRSS4u',
      },
      {
        id: 'incentivo-educacao',
        title: 'Requerimento Programa de Incentivo à Educação',
        href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=yHI_dbastEqyd9z4ODo4ZhPzhx3jf2FFkZZPqcXjYU1UOFJRTkVGUzNNRUtXQzZEVUlRU0FZT0NBMC4u',
      },
      {
        id: 'fb030-alteracao-cargo',
        title: 'Alteração de Cargo',
        description: 'FB030',
        href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=yHI_dbastEqyd9z4ODo4ZhPzhx3jf2FFkZZPqcXjYU1UNEpZNTJESzZGWTlETDhSUUQ4TlpPUkFIMy4u',
      },
      {
        id: 'fb031-solicitacao-contratacao',
        title: 'Solicitação de Contratação',
        description: 'FB031',
        href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=yHI_dbastEqyd9z4ODo4ZhPzhx3jf2FFkZZPqcXjYU1UNFBLR1k5RDIwT0tQRTdTOTNHVlAwMVBCVC4u',
      },
      {
        id: 'fb032-encerramento-contrato',
        title: 'Solicitação de Encerramento de Contrato',
        description: 'FB032',
        href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=yHI_dbastEqyd9z4ODo4ZhPzhx3jf2FFkZZPqcXjYU1UNjUzQkVMU1ZWN1o1UDNJTkRTTDM1NUNXMy4u',
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
        href: DASHBOARD_COMERCIAL,
      },
      {
        id: 'portal-chamados',
        title: 'Portal de Chamados',
        href: PORTAL_DE_CHAMADOS,
      },
    ],
  },
];

assertValidSectors(sectors);
