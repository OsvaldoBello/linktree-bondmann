import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo, type LogoProps } from './Logo';

// `hidden: true` evita que a query passe pelo cálculo de acessibilidade do
// jsdom, que não sabe interpretar `max()`/`aspect-ratio` no `height` inline.
function getWrapper() {
  return screen.getByRole('img', { name: 'Bondmann Química', hidden: true });
}

describe('<Logo>', () => {
  it('renderiza o símbolo com o viewBox oficial e oculto de leitores de tela', () => {
    render(<Logo />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 1582.88 1742.56');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('padrão é navy', () => {
    render(<Logo />);
    expect(getWrapper().style.color).toBe('var(--color-bond-navy)');
  });

  it.each([
    ['navy', 'var(--color-bond-navy)'],
    ['green', 'var(--color-bond-green)'],
    // jsdom normaliza `#ffffff` para `rgb(...)` ao guardar em `style.color`.
    ['white', 'rgb(255, 255, 255)'],
  ] as const)('color="%s" aplica a cor correta', (color, expected) => {
    render(<Logo color={color} />);
    expect(getWrapper().style.color).toBe(expected);
  });

  it.each([
    ['sm', 80],
    ['md', 140],
    ['lg', 220],
  ] as const)(
    'size="%s" usa %ipx como altura de referência, sempre com piso do manual',
    (size, px) => {
      render(<Logo size={size} />);
      expect(getWrapper().style.height).toBe(`max(${px}px, var(--logo-min-height))`);
    },
  );

  it('a área de não-interferência é sempre aplicada e não é configurável', () => {
    render(<Logo />);
    expect(getWrapper().style.padding).toBe('var(--logo-safe-area)');
  });

  it('mantém proporção do símbolo via aspect-ratio, não uma largura fixa', () => {
    render(<Logo />);
    expect(getWrapper().style.aspectRatio).toBe('1582.88 / 1742.56');
  });

  it('não aceita className nem style por prop — props hostis são ignoradas', () => {
    const hostileProps = {
      className: 'w-1 h-1 p-0',
      style: { padding: 0, height: '1px', color: 'red' },
    } as unknown as LogoProps;
    render(<Logo {...hostileProps} />);
    const wrapper = getWrapper();
    expect(wrapper.className).toBe('');
    expect(wrapper.style.padding).toBe('var(--logo-safe-area)');
    expect(wrapper.style.color).toBe('var(--color-bond-navy)');
    expect(wrapper.style.height).toBe('max(140px, var(--logo-min-height))');
  });

  it('color/size fora do union caem no padrão em vez de quebrar', () => {
    const hostile = { color: 'magenta', size: 'xl' } as unknown as LogoProps;
    render(<Logo {...hostile} />);
    const wrapper = getWrapper();
    expect(wrapper.style.color).toBe('var(--color-bond-navy)');
    expect(wrapper.style.height).toBe('max(140px, var(--logo-min-height))');
  });
});
