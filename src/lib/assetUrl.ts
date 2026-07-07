/** Resolves a public/ asset path against Vite's configured base, so it still
 * resolves correctly when the site is served from a subpath (e.g. GitHub
 * Project Pages at /first-law-v2/) instead of domain root. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
