export async function fetchSitemap(path: string): Promise<string> {
  const baseUrl = process.env.SITE_DISCOVERY_API_URL;
  if (!baseUrl) {
    throw new Error('SITE_DISCOVERY_API_URL is not configured');
  }

  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    throw new Error(`Site discovery API returned ${res.status} for ${path}`);
  }

  return res.text();
}
