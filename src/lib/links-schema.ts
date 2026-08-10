import { z } from 'zod';

/**
 * Validação do registry — ver PROJECT.md §7. Roda a cada import de
 * `sectors` (chamada no final de `src/content/links.ts`), então um link
 * malicioso ou com typo derruba o build antes de chegar a produção.
 */

const ALLOWED_HOSTNAMES = new Set([
  'forms.ploomes.com',
  'docs.google.com',
  'drive.google.com',
  // GPTs da AlquimIA (Depto. Químico). `linktr.ee` saiu da lista no mesmo
  // movimento: era usado por um único link, hoje substituído. Ver ADR-025.
  'chatgpt.com',
]);

// Domínios com wildcard: qualquer subdomínio é aceito.
const ALLOWED_HOSTNAME_SUFFIXES = ['bondmannquimica.sharepoint.com', 'up.railway.app'];

const DENYLISTED_HOSTNAMES = new Set(['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd']);

function isAllowedHostname(hostname: string): boolean {
  if (ALLOWED_HOSTNAMES.has(hostname)) {
    return true;
  }
  return ALLOWED_HOSTNAME_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );
}

const secureUrlSchema = z.url().superRefine((href, ctx) => {
  const { protocol, hostname } = new URL(href);

  if (protocol !== 'https:') {
    ctx.addIssue({
      code: 'custom',
      message: `protocolo inseguro em "${href}" — apenas https:// é permitido`,
    });
    return;
  }

  if (DENYLISTED_HOSTNAMES.has(hostname)) {
    ctx.addIssue({ code: 'custom', message: `domínio de encurtador proibido: "${hostname}"` });
    return;
  }

  if (!isAllowedHostname(hostname)) {
    ctx.addIssue({ code: 'custom', message: `domínio fora da allowlist: "${hostname}"` });
  }
});

const sectorLinkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  href: secureUrlSchema,
});

const sectorSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['active', 'coming-soon']),
  tagline: z.string().min(1),
  links: z.array(sectorLinkSchema),
});

const sectorsSchema = z.array(sectorSchema).superRefine((sectors, ctx) => {
  const seenSlugs = new Set<string>();

  sectors.forEach((sector, sectorIndex) => {
    if (seenSlugs.has(sector.slug)) {
      ctx.addIssue({
        code: 'custom',
        path: [sectorIndex, 'slug'],
        message: `slug de setor duplicado: "${sector.slug}"`,
      });
    }
    seenSlugs.add(sector.slug);

    const seenIds = new Set<string>();
    sector.links.forEach((link, linkIndex) => {
      if (seenIds.has(link.id)) {
        ctx.addIssue({
          code: 'custom',
          path: [sectorIndex, 'links', linkIndex, 'id'],
          message: `id duplicado no setor "${sector.slug}": "${link.id}"`,
        });
      }
      seenIds.add(link.id);
    });
  });
});

/** Lança `ZodError` (mensagem legível) se o registry violar alguma regra do §7. */
export function assertValidSectors(sectors: unknown): void {
  sectorsSchema.parse(sectors);
}
