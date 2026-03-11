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
    defaultColumns: ['title', 'category', 'featureOnHome', 'updatedAt'],
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
        { label: 'Foundations', value: 'Foundations' },
        { label: 'Principles', value: 'Principles' },
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
      type: 'code',
      required: true,
      defaultValue: '',
      admin: {
        language: 'markdown',
        description:
          'Main article body in Markdown (supports headings, lists, emphasis, links, inline code, and images via ![alt](url)). Upload images in Media and paste their URL.',
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
    {
      name: 'featureOnHome',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Mark this article as eligible for the Home page featured subject cards.',
      },
    },
    {
      name: 'homeSubject',
      type: 'select',
      options: [
        { label: 'Foundations', value: 'Foundations' },
        { label: 'Principles', value: 'Principles' },
        { label: 'Foods', value: 'Foods' },
        { label: 'Supplements', value: 'Supplements' },
        { label: 'Diets', value: 'Diets' },
        { label: 'Studies', value: 'Studies' },
      ],
      admin: {
        description: 'Select which core subject area this article should represent on the Home page.',
        condition: (_, siblingData) => Boolean(siblingData?.featureOnHome),
      },
    },
    {
      name: 'featureImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Image used on the Home page featured subject card.',
        condition: (_, siblingData) => Boolean(siblingData?.featureOnHome),
      },
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      admin: {
        description: 'Optional related articles shown in the review sidebar.',
      },
    },
  ],
}
