import type { NextConfig } from 'next';

/**
 * Configuração do Next.
 *
 * Os cabeçalhos de segurança completos (CSP com nonce, HSTS, Permissions-Policy)
 * entram na F5 — ver PROJECT.md §7. O que está aqui é o piso: nada que dependa
 * de runtime, nada que abra superfície.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // O `X-Powered-By` entrega a stack de graça. Sem ele.
  poweredByHeader: false,

  // Nenhuma imagem remota: o único ativo gráfico é o logo SVG local.
  images: {
    remotePatterns: [],
  },

  typescript: {
    // Erro de tipo derruba o build. Nunca ligar `ignoreBuildErrors`.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
