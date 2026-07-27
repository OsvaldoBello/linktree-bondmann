import Link from 'next/link';
import type { Sector } from '@/content/links';

export interface SectorCardProps {
  readonly sector: Pick<Sector, 'slug' | 'name' | 'tagline' | 'status'>;
}

const CARD_CLASSES = 'flex flex-col gap-1 rounded-xl border px-5 py-4 transition-colors';

/**
 * Setor "coming-soon" (RH, Controladoria) renderiza como `<div>`, não `<a>` —
 * não pode entrar na ordem de tab nem ser ativado, porque não há destino.
 */
export function SectorCard({ sector }: SectorCardProps) {
  if (sector.status === 'coming-soon') {
    return (
      <div
        aria-disabled="true"
        className={`${CARD_CLASSES} border-bond-navy/10 bg-bond-navy/5 text-bond-navy/50`}
      >
        <span className="font-medium">{sector.name}</span>
        <span className="text-sm">{sector.tagline}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/setor/${sector.slug}`}
      className={`${CARD_CLASSES} border-bond-navy/15 bg-white text-bond-navy hover:border-bond-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bond-navy`}
    >
      <span className="font-medium">{sector.name}</span>
      <span className="text-sm text-bond-navy/70">{sector.tagline}</span>
    </Link>
  );
}
