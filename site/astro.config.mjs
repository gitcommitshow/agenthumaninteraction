// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

/**
 * Defaults target GitHub Pages project site. Override with env when using a custom domain:
 * - PUBLIC_SITE_URL=https://your.domain
 * - ASTRO_BASE=/
 *
 * Base path must match where static files are served. Do not use NODE_ENV alone: `astro build`
 * often runs without NODE_ENV=production, which previously forced base to `/` and caused 404s
 * for all hashed assets on a project page (e.g. /agenthumaninteraction/).
 */
const site = process.env.PUBLIC_SITE_URL ?? 'https://gitcommitshow.github.io';

/** @returns {string} */
function resolveBase() {
  if (process.env.ASTRO_BASE) {
    return process.env.ASTRO_BASE;
  }
  // `astro dev` only — keep localhost at / for convenience. All other CLIs (build, preview, etc.) use the Pages path.
  const subcommand = process.argv[2];
  if (subcommand === 'dev' || process.env.npm_lifecycle_event === 'dev') {
    return '/';
  }
  return '/agenthumaninteraction/';
}

const base = resolveBase();

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
