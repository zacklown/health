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
	defaultValue: {
		announcement: {
			enabled: true,
			text: 'New: Personal health notes now include study snapshots',
			href: '#',
		},
		navItems: [
			{
				type: 'link',
				label: 'Home',
				href: '/',
				variant: 'default',
			},
			{
				type: 'dropdown',
				label: 'Nutrition',
				href: '/learn',
				columns: [
					{
						title: 'Foundations',
						links: [
							{ label: 'The Metabolic process', href: '#' },
							{ label: 'Study literacy', href: '#' },
							{ label: 'Measurement methods', href: '#' },
						],
					},
					{
						title: 'Supplements',
						links: [
							{ label: 'Meal planning', href: '#' },
							{ label: 'Supplement timing', href: '#' },
							{ label: 'Nutrient balancing', href: '#' },
						],
					},
					{
						title: 'Basics',
						links: [
							{ label: 'Nutrition Dictionary', href: '#' },
							{ label: 'Review templates', href: '#' },
							{ label: 'Workflow checklists', href: '#' },
						],
					},
				],
			},
			{
				type: 'dropdown',
				label: 'Activity',
				href: '/blog',
				columns: [
					{
						title: 'Recent',
						links: [
							{ label: 'Food updates', href: '#' },
							{ label: 'Supplement notes', href: '#' },
							{ label: 'Research breakdowns', href: '#' },
						],
					},
					{
						title: 'Categories',
						links: [
							{ label: 'Supplements', href: '#' },
							{ label: 'Diets', href: '#' },
							{ label: 'Metabolism', href: '#' },
						],
					},
					{
						title: 'More',
						links: [
							{ label: 'Case studies', href: '#' },
							{ label: 'Roundups', href: '#' },
							{ label: 'Interviews', href: '#' },
						],
					},
				],
			},
			{
				type: 'link',
				label: 'About',
				href: '/about',
				variant: 'default',
			},
			{
				type: 'link',
				label: 'Subscribe',
				href: '/subscribe',
				variant: 'button',
			},
		],
	},
}
