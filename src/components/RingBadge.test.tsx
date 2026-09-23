import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RingBadge } from './RingBadge';

describe('<RingBadge>', () => {
  it('é puramente decorativo — oculto de leitores de tela', () => {
    const { container } = render(<RingBadge />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('usa o mesmo símbolo do <Logo> e do <PatternBackground>', () => {
    const { container } = render(<RingBadge />);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 1582.88 1742.56');
  });

  it('tom padrão ("solid") não usa borda tracejada', () => {
    const { container } = render(<RingBadge />);
    expect(container.firstElementChild?.className).not.toContain('border-dashed');
  });

  it('tom "outline" (setor "em breve") usa borda tracejada em vez de preenchimento', () => {
    const { container } = render(<RingBadge tone="outline" />);
    expect(container.firstElementChild?.className).toContain('border-dashed');
    expect(container.firstElementChild?.className).not.toContain('bg-bond-green');
  });
});
