/**
 * Valida `src/content/links.ts` fora do ciclo de build/teste — ver
 * PROJECT.md §7. `assertValidSectors` já roda a cada import de `sectors`;
 * este script só importa o registry e reporta sucesso, para dar feedback
 * rápido a quem está editando `links.ts`. Executado direto pelo Node (Node
 * 24 despe tipos nativamente) — sem alias `@/`, por isso os imports dentro
 * de `content/links.ts` são relativos.
 */
import { sectors } from '../src/content/links.ts';

const totalLinks = sectors.reduce((count, sector) => count + sector.links.length, 0);
console.log(`✓ registry válido: ${sectors.length} setores, ${totalLinks} links.`);
