import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo, type LogoProps } from './Logo';

function getWrapper() {
  return screen.getByRole('img', { name: 'Bondmann Química' });
}

describe('<Logo>', () => {
  it('renderiza o símbolo com o viewBox oficial e oculto de leitores de tela', () => {
    render(<Logo />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 1582.88 1742.56');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('fill', 'currentColor');
  });

  it('nunca usa o atributo `style` — a CSP da F5 não permite `unsafe-inline` em style-src', () => {
    render(<Logo />);
    expect(getWrapper()).not.toHaveAttribute('style');
    expect(document.querySelector('svg')).not.toHaveAttribute('style');
  });

  it('padrão é navy', () => {
    render(<Logo />);
    expect(getWrapper().className).toContain('text-[var(--color-bond-navy)]');
  });

  it.each([
    ['navy', 'text-[var(--color-bond-navy)]'],
    ['green', 'text-[var(--color-bond-green)]'],
    ['white', 'text-white'],
  ] as const)('color="%s" aplica a classe de cor correta', (color, expectedClass) => {
    render(<Logo color={color} />);
    expect(getWrapper().className).toContain(expectedClass);
  });

  it.each([
    ['sm', 'h-[max(80px,var(--logo-min-height))]'],
    ['md', 'h-[max(140px,var(--logo-min-height))]'],
    ['lg', 'h-[max(220px,var(--logo-min-height))]'],
  ] as const)(
    'size="%s" usa a altura de referência correta, sempre com piso do manual',
    (size, expectedClass) => {
      render(<Logo size={size} />);
      expect(getWrapper().className).toContain(expectedClass);
    },
  );

  it('a área de não-interferência é sempre aplicada e não é configurável', () => {
    render(<Logo />);
    expect(getWrapper().className).toContain('p-[var(--logo-safe-area)]');
  });

  it('mantém proporção do símbolo via aspect-ratio, não uma largura fixa', () => {
    render(<Logo />);
    expect(getWrapper().className).toContain('aspect-[1582.88/1742.56]');
  });

  it('não aceita className nem style por prop — props hostis são ignoradas', () => {
    const hostileProps = {
      className: 'w-1 h-1 p-0',
      style: { padding: 0, height: '1px', color: 'red' },
    } as unknown as LogoProps;
    render(<Logo {...hostileProps} />);
    const wrapper = getWrapper();
    expect(wrapper).not.toHaveAttribute('style');
    expect(wrapper.className).not.toBe('w-1 h-1 p-0');
    expect(wrapper.className).toContain('p-[var(--logo-safe-area)]');
    expect(wrapper.className).toContain('text-[var(--color-bond-navy)]');
    expect(wrapper.className).toContain('h-[max(140px,var(--logo-min-height))]');
  });

  it('color/size fora do union caem no padrão em vez de quebrar', () => {
    const hostile = { color: 'magenta', size: 'xl' } as unknown as LogoProps;
    render(<Logo {...hostile} />);
    const wrapper = getWrapper();
    expect(wrapper.className).toContain('text-[var(--color-bond-navy)]');
    expect(wrapper.className).toContain('h-[max(140px,var(--logo-min-height))]');
  });
});
