import { PageShell } from '@/components/PageShell';
import { SectorCard } from '@/components/SectorCard';
import { sectors } from '@/content/links';

export default function HomePage() {
  return (
    <PageShell>
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold text-bond-green sm:text-4xl">Links Bondmann</h1>
        <p className="max-w-xs text-sm text-white">Encontre o link certo para o seu setor.</p>
        <span aria-hidden="true" className="h-0.5 w-16 rounded-full bg-bond-green" />
      </div>
      <ul className="mx-auto flex max-w-md flex-col gap-2">
        {sectors.map((sector) => (
          <li key={sector.slug}>
            <SectorCard sector={sector} />
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
