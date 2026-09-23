import { readFileSync } from 'node:fs';

/**
 * Orçamento do runtime compartilhado (React + Next + roteador cliente) —
 * PROJECT.md §10. É o piso que toda rota paga, mesmo sem nenhum componente
 * cliente nosso — o App Router embute isso para hidratação e navegação via
 * `next/link`. Não tenta medir "toda a rota"; isso é papel do Lighthouse
 * (`total-byte-weight`, `.lighthouserc.json`), que enxerga a página real
 * carregada num navegador, e não só os arquivos de build.
 *
 * Os nomes dos chunks são hash e mudam a cada build, então não dá para
 * apontar um glob fixo com confiança — a lista vem de `rootMainFiles` no
 * próprio manifest que o Next gera (`build-manifest.json`), a mesma fonte
 * que o framework usa para decidir o que injetar em cada página. O bundle
 * de polyfill (`polyfillFiles`) fica de fora de propósito: navegadores que
 * suportam `type="module"` nunca chegam a baixá-lo.
 */
const manifest = JSON.parse(readFileSync('.next/build-manifest.json', 'utf8'));

export default [
  {
    name: 'JS compartilhado (todas as rotas)',
    path: manifest.rootMainFiles.map((file) => `.next/${file}`),
    brotli: true,
    limit: '120 KB',
  },
];
