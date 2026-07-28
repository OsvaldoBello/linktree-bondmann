import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LinkButton } from '@/components/LinkButton';
import { PageShell } from '@/components/PageShell';
import { RingBadge } from '@/components/RingBadge';
import { sectors } from '@/content/links';

interface SectorPageProps {
  readonly params: Promise<{ slug: string }>;
}

function findSector(slug: string) {
  return sectors.find((sector) => sector.slug === slug);
}

/** Gera as 7 rotas estáticas em build — nenhuma delas é resolvida em runtime. */
export function generateStaticParams() {
  return sectors.map((sector) => ({ slug: sector.slug }));
}

export async function generateMetadata({ params }: SectorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sector = findSector(slug);
  return { title: sector ? `${sector.name} — Links Bondmann` : 'Setor não encontrado' };
}

export default async function SectorPage({ params }: SectorPageProps) {
  const { slug } = await params;
  const sector = findSector(slug);

  if (!sector) {
    notFound();
  }

  return (
    <PageShell>
      <Link
        href="/"
        className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-bond-navy/15 bg-white px-3 py-1.5 text-sm font-medium text-bond-navy shadow-sm transition-colors hover:border-bond-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span aria-hidden="true">←</span> Todos os setores
      </Link>
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-bond-green sm:text-3xl">{sector.name}</h1>
        <p className="text-sm text-white">{sector.tagline}</p>
        <span aria-hidden="true" className="h-0.5 w-16 rounded-full bg-bond-green" />
      </div>
      {sector.links.length > 0 ? (
        <ul className="mx-auto flex max-w-md flex-col gap-2">
          {sector.links.map((link) => (
            <li key={link.id}>
              <LinkButton link={link} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-bond-navy/25 bg-white/90 px-6 py-10 text-center">
          <RingBadge tone="outline" />
          <p className="text-bond-navy">Nenhum link disponível ainda.</p>
        </div>
      )}
    </PageShell>
  );
}
