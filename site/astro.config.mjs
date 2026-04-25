// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

/**
 * `base` must match the URL path where the site is hosted (assets are prefixed with it).
 * - Custom domain or root deploy: default `/` → `/_astro/...` (set `PUBLIC_SITE_URL` to your host).
 * - GitHub Pages project site under /reponame/: set `ASTRO_BASE=/reponame/` (the deploy workflow does this).
 */
const site = process.env.PUBLIC_SITE_URL ?? 'https://gitcommitshow.github.io';
const base = process.env.ASTRO_BASE ?? '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [
    starlight({
      title: 'HumanInteraction',
      description:
        'A channel-agnostic protocol for structured agent→human asks: roles, expectations, resolution, and auditability.',
      customCss: ['./src/styles/custom.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/gitcommitshow/agenthumaninteraction',
        },
      ],
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'Start here',
          items: [
            { label: 'Overview', slug: 'docs/overview' },
            { label: 'Protocol', slug: 'docs/protocol' },
            { label: 'Design (requirements)', slug: 'docs/design' },
          ],
        },
        {
          label: 'Project',
          items: [
            { label: 'Contributing', slug: 'docs/contributing' },
            {
              label: 'Repository',
              link: 'https://github.com/gitcommitshow/agenthumaninteraction',
              attrs: { target: '_blank', rel: 'noopener noreferrer' },
            },
          ],
        },
      ],
    }),
  ],
});
