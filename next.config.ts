import type { NextConfig } from 'next';

/**
 * Configuração do Next.
 *
 * Cabeçalhos de segurança — PROJECT.md §7. Todos estáticos (mesmo valor em
 * toda resposta): o site é 100% pré-renderizado em build (§4), sem
 * requisição em runtime, então um nonce de CSP por requisição exigiria
 * desativar esse cache e renderizar de novo a cada acesso — foi cogitado e
 * descartado, ver ADR-016.
 *
 * `script-src` carrega `unsafe-inline` só porque o próprio Next injeta
 * scripts inline para hidratar a árvore de Server Components — inevitável
 * no App Router, mesmo sem nenhum componente cliente nosso. Risco real é
 * baixo: a aplicação não tem nenhum ponto onde conteúdo de terceiro ou de
 * usuário vire HTML (o registry é validado em build, não em runtime), então
 * não existe injeção para essa política habilitar. Nenhuma outra diretiva
 * usa `unsafe-inline`.
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
];

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

  headers() {
    return Promise.resolve([{ source: '/:path*', headers: securityHeaders }]);
  },
};

export default nextConfig;
