import type { CollectionConfig } from 'payload'

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL slug, e.g. magnesium-glycinate',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.trim()) return slugify(value)
            if (typeof data?.title === 'string') return slugify(data.title)
            return value
          },
        ],
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Foods', value: 'Foods' },
        { label: 'Supplements', value: 'Supplements' },
        { label: 'Diets', value: 'Diets' },
        { label: 'Studies', value: 'Studies' },
        { label: 'General', value: 'General' },
      ],
      defaultValue: 'General',
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Main article body text.',
      },
    },
    {
      name: 'isNew',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Flag to highlight this item in the New section.',
      },
    },
  ],
}
