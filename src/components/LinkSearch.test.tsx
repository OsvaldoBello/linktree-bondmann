import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Sector } from '@/content/links';
import { LinkSearch } from './LinkSearch';

const fixture: readonly Sector[] = [
  {
    slug: 'comercial',
    name: 'Comercial',
    status: 'active',
    tagline: 'Cotações',
    links: [
      {
        id: 'dashboard-comercial',
        title: 'Dashboard Comercial',
        href: 'https://dashboard.example.com/',
      },
      {
        id: 'cotacao-pj',
        title: 'Solicitação de Cotação PJ',
        href: 'https://forms.example.com/cotacao-pj',
      },
    ],
  },
];

function renderSearch() {
  return render(
    <LinkSearch sectors={fixture}>
      <ul>
        <li>lista de setores</li>
      </ul>
    </LinkSearch>,
  );
}

describe('<LinkSearch>', () => {
  it('mostra a lista de setores enquanto a busca está vazia', () => {
    renderSearch();
    expect(screen.getByText('lista de setores')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('o campo tem rótulo acessível e região de busca', () => {
    renderSearch();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar link')).toBeInTheDocument();
  });

  it('troca a lista de setores pelos resultados ao digitar', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.type(screen.getByLabelText('Buscar link'), 'dashboard');

    const link = screen.getByRole('link', { name: /Dashboard Comercial/ });
    expect(link).toHaveAttribute('href', 'https://dashboard.example.com/');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow');
    // O setor de origem aparece no card — a busca é global, o resultado
    // sozinho não diria de onde veio.
    expect(link).toHaveTextContent('Comercial');
    expect(screen.queryByText('lista de setores')).not.toBeInTheDocument();
  });

  it('anuncia a contagem de resultados para leitor de tela', async () => {
    const user = userEvent.setup();
    renderSearch();
    const input = screen.getByLabelText('Buscar link');

    await user.type(input, 'dashboard');
    expect(screen.getByRole('status')).toHaveTextContent('1 link encontrado para dashboard');

    await user.clear(input);
    // "comercial" casa no título de um e no nome do setor do outro.
    await user.type(input, 'comercial');
    expect(screen.getByRole('status')).toHaveTextContent('2 links encontrados');
  });

  it('avisa quando nada casa, sem sumir com o campo', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.type(screen.getByLabelText('Buscar link'), 'xyzwk');

    expect(screen.getByText(/Nenhum link encontrado para/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum resultado para xyzwk');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Buscar link')).toHaveValue('xyzwk');
  });

  it('o botão de limpar devolve a lista de setores', async () => {
    const user = userEvent.setup();
    renderSearch();
    const input = screen.getByLabelText('Buscar link');

    await user.type(input, 'dashboard');
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }));

    expect(input).toHaveValue('');
    expect(screen.getByText('lista de setores')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpar busca' })).not.toBeInTheDocument();
  });

  it('busca só com espaço não conta como busca', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.type(screen.getByLabelText('Buscar link'), '   ');

    expect(screen.getByText('lista de setores')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
