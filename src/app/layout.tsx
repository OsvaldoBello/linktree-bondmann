import type { Metadata, Viewport } from 'next';
import { Fira_Sans } from 'next/font/google';
import './globals.css';

/**
 * Shell da aplicação.
 *
 * `noindex`/`nofollow` também saem como cabeçalho `X-Robots-Tag` (mais
 * confiável que a meta tag para bots que não renderizam HTML) e como
 * `public/robots.txt` — ver `next.config.ts` e PROJECT.md §7.
 */
export const metadata: Metadata = {
  title: 'Links Bondmann',
  description: 'Agregador de links operacionais da Bondmann Química, organizado por setor.',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// ADR-002: proxy da família Info, que não tem webfont livre. O itálico do
// manual (Info Book Italic) foi abandonado no redesenho — ver ADR-015 —
// então só o estilo `normal` é baixado, reduzindo o peso de fonte pela
// metade. `next/font/google` baixa os arquivos em build e os serve pelo
// próprio domínio — nenhuma requisição ao Google em runtime.
const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  variable: '--font-fira-sans',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={firaSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
