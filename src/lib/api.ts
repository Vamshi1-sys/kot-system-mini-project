const apiBaseUrl = (import.meta as ImportMeta & { env: { VITE_API_BASE_URL?: string } }).env.VITE_API_BASE_URL?.replace(/\/$/, '');

export function apiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}