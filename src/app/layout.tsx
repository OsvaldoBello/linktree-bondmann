import type { Metadata, Viewport } from 'next';
import { Fira_Sans } from 'next/font/google';
import './globals.css';

/**
 * Shell da aplicação.
 *
 * Os cabeçalhos de segurança e o `robots.txt` entram na F5. O `noindex` já
 * está aqui porque custa nada e evita que qualquer preview acidental seja
 * indexado antes disso.
 */
export const metadata: Metadata = {
  title: 'Links Bondmann',
  description: 'Agregador de links operacionais da Bondmann Química, organizado por setor.',
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// ADR-002: proxy da família Info (Book Italic), que não tem webfont livre.
// `next/font/google` baixa os arquivos em build e os serve pelo próprio
// domínio — nenhuma requisição ao Google em runtime.
const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
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
