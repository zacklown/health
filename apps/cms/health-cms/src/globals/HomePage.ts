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
    {
      name: 'featuredSections',
      label: 'Homepage Sections',
      type: 'array',
      admin: {
        description:
          'Choose exactly which article sections appear on the homepage and in what order. No filler cards will be shown for missing items.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
          required: true,
          defaultValue: 'Featured Article',
        },
        {
          name: 'article',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
        },
        {
          name: 'summaryOverride',
          type: 'textarea',
          admin: {
            description:
              'Optional custom summary for the homepage card. Leave blank to use the article summary.',
          },
        },
        {
          name: 'imageOverride',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description:
              'Optional homepage-only image. If blank, the article feature image will be used, then the article hero image.',
          },
        },
        {
          name: 'imagePlacement',
          label: 'Image Side',
          type: 'select',
          defaultValue: 'right',
          options: [
            {
              label: 'Left',
              value: 'left',
            },
            {
              label: 'Right',
              value: 'right',
            },
          ],
          admin: {
            description: 'Choose which side of the homepage card the image should appear on.',
          },
        },
        {
          name: 'imageSize',
          label: 'Image Height',
          type: 'select',
          defaultValue: 'medium',
          options: [
            {
              label: 'Small',
              value: 'small',
            },
            {
              label: 'Medium',
              value: 'medium',
            },
            {
              label: 'Large',
              value: 'large',
            },
          ],
          admin: {
            description: 'Set the overall visual size of the homepage image area.',
          },
        },
        {
          name: 'imageWidth',
          label: 'Image Width',
          type: 'select',
          defaultValue: '38',
          options: [
            {
              label: '25%',
              value: '25',
            },
            {
              label: '30%',
              value: '30',
            },
            {
              label: '35%',
              value: '35',
            },
            {
              label: '38%',
              value: '38',
            },
            {
              label: '40%',
              value: '40',
            },
            {
              label: '45%',
              value: '45',
            },
            {
              label: '50%',
              value: '50',
            },
            {
              label: '55%',
              value: '55',
            },
            {
              label: '60%',
              value: '60',
            },
          ],
          admin: {
            description:
              'Control how much horizontal space the image takes within the homepage card.',
          },
        },
      ],
    },
  ],
}
