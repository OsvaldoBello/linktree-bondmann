import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sectors } from '@/content/links';
import { LinkButton } from './LinkButton';

describe('<LinkButton>', () => {
  it('renderiza título e href', () => {
    render(<LinkButton link={{ id: 'x', title: 'Portal', href: 'https://example.com/' }} />);
    const link = screen.getByRole('link', { name: 'Portal' });
    expect(link).toHaveAttribute('href', 'https://example.com/');
  });

  it('sempre carrega target e rel seguros — nunca vem de fora', () => {
    render(<LinkButton link={{ id: 'x', title: 'Portal', href: 'https://example.com/' }} />);
    const link = screen.getByRole('link', { name: 'Portal' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow');
  });

  it('renderiza a descrição quando existe', () => {
    render(
      <LinkButton
        link={{ id: 'x', title: 'Portal', description: 'Contexto', href: 'https://example.com/' }}
      />,
    );
    expect(screen.getByText('Contexto')).toBeInTheDocument();
  });

  it('omite a descrição quando ausente', () => {
    render(<LinkButton link={{ id: 'x', title: 'Portal', href: 'https://example.com/' }} />);
    // Nome acessível continua só "Portal" — nenhum elemento decorativo (badge,
    // seta) entra no nome, e nenhum texto de descrição é renderizado.
    expect(screen.getByRole('link', { name: 'Portal' })).toBeInTheDocument();
    expect(screen.queryByText('Contexto')).not.toBeInTheDocument();
  });

  it('§7: todo link do registry real produz rel seguro — travado por teste, não por revisão', () => {
    const allLinks = sectors.flatMap((sector) => sector.links);
    expect(allLinks.length).toBeGreaterThan(0);

    for (const link of allLinks) {
      const { unmount } = render(<LinkButton link={link} />);
      // Só um link montado por vez — sem filtrar por nome, que muda quando
      // há `description` (nome acessível concatena título + descrição).
      const anchor = screen.getByRole('link');
      expect(anchor, `rel ausente em "${link.id}"`).toHaveAttribute(
        'rel',
        'noopener noreferrer nofollow',
      );
      expect(anchor, `target ausente em "${link.id}"`).toHaveAttribute('target', '_blank');
      unmount();
    }
  });
});
