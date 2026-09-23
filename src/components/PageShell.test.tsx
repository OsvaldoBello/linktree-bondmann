import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageShell } from './PageShell';

describe('<PageShell>', () => {
  it('renderiza o conteúdo dentro de <main>', () => {
    render(
      <PageShell>
        <p>conteúdo</p>
      </PageShell>,
    );
    expect(screen.getByRole('main')).toHaveTextContent('conteúdo');
  });

  it('renderiza o logo no cabeçalho', () => {
    render(
      <PageShell>
        <p>conteúdo</p>
      </PageShell>,
    );
    // `hidden: true`: o jsdom não resolve `max()`/`aspect-ratio` no cálculo
    // de acessibilidade usado pela query padrão do getByRole.
    expect(screen.getByRole('img', { name: 'Bondmann Química', hidden: true })).toBeInTheDocument();
  });

  it('inclui o fundo decorativo, sempre oculto de leitores de tela', () => {
    const { container } = render(
      <PageShell>
        <p>conteúdo</p>
      </PageShell>,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();
  });
});
