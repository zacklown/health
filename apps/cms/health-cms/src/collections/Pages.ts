import type { CollectionConfig } from 'payload'

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const rockRatingScale = [
  { label: 'Low Pebble', value: 'low-pebble', score: 1 },
  { label: 'Medium Rock', value: 'medium-rock', score: 2 },
  { label: 'High Rock', value: 'high-rock', score: 3 },
  { label: 'High Boulder', value: 'high-boulder', score: 4 },
] as const

const scientificEvidenceScale = [
  { label: 'Low', value: 'low', score: 1 },
  { label: 'Moderate-Low', value: 'moderate-low', score: 2 },
  { label: 'Moderate', value: 'moderate', score: 3 },
  { label: 'Moderate-High', value: 'moderate-high', score: 4 },
  { label: 'High', value: 'high', score: 5 },
] as const

const getScaleScore = (
  value: unknown,
  scale: ReadonlyArray<{ value: string; score: number }>,
): number | null => {
  if (typeof value !== 'string') return null
  const match = scale.find((item) => item.value === value)
  return match?.score ?? null
}

const articleSectionFields: NonNullable<CollectionConfig['fields']>[number][] = [
  {
    name: 'heading',
    type: 'text',
    required: true,
  },
  {
    name: 'headingLevel',
    label: 'Heading Level',
    type: 'select',
    required: true,
    defaultValue: 'h2',
    options: [
      { label: 'H2', value: 'h2' },
      { label: 'H3', value: 'h3' },
      { label: 'H4', value: 'h4' },
    ],
    admin: {
      description:
        'Choose the semantic heading level for this section. Use H3/H4 for subsections nested under earlier sections.',
    },
  },
  {
    name: 'body',
    type: 'code',
    defaultValue: '',
    admin: {
      language: 'markdown',
      description:
        'Optional section content in Markdown. Leave blank when a heading is only used to introduce nested subsections.',
    },
  },
  {
    type: 'row',
    fields: [
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        admin: {
          width: '40%',
          description: 'Optional image displayed with this section.',
        },
      },
      {
        name: 'imagePlacement',
        label: 'Image Side',
        type: 'select',
        defaultValue: 'right',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ],
        admin: {
          width: '30%',
          condition: (_, siblingData) => Boolean(siblingData?.image),
          description: 'Choose which side of the section the image should occupy.',
        },
      },
      {
        name: 'imageSize',
        label: 'Image Size',
        type: 'select',
        defaultValue: 'medium',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ],
        admin: {
          width: '30%',
          condition: (_, siblingData) => Boolean(siblingData?.image),
          description: 'Controls how much width the image takes inside the section layout.',
        },
      },
      {
        name: 'imageWidth',
        label: 'Image Width',
        type: 'select',
        defaultValue: '38',
        options: [
          { label: '25%', value: '25' },
          { label: '30%', value: '30' },
          { label: '35%', value: '35' },
          { label: '38%', value: '38' },
          { label: '42%', value: '42' },
          { label: '46%', value: '46' },
          { label: '50%', value: '50' },
          { label: '55%', value: '55' },
          { label: '60%', value: '60' },
        ],
        admin: {
          width: '30%',
          condition: (_, siblingData) => Boolean(siblingData?.image),
          description: 'Exact width of the section image relative to the article column.',
        },
      },
    ],
  },
  {
    name: 'imageCaption',
    type: 'text',
    admin: {
      description: 'Optional caption shown below the section image.',
      condition: (_, siblingData) => Boolean(siblingData?.image),
    },
  },
  {
    name: 'evidenceGroups',
    label: 'Citation / Study Dropdowns',
    type: 'array',
    admin: {
      description:
        'Each item renders as a collapsible dropdown for this section. Put one or more study rows inside each dropdown.',
      initCollapsed: true,
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        admin: {
          description: 'Dropdown label, for example "Clinical studies" or "Mechanistic evidence".',
        },
      },
      {
        name: 'intro',
        type: 'textarea',
        admin: {
          description: 'Optional short note shown above the table when the dropdown is opened.',
        },
      },
      {
        name: 'studies',
        type: 'array',
        required: true,
        minRows: 1,
        labels: {
          singular: 'Study Row',
          plural: 'Study Rows',
        },
        admin: {
          description: 'Rows for the citation / study table inside this dropdown.',
          initCollapsed: true,
        },
        fields: [
          {
            name: 'citation',
            type: 'textarea',
            required: true,
          },
          {
            name: 'studyType',
            label: 'Study Type',
            type: 'text',
          },
          {
            name: 'finding',
            type: 'textarea',
            required: true,
          },
          {
            name: 'link',
            type: 'text',
            admin: {
              description: 'Optional URL to the paper, DOI, PubMed, or journal page.',
            },
            validate: (value: unknown) => {
              if (value == null || value === '') return true
              if (typeof value !== 'string') return 'Link must be a URL.'

              try {
                const parsed = new URL(value)
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                  return 'Enter a valid URL beginning with http:// or https://'
                }

                return true
              } catch {
                return 'Enter a valid URL beginning with http:// or https://'
              }
            },
          },
        ],
      },
    ],
  },
]

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
      type: 'row',
      fields: [
        {
          name: 'showArticleRatings',
          label: 'Show ROCK / Scientific Evidence ratings',
          type: 'checkbox',
          defaultValue: true,
          required: true,
          admin: {
            width: '100%',
            description:
              'Turn this off for site-information pages and other articles that should not display the rating badges.',
          },
        },
        {
          name: 'rockRating',
          label: 'ROCK Rating',
          type: 'select',
          defaultValue: 'medium-rock',
          options: rockRatingScale.map(({ label, value }) => ({ label, value })),
          index: true,
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.showArticleRatings !== false,
            description:
              'Overall practical recommendation strength using your Low-Pebble to High-Boulder scale.',
          },
          validate: (value, { siblingData }) => {
            if (siblingData?.showArticleRatings === false) return true
            if (typeof value === 'string' && value.trim()) return true
            return 'Choose a ROCK Rating or disable article ratings for this page.'
          },
        },
        {
          name: 'scientificEvidence',
          label: 'Scientific Evidence',
          type: 'select',
          defaultValue: 'moderate',
          options: scientificEvidenceScale.map(({ label, value }) => ({ label, value })),
          index: true,
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.showArticleRatings !== false,
            description: 'Overall confidence in the evidence base from Low to High.',
          },
          validate: (value, { siblingData }) => {
            if (siblingData?.showArticleRatings === false) return true
            if (typeof value === 'string' && value.trim()) return true
            return 'Choose a Scientific Evidence rating or disable article ratings for this page.'
          },
        },
      ],
    },
    {
      name: 'rockRatingScore',
      label: 'ROCK Rating Sort Score',
      type: 'number',
      index: true,
      admin: {
        readOnly: true,
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ siblingData }) =>
            siblingData?.showArticleRatings === false
              ? null
              : getScaleScore(siblingData?.rockRating, rockRatingScale),
        ],
      },
    },
    {
      name: 'scientificEvidenceScore',
      label: 'Scientific Evidence Sort Score',
      type: 'number',
      index: true,
      admin: {
        readOnly: true,
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ siblingData }) =>
            siblingData?.showArticleRatings === false
              ? null
              : getScaleScore(siblingData?.scientificEvidence, scientificEvidenceScale),
        ],
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional primary image displayed near the top of the article.',
      },
    },
    {
      name: 'heroImageCaption',
      type: 'text',
      admin: {
        description: 'Optional caption shown below the primary article image.',
        condition: (_, siblingData) => Boolean(siblingData?.heroImage),
      },
    },
    {
      name: 'sections',
      type: 'array',
      minRows: 1,
      labels: {
        singular: 'Article Section',
        plural: 'Article Sections',
      },
      admin: {
        description:
          'Primary article template. Build the article as repeatable sections with subheadings, images, and collapsible citation/study tables.',
        initCollapsed: true,
      },
      fields: articleSectionFields,
    },
    {
      name: 'body',
      type: 'code',
      defaultValue: '',
      admin: {
        language: 'markdown',
        description:
          'Legacy full-article Markdown field kept for older articles. New articles should use the structured Sections field above.',
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
      name: 'excludeFromRandom',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Exclude this article from the random article button and random article page.',
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
