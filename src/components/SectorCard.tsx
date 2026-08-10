import Link from 'next/link';
import type { Sector } from '@/content/links';
import { RingBadge } from './RingBadge';

export interface SectorCardProps {
  readonly sector: Pick<Sector, 'slug' | 'name' | 'tagline' | 'status'>;
}

const BASE_CLASSES =
  'group flex items-center gap-3 rounded-[28px] px-4 py-3 text-left transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0';

/**
 * Setor "coming-soon" (Controladoria) renderiza como `<div>`, não `<a>` —
 * não pode entrar na ordem de tab nem ser ativado, porque não há destino.
 */
export function SectorCard({ sector }: SectorCardProps) {
  if (sector.status === 'coming-soon') {
    return (
      <div
        aria-disabled="true"
        className={`${BASE_CLASSES} border border-dashed border-bond-navy/25 bg-white/90`}
      >
        <RingBadge tone="outline" />
        <span className="flex flex-1 flex-col gap-1.5">
          <span className="font-semibold text-bond-navy">{sector.name}</span>
          <span className="inline-flex w-fit items-center rounded-full bg-bond-green px-2 py-0.5 text-xs font-semibold tracking-wide text-bond-navy uppercase">
            {sector.tagline}
          </span>
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/setor/${sector.slug}`}
      className={`${BASE_CLASSES} border border-bond-navy/15 bg-white shadow-sm hover:-translate-y-0.5 hover:border-bond-green hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
    >
      <RingBadge />
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-semibold text-bond-navy">{sector.name}</span>
        <span className="text-sm text-bond-navy">{sector.tagline}</span>
      </span>
    </Link>
  );
}
