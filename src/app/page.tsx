import { sectors } from '@/content/links';

/**
 * Home — placeholder da F0.
 *
 * A grade responsiva de setores, o `<SectorCard>` e o estado "Em breve" são
 * entregas da F3. O que existe aqui serve para o build ter uma rota real e para
 * o E2E ter onde apontar.
 */
export default function HomePage() {
  return (
    <main>
      <h1>Links Bondmann</h1>
      <ul>
        {sectors.map((sector) => (
          <li key={sector.slug} data-status={sector.status}>
            {sector.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
