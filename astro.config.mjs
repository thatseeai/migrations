import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://thatseeai.github.io',
  base: '/migrations',
  integrations: [
    starlight({
      title: 'Migration eBooks',
      description: 'Professional migration guides for modern frameworks',
      logo: {
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/thatseeai/migrations',
      },
      sidebar: [
        {
          label: 'Angular to React',
          autogenerate: { directory: 'angular-to-react' },
        },
        {
          label: 'React to Vue',
          autogenerate: { directory: 'react-to-vue' },
        },
        {
          label: 'Vue to Svelte',
          autogenerate: { directory: 'vue-to-svelte' },
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
      defaultLocale: 'root',
      locales: {
        root: {
          label: '한국어',
          lang: 'ko',
        },
      },
      editLink: {
        baseUrl: 'https://github.com/thatseeai/migrations/edit/main/',
      },
      lastUpdated: true,
      pagination: true,
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    }),
  ],
});
