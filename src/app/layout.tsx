import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Shell da aplicação.
 *
 * A Fira Sans via `next/font` e os tokens do manual entram na F1; os cabeçalhos
 * de segurança e o `robots.txt`, na F5. O `noindex` já está aqui porque custa
 * nada e evita que qualquer preview acidental seja indexado antes disso.
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
