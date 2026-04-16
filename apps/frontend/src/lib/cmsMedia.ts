const INTERNAL_CMS_HOSTS = new Set(['cms', 'localhost', '127.0.0.1', '0.0.0.0'])

export function getPublicCmsBaseUrl(
  siteUrl: URL,
  env: { PUBLIC_CMS_PUBLIC_URL?: string | undefined },
): string {
  return (
    env.PUBLIC_CMS_PUBLIC_URL?.replace(/\/+$/, '') ||
    `${siteUrl.protocol}//${siteUrl.hostname}:3000`
  )
}

export function resolveCmsMediaUrl(url: string, publicCmsBaseUrl: string): string {
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url)
      const isInternalCmsHost =
        INTERNAL_CMS_HOSTS.has(parsed.hostname) ||
        (parsed.port === '3000' && parsed.hostname !== '')

      if (isInternalCmsHost) {
        return `${publicCmsBaseUrl}${parsed.pathname}${parsed.search}${parsed.hash}`
      }

      return parsed.toString()
    } catch {
      return url
    }
  }

  return `${publicCmsBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}
