import type { GlobalConfig } from 'payload'

export const SiteNavigation: GlobalConfig = {
  slug: 'site-navigation',
  label: 'Site Navigation',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'announcement',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Show announcement bar',
          defaultValue: true,
          required: true,
        },
        {
          name: 'text',
          type: 'text',
          required: true,
          defaultValue: 'New: Personal health notes now include study snapshots',
        },
        {
          name: 'href',
          type: 'text',
          required: false,
          defaultValue: '#',
          admin: {
            description: 'Optional link destination for announcement bar. Use # for no navigation.',
          },
        },
      ],
    },
    {
      name: 'navItems',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'link',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Dropdown', value: 'dropdown' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          admin: {
            description: 'Top-level link destination.',
          },
        },
        {
          name: 'variant',
          type: 'select',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Button', value: 'button' },
          ],
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'link',
            description: 'Only used for single links (for example, subscribe button).',
          },
        },
        {
          name: 'columns',
          type: 'array',
          minRows: 1,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'dropdown',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'links',
              type: 'array',
              minRows: 1,
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'href',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
