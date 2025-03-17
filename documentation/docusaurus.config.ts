import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const url = process.env.DOCS_URL || 'http://localhost';
const baseUrl = process.env.DOCS_BASE_URL || '/';

const config: Config = {
  title: 'Responsible Business Transparency Protocol Test Suite',
  tagline: 'A comprehensive suite of tools for testing conformance to the RBTP Specification.',
  favicon: 'img/favicon.ico',

  url,
  baseUrl,

  organizationName: 'pyx-industries', // Replace with your GitHub org/user name
  projectName: 'rbtp', // Replace with your repo name

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/pyx-industries/rbtp/tree/master/documentation',
          exclude: ['mock-apps', 'test-suites', 'introduction'],
        },
        blog: false,
        theme: {
          customCss: [
            require.resolve('./src/css/custom.scss'),
            require.resolve('./src/css/index.scss'),
          ],
        },
      } 
    ],
  ],

  plugins: ['docusaurus-plugin-sass'],

  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    slackLink:
    'https://join.slack.com/t/uncefact/shared_invite/zt-1d7hd0js1-sS1Xgk8DawQD9VgRvy1QHQ',
    repoLink: 'https://github.com/pyx-industries/rbtp',
    colorMode: {
      disableSwitch: true,
    },
  image: 'img/un-crm-social-card.png',    
  navbar: {
      // title: '',
      logo: {
        alt: 'RBA Logo',
        src: 'img/rba_logo_text_white.png',
      },
      items: [
        // {
        //    type: 'docsVersionDropdown',
        // },
        // {to: '/docs/introduction', label: 'Introduction', position: 'right'},
        {
          to: '/docs/getting-started',
          label: 'Getting started',
          position: 'right',
        },
        {
          to: '/docs/digital-representation/',
          label: 'Digital Representation',
          position: 'right',
        },
        {
          to: '/docs/contact-and-support/',
          label: 'Contact and Support',
          position: 'right',
        },
        // {
        //   to: '/docs/mock-apps/',
        //   label: 'Tools and support',
        //   position: 'right',
        // },
        // {to: 'https://uncefact.github.io/spec-untp/docs/extensions/', label: 'Extensions', position: 'right'},
        // {
        //   to: 'https://github.com/uncefact/tests-untp',
        //   label: 'Contribute',
        //   position: 'right',
        // },
        // {
        //   href: 'https://app.slack.com/client/T03KNUD7LHZ/C05R8DD2AKZ',
        //   position: 'right',
        //   html: '<svg class="icon icon-slack"><use xlink:href="#slack"></use></svg><span class="menu-item-name">Slack</span>',
        //   className: 'navbar-slack-link',
        // },
        // {
        //   href: 'https://github.com/uncefact/tests-untp',
        //   html: '<svg class="icon"><use xlink:href="#github"></use></svg><span class="menu-item-name">Github</span>',
        //   className: 'navbar-github-link',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Getting Started',
          items: [
            {
              label: 'About',
              to: '/docs/getting-started/about',
            },
            {
              label: 'Purpose',
              to: '/docs/getting-started/purpose',
            },
          ],
        },
        {
          title: 'Digital Representation',
          items: [
            {
              label: 'Schema A',
              to: '/docs/digital-representation/schema-a',
            },
            {
              label: 'Schema B',
              to: '/docs/digital-representation/schema-b',
            },
          ],
        },
        {
          title: 'Contact and Support',
          items: [
            {
              label: 'FAQs',
              to: '/docs/contact-and-support/faqs'
            },
            {
              label: 'Common Issues and Solution',
              to: '/docs/contact-and-support/common-issues-and-solutions'
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/pyx-industries/rbtp/tree/master/documentation',
            },
          ],
        },
      ],
      copyright: `© 2025 Responsible Business Alliance. All Rights Reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  }
};

export default config;
