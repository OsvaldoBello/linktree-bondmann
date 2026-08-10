import { LinkSearch } from '@/components/LinkSearch';
import { PageShell } from '@/components/PageShell';
import { SectorCard } from '@/components/SectorCard';
import { sectors } from '@/content/links';

export default function HomePage() {
  return (
    <PageShell>
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold text-bond-green sm:text-4xl">Links Bondmann</h1>
        <p className="max-w-xs text-sm text-white">
          Aqui estão todos os links úteis para o seu dia-a-dia
        </p>
        <span aria-hidden="true" className="h-0.5 w-16 rounded-full bg-bond-green" />
      </div>
      {/* A lista de setores é renderizada no servidor e entregue como children:
          a ilha cliente só decide entre mostrá-la ou mostrar os resultados. */}
      <LinkSearch sectors={sectors}>
        <ul className="mx-auto flex w-full max-w-md flex-col gap-2">
          {sectors.map((sector) => (
            <li key={sector.slug}>
              <SectorCard sector={sector} />
            </li>
          ))}
        </ul>
      </LinkSearch>
    </PageShell>
  );
}
