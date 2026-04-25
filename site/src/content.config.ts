/**
 * Registers Starlight's `docs` collection from two roots:
 * - repo `docs/` (canonical protocol markdown)
 * - `site/src/content/docs/` (landing + project-only pages)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');

export const collections = {
  docs: defineCollection({
    loader: glob({
      base: repoRoot,
      pattern: ['docs/*.md', 'site/src/content/docs/**/*.(md|mdx)'],
    }),
    schema: docsSchema(),
  }),
};
