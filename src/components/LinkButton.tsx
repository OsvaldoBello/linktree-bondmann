import type { SectorLink } from '@/content/links';
import { RingBadge } from './RingBadge';

export interface LinkButtonProps {
  readonly link: SectorLink;
  /**
   * Setor de origem. Só a busca da home passa isso — ali o resultado é global
   * e o card precisa dizer de onde veio; na tela de setor o cabeçalho já diz.
   */
  readonly sectorName?: string;
}

/**
 * `target`/`rel` não vêm de prop — são fixos aqui porque §7 do PROJECT.md
 * exige `rel="noopener noreferrer nofollow"` em todo link externo, sempre.
 */
export function LinkButton({ link, sectorName }: LinkButtonProps) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex items-center gap-3 rounded-[28px] border border-bond-navy/15 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-bond-green hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <RingBadge />
      <span className="flex flex-1 flex-col gap-0.5">
        {sectorName ? (
          <span className="text-xs font-semibold tracking-wide text-bond-navy uppercase">
            {sectorName}
          </span>
        ) : null}
        <span className="font-medium text-bond-navy">{link.title}</span>
        {link.description ? (
          <span className="text-sm text-bond-navy">{link.description}</span>
        ) : null}
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0 text-bond-navy transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
      >
        <path d="M7 13 13 7M7 7h6v6" />
      </svg>
    </a>
  );
}
