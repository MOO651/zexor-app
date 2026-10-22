import { isSupabaseConfigured } from '../../supabase';
import { compressImageToWebp, isCompressibleRemoteImageUrl, mirrorRemoteImageAsWebp, uploadSiteMedia } from './imageCompress';

export const ALBUM_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const ALBUM_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const MAX_ALBUM_IMAGE_SOURCE_BYTES = 20 * 1024 * 1024;
export const MAX_ALBUM_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_ALBUM_VIDEO_SECONDS = 90;

const CLOUD_IMAGE = { maxDimension: 1600, maxBytes: 350 * 1024, startQuality: 0.78, minQuality: 0.34, attempts: 7 };
const INLINE_IMAGE = { maxDimension: 1200, maxBytes: 200 * 1024, startQuality: 0.72, minQuality: 0.3, attempts: 8 };

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the processed image.'));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the processed image.'));
    reader.readAsDataURL(blob);
  });
}

export type StoredImage = { url: string; bytes: number; cloud: boolean };

/** Compresses to WebP, then uploads to Site Media; falls back to a small inline data URL when cloud storage is unavailable. */
export async function storeAlbumImage(source: Blob, folder: string): Promise<StoredImage> {
  if (isSupabaseConfigured) {
    const blob = await compressImageToWebp(source, CLOUD_IMAGE);
    try {
      return { url: await uploadSiteMedia(blob, folder, 'webp', 'image/webp'), bytes: blob.size, cloud: true };
    } catch (uploadFailure) {
      console.warn('Album image upload failed, keeping it inline:', uploadFailure);
    }
  }
  const inline = await compressImageToWebp(source, INLINE_IMAGE);
  return { url: await blobToDataUrl(inline), bytes: inline.size, cloud: false };
}

/** Compresses and uploads a pasted link; keeps the original link when the source blocks cross-origin reads. */
export async function storeAlbumImageLink(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!isCompressibleRemoteImageUrl(trimmed)) return trimmed;
  try {
    return await mirrorRemoteImageAsWebp(trimmed);
  } catch (linkFailure) {
    console.warn('Could not compress the linked album image, keeping the original URL:', linkFailure);
    return trimmed;
  }
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const { duration } = video;
      cleanUp();
      resolve(duration);
    };
    video.onerror = () => {
      cleanUp();
      reject(new Error('Could not read the video file.'));
    };
    video.src = objectUrl;
  });
}

export async function storeAlbumVideo(file: File, folder: string): Promise<string> {
  if (!ALBUM_VIDEO_TYPES.includes(file.type)) throw new Error('unsupported-video-type');
  if (file.size > MAX_ALBUM_VIDEO_BYTES) throw new Error('video-too-large');
  if (!isSupabaseConfigured) throw new Error('video-needs-cloud');
  const duration = await readVideoDuration(file);
  if (Number.isFinite(duration) && duration > MAX_ALBUM_VIDEO_SECONDS) throw new Error('video-too-long');
  return uploadSiteMedia(file, folder, file.type === 'video/webm' ? 'webm' : 'mp4', file.type);
}
