import type { SectorLink } from '@/content/links';

export interface LinkButtonProps {
  readonly link: SectorLink;
}

/**
 * `target`/`rel` não vêm de prop — são fixos aqui porque §7 do PROJECT.md
 * exige `rel="noopener noreferrer nofollow"` em todo link externo, sempre.
 */
export function LinkButton({ link }: LinkButtonProps) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex flex-col gap-0.5 rounded-lg border border-bond-navy/15 bg-white px-4 py-3 transition-colors hover:border-bond-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bond-navy"
    >
      <span className="font-medium text-bond-navy">{link.title}</span>
      {link.description ? (
        <span className="text-sm text-bond-navy/70">{link.description}</span>
      ) : null}
    </a>
  );
}
