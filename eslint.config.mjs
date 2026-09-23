import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import security from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  security.configs.recommended,

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /* Regras que existem por causa de decisões do PROJECT.md, não por gosto. */

      // §7: todo link externo carrega rel seguro. Há teste automatizado, mas o
      // lint pega antes de chegar ao teste.
      'react/jsx-no-target-blank': [
        'error',
        { allowReferrer: false, enforceDynamicLinks: 'always' },
      ],

      // Nenhuma injeção de HTML — não há conteúdo dinâmico neste site.
      'react/no-danger': 'error',

      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Testes: asserções costumam produzir promessas e acessos indexados que as
  // regras acima reprovariam sem ganho real.
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'security/detect-object-injection': 'off',
    },
  },

  // Scripts Node e arquivos de configuração: ficam fora do programa TypeScript,
  // então as regras que exigem informação de tipo não têm como rodar aqui.
  {
    files: ['scripts/**/*.mjs', '**/*.config.mjs', '**/*.config.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: [
      'scripts/**/*.mjs',
      'scripts/**/*.ts',
      '**/*.config.mjs',
      '**/*.config.js',
      '**/*.config.ts',
    ],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
    rules: {
      'no-console': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-child-process': 'off',
    },
  },

  // Precisa ser o último: desliga tudo que conflita com o Prettier.
  prettier,
);
