import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { DictionaryEntries } from './collections/DictionaryEntries'
import { SiteNavigation } from './globals/SiteNavigation'
import { HomePage } from './globals/HomePage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: {
          path: '@/components/admin/MetadataIcon',
          exportName: 'MetadataIcon',
        },
        Logo: {
          path: '@/components/admin/MetadataLogo',
          exportName: 'MetadataLogo',
        },
      },
    },
  },
  collections: [Users, Media, Pages, DictionaryEntries],
  globals: [SiteNavigation, HomePage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
