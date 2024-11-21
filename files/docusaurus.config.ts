import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import configureTailwind, { PluginOptions } from './src/plugins/configureTailwind';
import type { PluginOptions as SearchPluginOptions } from '@easyops-cn/docusaurus-search-local';

const tailwindOptions: PluginOptions = {
  plugins: ["tailwindcss", "autoprefixer"],
};

const config: Config = {
  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ["en", "ru"],
        indexDocs: true,
        docsRouteBasePath: '/',
      } satisfies SearchPluginOptions,
    ],
  ],
  markdown: {
    mermaid: true,
  },
  title: 'self-hosted junkie',
  tagline: 'Homelab are cool',
  favicon: 'img/favicon.ico',

  url: 'https://garden.saintvegas.cc/',
  baseUrl: '/',

  organizationName: 'AdamsGH',
  projectName: 'garden.saintvegas.cc',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localeConfigs: {
      en: {
        htmlLang: 'en-US',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    configureTailwind(tailwindOptions),
  ],
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'self-hosted junkie',
      logo: {
        alt: 'logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'servicesSidebar',
          position: 'left',
          label: 'Services',
        },
        {
          type: 'docSidebar',
          sidebarId: 'networkingSidebar',
          position: 'left',
          label: 'Networking',
        },
        {
          href: 'https://github.com/AdamsGH',
          label: 'GitHub',
          position: 'right',
        }
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()}. Built with Docusaurus.`,
    },
    prism: {
      // https://github.com/FormidableLabs/prism-react-renderer/tree/master/packages/prism-react-renderer/src/themes
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      // darkTheme: prismThemes.duotoneDark,
      // https://github.com/PrismJS/prism/tree/gh-pages/components
      additionalLanguages: ['bash','ini'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
