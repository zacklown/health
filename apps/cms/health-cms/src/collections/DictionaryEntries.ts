import type { CollectionConfig } from 'payload'

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const DictionaryEntries: CollectionConfig = {
  slug: 'dictionary-entries',
  labels: {
    singular: 'Dictionary Entry',
    plural: 'Dictionary Entries',
  },
  admin: {
    useAsTitle: 'term',
    defaultColumns: ['term', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'term',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Human-readable dictionary term (for example: Glycemic Index).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Hashtag-safe slug (for example: glycemic-index). Used by #word links.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.trim()) return slugify(value)
            if (typeof data?.term === 'string') return slugify(data.term)
            return value
          },
        ],
      },
    },
    {
      name: 'definition',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Main dictionary definition text shown on the Dictionary page.',
      },
    },
    {
      name: 'fullArticle',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: false,
      admin: {
        description:
          'Optional article link shown at the bottom of this dictionary entry as "Go to Full Article ->".',
      },
    },
    {
      name: 'aliases',
      type: 'array',
      admin: {
        description:
          'Optional alternate hashtags that should point to this concept in future updates.',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
