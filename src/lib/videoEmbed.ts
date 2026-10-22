export type VideoSource = { kind: 'embed' | 'file'; src: string };

const YOUTUBE_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d+$/;

/** Accepts YouTube, Vimeo, or a direct video file; rejects anything that is not http(s) or a site path. */
export function parseVideoSource(raw?: string): VideoSource | null {
  const value = raw?.trim();
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//')) return { kind: 'file', src: value };
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0] ?? '';
    return YOUTUBE_ID.test(id) ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const id = url.searchParams.get('v') ?? (['embed', 'shorts', 'live'].includes(parts[0] ?? '') ? parts[1] ?? '' : '');
    return YOUTUBE_ID.test(id) ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.split('/').filter(Boolean).find((part) => VIMEO_ID.test(part)) ?? '';
    return id ? { kind: 'embed', src: `https://player.vimeo.com/video/${id}` } : null;
  }
  return { kind: 'file', src: url.toString() };
}
