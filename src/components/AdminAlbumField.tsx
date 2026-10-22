import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Film, Plus, Trash2, UploadCloud } from 'lucide-react';
import type { Locale } from '../types';
import { publicAssetUrl } from '../utils';
import {
  ALBUM_IMAGE_TYPES,
  ALBUM_VIDEO_TYPES,
  MAX_ALBUM_IMAGE_SOURCE_BYTES,
  MAX_ALBUM_VIDEO_BYTES,
  MAX_ALBUM_VIDEO_SECONDS,
  storeAlbumImage,
  storeAlbumImageLink,
  storeAlbumVideo,
} from '../lib/mediaUpload';
import { parseVideoSource } from '../lib/videoEmbed';

type ToastFn = (message: string) => void;

const IMAGE_ACCEPT = ALBUM_IMAGE_TYPES.join(',');
const VIDEO_ACCEPT = ALBUM_VIDEO_TYPES.join(',');

function imageFailureMessage(reason: unknown, isArabic: boolean) {
  const detail = reason instanceof Error ? reason.message : String(reason);
  return isArabic ? 'تعذر تجهيز الصورة. جرّب صورة أخرى بصيغة JPG أو PNG أو WebP.' : `Could not prepare the image: ${detail}`;
}

function videoFailureMessage(reason: unknown, isArabic: boolean) {
  const code = reason instanceof Error ? reason.message : '';
  if (code === 'unsupported-video-type') return isArabic ? 'اختار فيديو MP4 أو WebM.' : 'Choose an MP4 or WebM video.';
  if (code === 'video-too-large') return isArabic ? `حجم الفيديو يجب ألا يتجاوز ${MAX_ALBUM_VIDEO_BYTES / 1024 / 1024} ميجابايت.` : `The video must be ${MAX_ALBUM_VIDEO_BYTES / 1024 / 1024} MB or smaller.`;
  if (code === 'video-too-long') return isArabic ? `مدة الفيديو يجب ألا تتجاوز ${MAX_ALBUM_VIDEO_SECONDS} ثانية.` : `The video must be ${MAX_ALBUM_VIDEO_SECONDS} seconds or shorter.`;
  if (code === 'video-needs-cloud') return isArabic ? 'رفع الفيديو محتاج اتصال Supabase. تقدر تحط رابط فيديو بدلاً من الرفع.' : 'Uploading video needs Supabase. Paste a video link instead.';
  return isArabic ? 'تعذر رفع الفيديو. تأكد إنك مسجل دخول كأدمن أو استخدم رابط.' : 'Could not upload the video. Make sure you are signed in as admin, or use a link.';
}

type SingleProps = { locale: Locale; folder: string; label: string; onUploaded: (url: string) => void; onToast: ToastFn };

/** One-image upload button for banners and slides. */
export function AdminImageUploadButton({ locale, folder, label, onUploaded, onToast }: SingleProps) {
  const isArabic = locale === 'ar';
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const handle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!ALBUM_IMAGE_TYPES.includes(file.type) || file.size > MAX_ALBUM_IMAGE_SOURCE_BYTES) {
      onToast(isArabic ? 'اختار صورة JPG أو PNG أو WebP أو AVIF لا تتجاوز 20 ميجابايت.' : 'Choose a JPG, PNG, WebP or AVIF image up to 20 MB.');
      return;
    }
    setBusy(true);
    try {
      const stored = await storeAlbumImage(file, folder);
      onUploaded(stored.url);
      onToast(isArabic ? `تم ضغط الصورة إلى ${Math.ceil(stored.bytes / 1024)} كيلوبايت. احفظ لنشر التغيير.` : `Image compressed to ${Math.ceil(stored.bytes / 1024)} KB. Save to publish.`);
    } catch (failure) {
      onToast(imageFailureMessage(failure, isArabic));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <input accept={IMAGE_ACCEPT} className="hidden" onChange={(event) => void handle(event)} ref={inputRef} type="file" />
      <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-zx-border bg-zx-mint px-3 text-[10px] font-semibold text-zx-mint-contrast disabled:opacity-60" disabled={busy} onClick={() => inputRef.current?.click()} type="button">
        <UploadCloud className="h-3.5 w-3.5" />{busy ? (isArabic ? 'جاري الضغط…' : 'Compressing…') : label}
      </button>
    </>
  );
}

type AlbumProps = {
  locale: Locale;
  folder: string;
  images: string[];
  onImagesChange: (next: string[]) => void;
  videoUrl: string;
  onVideoChange: (next: string) => void;
  onToast: ToastFn;
  maxImages?: number;
};

