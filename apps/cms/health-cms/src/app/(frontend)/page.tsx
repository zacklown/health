import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })
  const label = process.env.NEXT_PUBLIC_PORTAL_LABEL ?? 'CMS'

  return (
    <div className="home">
      <div className="content">
        <picture>
          <Image alt="Metadata Logo" height={65} src="/metadata-logo.png" width={180} />
        </picture>
        {!user && (
          <h1>
            Welcome to Health CMS.
            <br />
            This is the {label} CMS!
          </h1>
        )}
        {user && (
          <h1>
            Welcome back, {user.email}.<br />
            <br />
            This is the {label} CMS!
          </h1>
        )}
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
        </div>
      </div>
    </div>
  )
}
