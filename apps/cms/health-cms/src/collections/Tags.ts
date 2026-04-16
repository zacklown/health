import type { CollectionConfig } from 'payload'

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: 'Tag',
    plural: 'Tags',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Human-readable tag label shown in the CMS and frontend.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Normalized tag slug used for future filtering and archive URLs.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.trim()) return slugify(value)
            if (typeof data?.name === 'string') return slugify(data.name)
            return value
          },
        ],
      },
    },
  ],
}