/** Multi-image album plus an optional video for products, vehicles and properties. */
export function AdminAlbumField({ locale, folder, images, onImagesChange, videoUrl, onVideoChange, onToast, maxImages = 12 }: AlbumProps) {
  const isArabic = locale === 'ar';
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [linkDraft, setLinkDraft] = useState('');
  const [progress, setProgress] = useState('');
  const [videoBusy, setVideoBusy] = useState(false);
  const busy = Boolean(progress);
  const EarlierIcon = isArabic ? ArrowRight : ArrowLeft;
  const LaterIcon = isArabic ? ArrowLeft : ArrowRight;

  const addFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;
    const room = maxImages - images.length;
    if (room <= 0) {
      onToast(isArabic ? `الحد الأقصى ${maxImages} صور.` : `The album holds up to ${maxImages} images.`);
      return;
    }
    const accepted = files.filter((file) => ALBUM_IMAGE_TYPES.includes(file.type) && file.size <= MAX_ALBUM_IMAGE_SOURCE_BYTES).slice(0, room);
    const skipped = files.length - accepted.length;
    const added: string[] = [];
    let savedBytes = 0;
    for (const [index, file] of accepted.entries()) {
      setProgress(isArabic ? `جاري ضغط ${index + 1} من ${accepted.length}…` : `Compressing ${index + 1} of ${accepted.length}…`);
      try {
        const stored = await storeAlbumImage(file, folder);
        added.push(stored.url);
        savedBytes += stored.bytes;
      } catch (failure) {
        onToast(imageFailureMessage(failure, isArabic));
      }
    }
    setProgress('');
    if (added.length > 0) {
      onImagesChange([...images, ...added]);
      onToast(isArabic
        ? `تمت إضافة ${added.length} صورة (إجمالي ${Math.ceil(savedBytes / 1024)} كيلوبايت بعد الضغط).${skipped ? ` تم تخطي ${skipped}.` : ''} احفظ لنشر التغيير.`
        : `Added ${added.length} image(s), ${Math.ceil(savedBytes / 1024)} KB after compression.${skipped ? ` Skipped ${skipped}.` : ''} Save to publish.`);
    } else if (skipped > 0) {
      onToast(isArabic ? 'الصور لازم تكون JPG أو PNG أو WebP أو AVIF وأقل من 20 ميجابايت.' : 'Images must be JPG, PNG, WebP or AVIF and under 20 MB.');
    }
  };

  const addLink = async () => {
    const value = linkDraft.trim();
    if (!/^https?:\/\//i.test(value)) {
      onToast(isArabic ? 'الصق رابط صورة يبدأ بـ https://' : 'Paste an image link that starts with https://');
      return;
    }
    if (images.length >= maxImages) {
      onToast(isArabic ? `الحد الأقصى ${maxImages} صور.` : `The album holds up to ${maxImages} images.`);
      return;
    }
    setProgress(isArabic ? 'جاري ضغط الرابط…' : 'Compressing the link…');
    const next = await storeAlbumImageLink(value);
    setProgress('');
    onImagesChange([...images, next]);
    setLinkDraft('');
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onImagesChange(next);
  };

  const uploadVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    setVideoBusy(true);
    try {
      onVideoChange(await storeAlbumVideo(file, `${folder}/videos`));
      onToast(isArabic ? 'تم رفع الفيديو. احفظ لنشر التغيير.' : 'Video uploaded. Save to publish.');
    } catch (failure) {
      onToast(videoFailureMessage(failure, isArabic));
    } finally {
      setVideoBusy(false);
    }
  };

  const videoLooksInvalid = videoUrl.trim() !== '' && !parseVideoSource(videoUrl);

  return (
    <div className="space-y-3 rounded-2xl border border-zx-border bg-zx-surface-raised p-3">
      <div>
        <p className="text-[10px] font-bold text-zx-text">{isArabic ? `ألبوم الصور (${images.length}/${maxImages})` : `Photo album (${images.length}/${maxImages})`}</p>
        <p className="mt-1 text-[10px] leading-5 text-zx-text-secondary">{isArabic ? 'اختار كذا صورة مرة واحدة. كل صورة بتتحول لـ WebP وتتضغط تلقائيًا (حوالي 350 كيلوبايت) عشان المساحة.' : 'Pick several photos at once. Each is converted to WebP and compressed (about 350 KB) to save space.'}</p>
      </div>
      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, index) => (
            <li className="relative overflow-hidden rounded-xl border border-zx-border bg-zx-surface" key={`${url.slice(-40)}-${index}`}>
              <img alt="" className="aspect-square w-full object-cover" loading="lazy" src={publicAssetUrl(url)} />
              <div className="flex items-center justify-between gap-1 p-1">
                <button aria-label={isArabic ? 'تقديم' : 'Move earlier'} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zx-border disabled:opacity-30" disabled={index === 0} onClick={() => move(index, -1)} type="button"><EarlierIcon className="h-3 w-3" /></button>
                <button aria-label={isArabic ? 'حذف الصورة' : 'Remove image'} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zx-border text-red-600" onClick={() => onImagesChange(images.filter((_, imageIndex) => imageIndex !== index))} type="button"><Trash2 className="h-3 w-3" /></button>
                <button aria-label={isArabic ? 'تأخير' : 'Move later'} className="flex h-7 w-7 items-center justify-center rounded-lg border border-zx-border disabled:opacity-30" disabled={index === images.length - 1} onClick={() => move(index, 1)} type="button"><LaterIcon className="h-3 w-3" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <input accept={IMAGE_ACCEPT} className="hidden" multiple onChange={(event) => void addFiles(event)} ref={imageInputRef} type="file" />
        <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zx-border bg-zx-mint px-3 text-[10px] font-semibold text-zx-mint-contrast disabled:opacity-60" disabled={busy} onClick={() => imageInputRef.current?.click()} type="button">
          <UploadCloud className="h-3.5 w-3.5" />{progress || (isArabic ? 'إضافة صور من جهازك' : 'Add photos from device')}
        </button>
        <div className="flex min-w-48 flex-1 gap-2">
          <input aria-label={isArabic ? 'رابط صورة للألبوم' : 'Album image link'} className="h-9 min-w-0 flex-1 rounded-xl border border-zx-border px-3 text-xs outline-none" dir="ltr" onChange={(event) => setLinkDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void addLink(); } }} placeholder="https://…" value={linkDraft} />
          <button aria-label={isArabic ? 'إضافة الرابط' : 'Add link'} className="flex h-9 w-9 items-center justify-center rounded-xl border border-zx-border disabled:opacity-60" disabled={busy || !linkDraft.trim()} onClick={() => void addLink()} type="button"><Plus className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="border-t border-zx-border pt-3">
        <p className="text-[10px] font-bold text-zx-text">{isArabic ? 'فيديو (اختياري)' : 'Video (optional)'}</p>
        <p className="mt-1 text-[10px] leading-5 text-zx-text-secondary">{isArabic ? `ارفع MP4 أو WebM (حتى ${MAX_ALBUM_VIDEO_BYTES / 1024 / 1024} ميجا و${MAX_ALBUM_VIDEO_SECONDS} ثانية) أو الصق رابط يوتيوب أو فيميو. الفيديو بيتخزن زي ما هو بدون ضغط، فاستخدم ملف خفيف.` : `Upload an MP4/WebM (up to ${MAX_ALBUM_VIDEO_BYTES / 1024 / 1024} MB and ${MAX_ALBUM_VIDEO_SECONDS} s) or paste a YouTube/Vimeo link. Uploaded video is stored as-is, so keep the file light.`}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input accept={VIDEO_ACCEPT} className="hidden" onChange={(event) => void uploadVideo(event)} ref={videoInputRef} type="file" />
          <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zx-border bg-zx-mint px-3 text-[10px] font-semibold text-zx-mint-contrast disabled:opacity-60" disabled={videoBusy} onClick={() => videoInputRef.current?.click()} type="button">
            <Film className="h-3.5 w-3.5" />{videoBusy ? (isArabic ? 'جاري الرفع…' : 'Uploading…') : (isArabic ? 'رفع فيديو' : 'Upload video')}
          </button>
          <input aria-label={isArabic ? 'رابط الفيديو' : 'Video link'} className="h-9 min-w-48 flex-1 rounded-xl border border-zx-border px-3 text-xs outline-none" dir="ltr" onChange={(event) => onVideoChange(event.target.value)} placeholder="https://youtu.be/… · https://…/video.mp4" value={videoUrl} />
          {videoUrl && <button aria-label={isArabic ? 'حذف الفيديو' : 'Remove video'} className="flex h-9 w-9 items-center justify-center rounded-xl border border-zx-border text-red-600" onClick={() => onVideoChange('')} type="button"><Trash2 className="h-4 w-4" /></button>}
        </div>
        {videoLooksInvalid && <p className="mt-1 text-[10px] font-semibold text-red-600">{isArabic ? 'الرابط ده مش مدعوم. استخدم يوتيوب أو فيميو أو رابط مباشر لملف فيديو.' : 'That link is not supported. Use YouTube, Vimeo, or a direct video file link.'}</p>}
      </div>
    </div>
  );
}
