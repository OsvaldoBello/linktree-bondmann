import Link from 'next/link';
import { PageShell } from '@/components/PageShell';

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-10 text-center">
        <h1 className="text-2xl font-bold text-bond-green">Página não encontrada</h1>
        <p className="text-white">O setor ou link que você procura não existe.</p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-bond-green px-4 py-2 text-sm font-medium text-bond-navy transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
        >
          Voltar para a home
        </Link>
      </div>
    </PageShell>
  );
}
