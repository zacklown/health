import Image from 'next/image'
import React from 'react'

export function MetadataLogo() {
  return (
    <Image
      alt="Metadata"
      height={48}
      src="/metadata-logo.png"
      style={{
        display: 'block',
        height: 'auto',
        maxHeight: '3rem',
        maxWidth: '12rem',
        objectFit: 'contain',
        width: '100%',
      }}
      width={192}
    />
  )
}
