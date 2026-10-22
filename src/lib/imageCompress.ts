import { isSupabaseConfigured, supabase } from '../../supabase';

const SITE_MEDIA_MARKER = '/storage/v1/object/public/site-media/';

export function isCompressibleRemoteImageUrl(url: string) {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) && !trimmed.includes(SITE_MEDIA_MARKER);
}

export async function uploadSiteMedia(blob: Blob, folder: string, extension: string, contentType: string): Promise<string> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const objectPath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const { error } = await supabase.storage.from('site-media').upload(objectPath, blob, {
    cacheControl: '31536000, immutable',
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('site-media').getPublicUrl(objectPath).data.publicUrl;
}

export async function mirrorRemoteImageAsWebp(url: string): Promise<string> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
  const response = await fetch(url.trim(), { mode: 'cors' });
  if (!response.ok) throw new Error(`Image request failed with status ${response.status}.`);
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/') || contentType === 'image/svg+xml') {
    throw new Error('The linked file is not a raster image.');
  }
  const source = await response.blob();
  const blob = await compressImageToWebp(source, { maxDimension: 1800, maxBytes: 1024 * 1024 });
  return uploadSiteMedia(blob, 'links', 'webp', 'image/webp');
}

export type CompressImageOptions = {
  maxDimension: number;
  maxBytes: number;
  startQuality?: number;
  minQuality?: number;
  attempts?: number;
};

export async function compressImageToWebp(
  source: Blob,
  { maxDimension, maxBytes, startQuality = 0.78, minQuality = 0.4, attempts = 6 }: CompressImageOptions,
): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  let scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  let blob: Blob | null = null;
  try {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas image processing is unavailable.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const quality = Math.max(minQuality, startQuality - attempt * 0.07);
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= maxBytes) break;
      scale *= 0.82;
    }
  } finally {
    bitmap.close();
  }
  if (!blob) throw new Error('The image could not be converted to WebP.');
  if (blob.size > maxBytes) throw new Error(`The image could not be compressed below ${Math.round(maxBytes / 1024)} KB.`);
  return blob;
}
