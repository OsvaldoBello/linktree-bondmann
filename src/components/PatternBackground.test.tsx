import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PatternBackground } from './PatternBackground';

describe('<PatternBackground>', () => {
  it('é decorativo: oculto de leitores de tela e não intercepta cliques', () => {
    const { container } = render(<PatternBackground />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper?.className).toContain('pointer-events-none');
  });

  // ADR-019: com `absolute` a textura acompanhava a altura do documento e
  // mudava de escala a cada rota. Ancorada no viewport, ela fica imóvel.
  it('fica ancorada no viewport, não no fluxo da página', () => {
    const { container } = render(<PatternBackground />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('fixed');
    expect(wrapper?.className).not.toContain('absolute inset-0 -z-10');
  });

  it('usa o mesmo símbolo do <Logo>, em baixa opacidade', () => {
    const { container } = render(<PatternBackground />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 1582.88 1742.56');
    expect(svg?.getAttribute('class')).toContain('opacity-10');
  });
});
