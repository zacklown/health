import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import './styles.css'

export async function generateMetadata(): Promise<Metadata> {
  const label = process.env.NEXT_PUBLIC_PORTAL_LABEL ?? 'CMS'

  return {
    title: `${label} Health CMS Admin Panel`,
    description: `${label} CMS Admin Panel for Health CMS`,
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-VYKY86LPDT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VYKY86LPDT');
          `}
        </Script>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
