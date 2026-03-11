import type { GlobalConfig } from 'payload'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'about',
      type: 'group',
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
          defaultValue: 'About',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue: 'A practical health knowledge base built one article at a time.',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          defaultValue:
            'Meta(bolic)data organizes notes on food, supplements, diets, and studies into decision-ready summaries you can apply in daily life.',
        },
      ],
    },
  ],
  defaultValue: {
    about: {
      eyebrow: 'About',
      title: 'A practical health knowledge base built one article at a time.',
      description:
        'Meta(bolic)data organizes notes on food, supplements, diets, and studies into decision-ready summaries you can apply in daily life.',
    },
  },
}
