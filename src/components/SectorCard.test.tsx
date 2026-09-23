import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectorCard } from './SectorCard';

describe('<SectorCard>', () => {
  it('setor ativo renderiza como link para /setor/[slug]', () => {
    render(
      <SectorCard
        sector={{ slug: 'marketing', name: 'Marketing', tagline: 'Tag', status: 'active' }}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/setor/marketing');
    expect(link).toHaveTextContent('Marketing');
    expect(link).toHaveTextContent('Tag');
  });

  it('setor "em breve" não é um link — não pode ser ativado nem focado', () => {
    render(
      <SectorCard
        sector={{ slug: 'rh', name: 'RH', tagline: 'Em breve', status: 'coming-soon' }}
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const card = screen.getByText('RH').closest('div');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).not.toHaveAttribute('href');
    expect(card).not.toHaveAttribute('tabindex');
  });
});
