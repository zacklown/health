import React from 'react'
import type { Metadata } from 'next'
import './styles.css'

export async function generateMetadata(): Promise<Metadata> {
  const label = process.env.NEXT_PUBLIC_PORTAL_LABEL ?? 'CMS'

  return {
    title: `${label} Health CMS Admin Panel`,
    description: `Payload ${label} CMS Admin Panel for Health CMS`,
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}