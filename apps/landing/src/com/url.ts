const hostname = window.location.hostname

const isCustomDomain = hostname === 'my-saas.com' || hostname === 'app.my-saas.com'
const isSaas = hostname.startsWith('app.')

export function landingUrl(path = '/') {
  if (isCustomDomain) return path
  return `/landing${path}`
}

export function adminUrl(path = '/') {
  if (hostname === 'admin.my-saas.com') return path
  if (isCustomDomain) return `https://admin.my-saas.com${path}`
  return `/admin${path}`
}

export function pageUrl(slug: string) {
  if (isSaas) return `/${slug}`
  return landingUrl(`/pages/${slug}`)
}

export function homeUrl() {
  if (isSaas) return '/'
  return landingUrl('/')
}

export { isSaas, isCustomDomain }
