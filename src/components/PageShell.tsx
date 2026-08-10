import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { PatternBackground } from './PatternBackground';

export interface PageShellProps {
  readonly children: ReactNode;
}

/** Casca comum das telas: fundo com textura, logo e área de conteúdo centralizada. */
export function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative isolate min-h-dvh">
      <PatternBackground />
      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex justify-center">
          <Logo color="green" size="md" />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
