import Image from 'next/image'
import React from 'react'

export function MetadataIcon() {
  return (
    <Image
      alt="Metadata"
      height={32}
      src="/metadata-logo.png"
      style={{
        display: 'block',
        height: '2rem',
        objectFit: 'contain',
        width: '2rem',
      }}
      width={32}
    />
  )
}
