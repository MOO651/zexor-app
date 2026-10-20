import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eye, RotateCcw, UploadCloud } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../supabase';
import { DEFAULT_SITE_ASSETS, DEFAULT_SITE_CONTENT, type SiteAssetType } from '../config/assets';
import type { Locale, Product } from '../types';
import { publicAssetUrl } from '../utils';
import { useSiteMedia } from '../lib/siteMediaContext';

const NfcLivePreview = lazy(() => import('./NfcLivePreview').then((module) => ({ default: module.NfcLivePreview })));

type Props = { locale: Locale; products: Product[]; onToast: (message: string) => void };
type AssetRow = {
  key: string;
  type: SiteAssetType;
  url: string;
  poster_url: string | null;
  meta: Record<string, unknown>;
  alt_ar: string;
  alt_en: string;
  status: 'draft' | 'published';
  updated_at: string;
  updated_by: string | null;
};
type ContentRow = {
  key: string;
  value_ar: string | null;
  value_en: string | null;
  value_json: unknown;
  status: 'draft' | 'published';
  updated_at?: string;
  updated_by?: string | null;
};
type HistoryRow = Pick<AssetRow, 'type' | 'url' | 'poster_url' | 'meta' | 'alt_ar' | 'alt_en' | 'status' | 'updated_at' | 'updated_by'> & {
  id: string;
  archived_at: string;
};

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_MODEL_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 10;

async function prepareImage(file: File, locale: Locale): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/vnd.radiance') return file;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(locale === 'ar' ? 'حجم الصورة الأصلية يجب ألا يتجاوز 20 ميجابايت.' : 'The original image must be 20 MB or smaller.');
  }
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  let blob: Blob | null = null;
  try {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error(locale === 'ar' ? 'تعذر تجهيز الصورة في هذا المتصفح.' : 'This browser could not prepare the image.');
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', Math.max(0.4, 0.78 - attempt * 0.07)));
      if (blob && blob.size <= 1024 * 1024) break;
      scale *= 0.82;
    }
  } finally {
    bitmap.close();
  }
  if (!blob) throw new Error(locale === 'ar' ? 'تعذر تحويل الصورة إلى WebP.' : 'Could not convert the image to WebP.');
  if (blob.size > 1024 * 1024) throw new Error(locale === 'ar' ? 'تعذر ضغط الصورة إلى أقل من 1 ميجابايت.' : 'Could not compress the image below 1 MB.');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
}

async function validateImageRatio(file: File, ratio: string, locale: Locale) {
  const match = ratio.match(/^(\d+):(\d+)$/);
  if (!match || !file.type.startsWith('image/')) return;
  const bitmap = await createImageBitmap(file);
  const actualRatio = bitmap.width / bitmap.height;
  bitmap.close();
  const expectedRatio = Number(match[1]) / Number(match[2]);
  if (Math.abs(actualRatio - expectedRatio) / expectedRatio > 0.2) {
    throw new Error(locale === 'ar'
      ? `نسبة أبعاد الصورة بعيدة عن المقاس المقترح ${ratio}.`
      : `Image aspect ratio is too far from the recommended ${ratio}.`);
  }
}

function readVideoDuration(file: File, locale: Locale): Promise<number> {
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
      const duration = video.duration;
      cleanUp();
      resolve(duration);
    };
    video.onerror = () => {
      cleanUp();
      reject(new Error(locale === 'ar' ? 'تعذر قراءة مدة الفيديو.' : 'Could not read video duration.'));
    };
    video.src = objectUrl;
  });
}

function expectedType(key: string, fallbackType: SiteAssetType): SiteAssetType {
  if (key.endsWith('.sequence')) return 'sequence';
  if (key.startsWith('textures.')) return 'texture';
  if (key.endsWith('.video')) return 'video';
  if (key.endsWith('.model')) return 'model';
  return fallbackType;
}

function createStoragePath(key: string, fileName: string, frameIndex?: number) {
  const framePrefix = frameIndex === undefined ? '' : `${String(frameIndex).padStart(3, '0')}-`;
  return `${key.replaceAll('.', '/')}/${Date.now()}-${framePrefix}${fileName.replace(/[^\w.-]/g, '-')}`;
}

export function AdminMediaCenter({ locale, products, onToast }: Props) {
  const isArabic = locale === 'ar';
  const inputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const [posterKey, setPosterKey] = useState<string | null>(null);
  const [rows, setRows] = useState<Record<string, AssetRow>>({});
  const [assetDraftRows, setAssetDraftRows] = useState<Record<string, AssetRow>>({});
  const [contentRows, setContentRows] = useState<Record<string, ContentRow>>({});
  const [contentDraftRows, setContentDraftRows] = useState<Record<string, ContentRow>>({});
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [hotspotLook, setHotspotLook] = useState('look-01');
  const [hotspotProduct, setHotspotProduct] = useState('');
  const [hotspots, setHotspots] = useState<Array<{ id?: string; look_id: string; x: number; y: number; product_id: string; sort_order: number; status: 'draft' | 'published' }>>([]);
  const { refresh: refreshPublicMedia } = useSiteMedia();

  const groupedAssets = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const key of Object.keys(DEFAULT_SITE_ASSETS)) {
      const group = key.split('.')[0] ?? 'other';
      (groups[group] ??= []).push(key);
    }
    return groups;
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError(isArabic ? 'Supabase غير مهيأ؛ شغّل إعداد قاعدة البيانات أولاً.' : 'Supabase is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const [assetResult, contentResult, hotspotResult] = await Promise.all([
      supabase.from('site_assets').select('key,type,url,poster_url,meta,alt_ar,alt_en,status,updated_at,updated_by'),
      supabase.from('site_content').select('key,value_ar,value_en,value_json,status,updated_at,updated_by'),
      supabase.from('site_hotspots').select('id,look_id,x,y,product_id,sort_order,status').order('sort_order'),
    ]);
    if (assetResult.error || contentResult.error || hotspotResult.error) {
      const message = assetResult.error?.message ?? contentResult.error?.message ?? hotspotResult.error?.message ?? 'Unknown error';
      console.error('Could not load media-center records:', message);
      setError(isArabic
        ? 'تعذر تحميل مركز الوسائط. تأكد من تشغيل migration 20261020_site_media_content.sql وصلاحية المدير.'
        : `Could not load media center. Verify the migration and admin access. ${message}`);
      setLoading(false);
      return;
    }
    const assetRecords = assetResult.data as AssetRow[];
    const contentRecords = contentResult.data as ContentRow[];
    setRows(Object.fromEntries(assetRecords.filter((row) => !row.key.endsWith('.__draft')).map((row) => [row.key, row])));
    setAssetDraftRows(Object.fromEntries(assetRecords.filter((row) => row.key.endsWith('.__draft')).map((row) => [row.key.slice(0, -8), row])));
    setContentRows(Object.fromEntries(contentRecords.filter((row) => !row.key.endsWith('.__draft')).map((row) => [row.key, row])));
    setContentDraftRows(Object.fromEntries(contentRecords.filter((row) => row.key.endsWith('.__draft')).map((row) => [row.key.slice(0, -8), row])));
    setHotspots(hotspotResult.data as typeof hotspots);
    setLoading(false);
  }, [isArabic]);

  const assetCounts = useMemo(() => {
    const liveAssets = Object.values(rows);
    const draftAssets = Object.values(assetDraftRows);
    const knownBytes = [...liveAssets, ...draftAssets].reduce((sum, row) => {
      const bytes = row.meta.bytes ?? row.meta.total_bytes;
      return sum + (typeof bytes === 'number' && Number.isFinite(bytes) ? bytes : 0);
    }, 0);
    return {
      published: liveAssets.filter((row) => row.status === 'published').length,
      drafts: draftAssets.length,
      defaults: Object.keys(DEFAULT_SITE_ASSETS).filter((key) => !rows[key]).length,
      knownBytes,
    };
  }, [assetDraftRows, rows]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const loadHistory = async (key: string) => {
    setSelectedKey(key);
    setHistory([]);
    const { data, error: historyError } = await supabase
      .from('site_asset_history')
      .select('id,type,url,poster_url,meta,alt_ar,alt_en,status,updated_at,updated_by,archived_at')
      .eq('asset_key', key)
      .order('archived_at', { ascending: false })
      .limit(5);
    if (historyError) {
      console.error('Could not load asset history:', historyError.message);
      setError(isArabic ? 'تعذر تحميل نسخ الأصل السابقة.' : `Could not load asset history: ${historyError.message}`);
      setHistory([]);
      return;
    }
    setHistory(data as HistoryRow[]);
  };

  const uploadAsset = async (key: string, file: File) => {
    setBusyKey(key);
    setError('');
    try {
      const prepared = await prepareImage(file, locale);
      const type = expectedType(key, DEFAULT_SITE_ASSETS[key]!.type);
      if (type === 'image') await validateImageRatio(prepared, DEFAULT_SITE_ASSETS[key]!.recommendedRatio, locale);
      const limit = type === 'video' ? MAX_VIDEO_BYTES : type === 'model' ? MAX_MODEL_BYTES : MAX_IMAGE_BYTES;
      if (prepared.size > limit) throw new Error(isArabic ? 'الملف أكبر من الحد المسموح لهذا النوع.' : 'File exceeds the size limit for this media type.');
      const allowed = type === 'video'
        ? ['video/mp4', 'video/webm']
        : type === 'model'
          ? ['model/gltf-binary', 'application/octet-stream']
          : type === 'texture' && key.includes('environment')
            ? ['image/vnd.radiance', 'application/octet-stream']
            : ['image/avif', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(prepared.type)) throw new Error(isArabic ? 'صيغة الملف غير مناسبة لهذا المكان.' : 'This file format is not supported for this slot.');
      if (type === 'video') {
        const duration = await readVideoDuration(prepared, locale);
        if (!Number.isFinite(duration) || duration <= 0 || duration > MAX_VIDEO_SECONDS) {
          throw new Error(isArabic ? `مدة الفيديو لازم تكون أقل من ${MAX_VIDEO_SECONDS} ثانية.` : `Video duration must be under ${MAX_VIDEO_SECONDS} seconds.`);
        }
      }
      const objectPath = createStoragePath(key, prepared.name);
      const { error: uploadError } = await supabase.storage.from('site-media').upload(objectPath, prepared, { contentType: prepared.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message);
      const { data: publicData } = supabase.storage.from('site-media').getPublicUrl(objectPath);
      const previous = assetDraftRows[key] ?? rows[key];
      const draftKey = `${key}.__draft`;
      const payload = {
        key: draftKey,
        type,
        url: publicData.publicUrl,
        poster_url: previous?.poster_url ?? DEFAULT_SITE_ASSETS[key]?.posterUrl ?? null,
        meta: { ...(previous?.meta ?? {}), target_key: key, original_name: file.name, bytes: prepared.size },
        alt_ar: previous?.alt_ar ?? '',
        alt_en: previous?.alt_en ?? '',
        status: 'draft' as const,
      };
      const { error: saveError } = await supabase.from('site_assets').upsert(payload, { onConflict: 'key' });
      if (saveError) {
        await supabase.storage.from('site-media').remove([objectPath]);
        throw new Error(saveError.message);
      }
      onToast(isArabic ? 'تم رفع الأصل كمسودة. انشره ليظهر على الموقع.' : 'Uploaded as a draft. Publish it to update the site.');
      await refresh();
      await loadHistory(key);
    } catch (uploadFailure) {
      console.error(`Could not upload site asset ${key}:`, uploadFailure);
      const message = uploadFailure instanceof Error ? uploadFailure.message : String(uploadFailure);
      setError(isArabic ? `فشل الرفع: ${message}` : `Upload failed: ${message}`);
    } finally {
      setBusyKey(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const uploadVideoPoster = async (key: string, file: File) => {
    const current = assetDraftRows[key] ?? rows[key];
    if (!current || current.type !== 'video') {
      setError(isArabic ? 'ارفع الفيديو أولًا قبل إضافة صورة الغلاف.' : 'Upload the video before adding its poster.');
      return;
    }
    setBusyKey(key);
    setError('');
    let objectPath = '';
    try {
      const prepared = await prepareImage(file, locale);
      await validateImageRatio(prepared, DEFAULT_SITE_ASSETS[key]!.recommendedRatio, locale);
      if (!prepared.type.startsWith('image/') || prepared.size > MAX_IMAGE_BYTES) {
        throw new Error(isArabic ? 'صورة الغلاف غير مدعومة أو أكبر من 20 ميجابايت.' : 'Poster must be a supported image under 20 MB.');
      }
      objectPath = `${key.replaceAll('.', '/')}/poster-${Date.now()}-${prepared.name.replace(/[^\w.-]/g, '-')}`;
      const { error: uploadError } = await supabase.storage.from('site-media').upload(objectPath, prepared, { contentType: prepared.type, upsert: false });
      if (uploadError) throw new Error(uploadError.message);
      const posterUrl = supabase.storage.from('site-media').getPublicUrl(objectPath).data.publicUrl;
      const { error: saveError } = await supabase.from('site_assets').upsert({
        ...current,
        key: `${key}.__draft`,
        status: 'draft',
        poster_url: posterUrl,
        meta: { ...current.meta, target_key: key },
      }, { onConflict: 'key' });
      if (saveError) throw new Error(saveError.message);
      onToast(isArabic ? 'تم حفظ غلاف الفيديو كمسودة.' : 'Video poster saved as a draft.');
      await refresh();
    } catch (posterFailure) {
      if (objectPath) {
        const { error: cleanupError } = await supabase.storage.from('site-media').remove([objectPath]);
        if (cleanupError) console.error(`Could not clean up failed video poster ${key}:`, cleanupError.message);
      }
      console.error(`Could not upload video poster for ${key}:`, posterFailure);
      const message = posterFailure instanceof Error ? posterFailure.message : String(posterFailure);
      setError(isArabic ? `فشل رفع الغلاف: ${message}` : `Poster upload failed: ${message}`);
    } finally {
      setBusyKey(null);
      if (posterInputRef.current) posterInputRef.current.value = '';
    }
  };

  const uploadSequence = async (key: string, files: File[]) => {
    if (files.length < 2 || files.length > 80) {
      setError(isArabic ? 'التسلسل يحتاج من صورتين إلى 80 صورة بالترتيب.' : 'A sequence needs between 2 and 80 ordered images.');
      return;
    }
    setBusyKey(key);
    setError('');
    const objectPaths: string[] = [];
    try {
      const orderedFiles = [...files].sort((first, second) => first.name.localeCompare(second.name, undefined, { numeric: true }));
      const preparedFiles: File[] = [];
      let totalBytes = 0;
      for (const file of orderedFiles) {
        const prepared = await prepareImage(file, locale);
        await validateImageRatio(prepared, DEFAULT_SITE_ASSETS[key]!.recommendedRatio, locale);
        if (!['image/webp', 'image/avif', 'image/jpeg', 'image/png'].includes(prepared.type)) {
          throw new Error(isArabic ? 'كل إطارات التسلسل لازم تكون صورًا مدعومة.' : 'Every sequence frame must be a supported image.');
        }
        totalBytes += prepared.size;
        if (totalBytes > MAX_VIDEO_BYTES) throw new Error(isArabic ? 'الحجم الإجمالي للتسلسل أكبر من 50 ميجابايت.' : 'The sequence exceeds the 50 MB total limit.');
        preparedFiles.push(prepared);
      }
      const urls: string[] = [];
      for (const [index, file] of preparedFiles.entries()) {
        const path = createStoragePath(key, file.name, index);
        const { error: uploadError } = await supabase.storage.from('site-media').upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(uploadError.message);
        objectPaths.push(path);
        urls.push(supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl);
      }
      const previous = assetDraftRows[key] ?? rows[key];
      const { error: saveError } = await supabase.from('site_assets').upsert({
        key: `${key}.__draft`,
        type: 'sequence',
        url: urls[0],
        poster_url: previous?.poster_url ?? urls[0],
        meta: { ...(previous?.meta ?? {}), target_key: key, frames: urls, frame_count: urls.length },
        alt_ar: previous?.alt_ar ?? '',
        alt_en: previous?.alt_en ?? '',
        status: 'draft',
      }, { onConflict: 'key' });
      if (saveError) throw new Error(saveError.message);
      onToast(isArabic ? 'تم رفع إطارات المشهد كمسودة.' : 'Scene frames uploaded as a draft.');
      await refresh();
      await loadHistory(key);
    } catch (uploadFailure) {
      if (objectPaths.length) {
        const { error: cleanupError } = await supabase.storage.from('site-media').remove(objectPaths);
        if (cleanupError) console.error(`Could not clean up incomplete sequence upload ${key}:`, cleanupError.message);
      }
      console.error(`Could not upload sequence ${key}:`, uploadFailure);
      const message = uploadFailure instanceof Error ? uploadFailure.message : String(uploadFailure);
      setError(isArabic ? `فشل رفع التسلسل: ${message}` : `Sequence upload failed: ${message}`);
    } finally {
      setBusyKey(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleAssetFiles = (key: string, files: File[]) => {
    if (key.endsWith('.sequence')) {
      void uploadSequence(key, files);
    } else if (files.length !== 1) {
      if (files.length > 1) setError(isArabic ? 'ارفع ملفًا واحدًا لهذا الأصل.' : 'Select one file for this media slot.');
    } else {
      const file = files[0];
      if (file) void uploadAsset(key, file);
    }
  };

  const setAssetStatus = async (key: string, status: 'draft' | 'published') => {
    setBusyKey(key);
    const draft = assetDraftRows[key];
    const live = rows[key];
    const payload = status === 'published' && draft
      ? { ...draft, key, status, meta: Object.fromEntries(Object.entries(draft.meta).filter(([name]) => name !== 'target_key')) }
      : { ...live, status };
    const { error: updateError } = live || draft
      ? await supabase.from('site_assets').upsert(payload, { onConflict: 'key' })
      : { error: new Error(isArabic ? 'لا توجد نسخة منشورة لهذا الأصل.' : 'No asset version exists to publish.') };
    if (updateError) {
      console.error(`Could not change publication state for ${key}:`, updateError.message);
      setError(isArabic ? `تعذر تحديث حالة الأصل: ${updateError.message}` : `Could not update asset status: ${updateError.message}`);
    } else {
      if (status === 'published' && draft) {
        const { error: cleanupError } = await supabase.from('site_assets').delete().eq('key', `${key}.__draft`);
        if (cleanupError) {
          console.error(`Could not remove published draft for ${key}:`, cleanupError.message);
          setError(isArabic ? `تم النشر لكن تعذر تنظيف المسودة: ${cleanupError.message}` : `Published, but draft cleanup failed: ${cleanupError.message}`);
        }
      }
      onToast(isArabic ? status === 'published' ? 'تم نشر الأصل.' : 'تم حفظ الأصل كمسودة.' : status === 'published' ? 'Asset published.' : 'Asset saved as draft.');
      await refresh();
      if (status === 'published') await refreshPublicMedia();
    }
    setBusyKey(null);
  };

  const resetAsset = async (key: string) => {
    if (!window.confirm(isArabic ? 'ترجع للنسخة الافتراضية؟ النسخة الحالية هتفضل في السجل.' : 'Reset to the local default? The current version remains in history.')) return;
    setBusyKey(key);
    const { error: deleteError } = await supabase.from('site_assets').delete().in('key', [key, `${key}.__draft`]);
    if (deleteError) {
      console.error(`Could not reset site asset ${key}:`, deleteError.message);
      setError(isArabic ? `تعذر الرجوع للنسخة الافتراضية: ${deleteError.message}` : `Could not reset asset: ${deleteError.message}`);
    } else {
      onToast(isArabic ? 'رجع الأصل للنسخة الافتراضية.' : 'Asset reset to its local default.');
      if (selectedKey === key) {
        setSelectedKey(null);
        setHistory([]);
      }
      await refresh();
      await refreshPublicMedia();
    }
    setBusyKey(null);
  };

  const rollbackAsset = async (key: string, version: HistoryRow) => {
    setBusyKey(key);
    const draftKey = `${key}.__draft`;
    const { error: rollbackError } = await supabase.from('site_assets').upsert({
      key: draftKey,
      type: version.type,
      url: version.url,
      poster_url: version.poster_url,
      meta: { ...version.meta, target_key: key },
      alt_ar: version.alt_ar,
      alt_en: version.alt_en,
      status: 'draft',
    }, { onConflict: 'key' });
    if (rollbackError) {
      console.error(`Could not restore asset version ${key}:`, rollbackError.message);
      setError(isArabic ? `تعذر استرجاع النسخة: ${rollbackError.message}` : `Could not restore version: ${rollbackError.message}`);
    } else {
      onToast(isArabic ? 'استرجعنا النسخة كمسودة للمراجعة.' : 'Version restored as a draft for review.');
      await refresh();
      await loadHistory(key);
    }
    setBusyKey(null);
  };

  const saveContent = async (key: string, status: 'draft' | 'published') => {
    const row = contentDraftRows[key] ?? contentRows[key] ?? { key, ...DEFAULT_SITE_CONTENT[key], status: 'draft' as const };
    const { error: saveError } = status === 'draft'
      ? await supabase.from('site_content').upsert({ ...row, key: `${key}.__draft`, status }, { onConflict: 'key' })
      : await supabase.from('site_content').upsert({ ...row, key, status }, { onConflict: 'key' });
    if (saveError) {
      console.error(`Could not save site content ${key}:`, saveError.message);
      setError(isArabic ? `تعذر حفظ النص: ${saveError.message}` : `Could not save copy: ${saveError.message}`);
      return;
    }
    if (status === 'published') {
      const { error: cleanupError } = await supabase.from('site_content').delete().eq('key', `${key}.__draft`);
      if (cleanupError) {
        console.error(`Could not remove published content draft ${key}:`, cleanupError.message);
        setError(isArabic ? `تم النشر لكن تعذر تنظيف المسودة: ${cleanupError.message}` : `Published, but draft cleanup failed: ${cleanupError.message}`);
      }
      await refreshPublicMedia();
    }
    onToast(isArabic ? status === 'published' ? 'تم نشر النص.' : 'حُفظ النص كمسودة.' : status === 'published' ? 'Copy published.' : 'Copy saved as draft.');
    await refresh();
  };

  const updateHotspotStatus = async (id: string, status: 'draft' | 'published') => {
    const { error: updateError } = await supabase.from('site_hotspots').update({ status }).eq('id', id);
    if (updateError) {
      console.error(`Could not update lookbook hotspot ${id}:`, updateError.message);
      setError(isArabic ? `تعذر تحديث النقطة: ${updateError.message}` : `Could not update hotspot: ${updateError.message}`);
      return;
    }
    await refresh();
    if (status === 'published') await refreshPublicMedia();
  };

  const deleteHotspot = async (id: string) => {
    const { error: deleteError } = await supabase.from('site_hotspots').delete().eq('id', id);
    if (deleteError) {
      console.error(`Could not delete lookbook hotspot ${id}:`, deleteError.message);
      setError(isArabic ? `تعذر حذف النقطة: ${deleteError.message}` : `Could not delete hotspot: ${deleteError.message}`);
      return;
    }
    await refresh();
    await refreshPublicMedia();
  };

  const saveHotspot = async (x: number, y: number) => {
    if (!hotspotProduct) {
      setError(isArabic ? 'اختار منتجًا قبل إضافة نقطة.' : 'Choose a product before adding a hotspot.');
      return;
    }
    const next = hotspots.filter((item) => item.look_id === hotspotLook).length;
    const { error: hotspotError } = await supabase.from('site_hotspots').insert({
      look_id: hotspotLook,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      product_id: hotspotProduct,
      sort_order: next,
      status: 'draft',
    });
    if (hotspotError) {
      console.error('Could not save lookbook hotspot:', hotspotError.message);
      setError(isArabic ? `تعذر حفظ النقطة: ${hotspotError.message}` : `Could not save hotspot: ${hotspotError.message}`);
      return;
    }
    await refresh();
  };

  if (loading) return <p className="rounded-2xl border border-zx-border p-6 text-sm text-zx-text-secondary" role="status">{isArabic ? 'جارٍ تحميل الوسائط والمحتوى…' : 'Loading media and content…'}</p>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zx-text">{isArabic ? 'الوسائط والمحتوى' : 'Media and Content'}</h2>
          <p className="mt-1 text-xs leading-5 text-zx-text-secondary">
            {isArabic
              ? 'ارفع الملفات كمسودات، راجعها ثم انشرها. تُحوّل الصور إلى WebP وتُضغط إلى 1 ميجابايت كحد أقصى. النسخة الافتراضية تظل متاحة دائمًا.'
              : 'Upload drafts, review them, then publish. Images are converted to WebP and compressed to 1 MB max. Local defaults remain available.'}
          </p>
        </div>
        <button className="min-h-11 rounded-full border border-zx-border px-4 text-xs font-semibold text-zx-text" onClick={() => void refresh()} type="button">
          {isArabic ? 'تحديث البيانات' : 'Refresh records'}
        </button>
      </header>
      <section aria-label={isArabic ? 'حالة مكتبة الوسائط' : 'Media library health'} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [isArabic ? 'أصول منشورة' : 'Published assets', assetCounts.published],
          [isArabic ? 'مسودات' : 'Drafts', assetCounts.drafts],
          [isArabic ? 'تستخدم النسخة الافتراضية' : 'Using local defaults', assetCounts.defaults],
          [isArabic ? 'الحجم المعروف للملفات' : 'Known media size', assetCounts.knownBytes ? `${(assetCounts.knownBytes / (1024 * 1024)).toFixed(1)} MB` : '—'],
        ].map(([label, value]) => (
          <div className="rounded-xl border border-zx-border bg-zx-surface-raised p-4" key={String(label)}>
            <p className="text-xs text-zx-text-secondary">{label}</p>
            <p className="mt-1 text-lg font-bold text-zx-text">{value}</p>
          </div>
        ))}
      </section>
      <p className="text-xs leading-5 text-zx-text-secondary">
        {isArabic
          ? 'الحجم المعروض محسوب من بيانات الملفات التي رُفعت من هذا المركز فقط؛ لا يشمل ملفات قديمة لا تحتوي على بيانات حجم.'
          : 'The size total is based on file metadata from this center and may exclude older files without stored size data.'}
      </p>
      {!isSupabaseConfigured && <p className="rounded-xl bg-zx-mint p-4 text-sm text-zx-text">{isArabic ? 'مركز الوسائط متاح بعد إعداد Supabase وتشغيل migration.' : 'Configure Supabase and run the migration to enable uploads.'}</p>}
      {error && <p className="rounded-xl border border-zx-highlight/40 bg-zx-surface-raised p-4 text-sm text-zx-text" role="alert">{error}</p>}

      <section className="space-y-5" aria-label={isArabic ? 'أصول الموقع' : 'Site assets'}>
        {Object.entries(groupedAssets).map(([group, keys]) => (
          <div className="rounded-2xl border border-zx-border bg-zx-surface-raised/80 p-4 sm:p-5" key={group}>
            <h3 className="mb-4 text-sm font-bold text-zx-text">{isArabic ? groupLabel(group) : group.replaceAll('-', ' ')}</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {keys.map((key) => {
                const fallback = DEFAULT_SITE_ASSETS[key]!;
                const row = rows[key];
                const draft = assetDraftRows[key];
                const previewRow = draft ?? row;
                const frames = Array.isArray(previewRow?.meta.frames)
                  ? previewRow.meta.frames.filter((frame): frame is string => typeof frame === 'string')
                  : [];
                const preview = publicAssetUrl(frames[0] ?? previewRow?.poster_url ?? previewRow?.url ?? fallback.url) ?? fallback.url;
                return (
                  <article
                    className={`min-w-0 overflow-hidden rounded-xl border bg-zx-surface p-3 transition-colors ${draggingKey === key ? 'border-zx-accent ring-2 ring-zx-accent/30' : 'border-zx-border'}`}
                    key={key}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setDraggingKey(key);
                    }}
                    onDragLeave={(event) => {
                      if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
                        setDraggingKey(null);
                      }
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDraggingKey(null);
                      handleAssetFiles(key, Array.from(event.dataTransfer.files));
                    }}
                  >
                    {!previewRow || previewRow.type === 'image' || previewRow.type === 'sequence'
                      ? <img alt="" className="mb-3 aspect-video w-full rounded-lg bg-zx-mint object-cover" loading="lazy" src={preview} />
                      : previewRow.type === 'video'
                        ? <video aria-label={isArabic ? 'معاينة الفيديو' : 'Video preview'} className="mb-3 aspect-video w-full rounded-lg bg-zx-mint object-cover" controls muted playsInline poster={previewRow.poster_url ?? undefined} preload="metadata" src={publicAssetUrl(previewRow.url) ?? undefined} />
                        : previewRow.type === 'model'
                          ? <div className="mb-3 rounded-lg bg-zx-mint p-2">
                            <Suspense fallback={<div className="grid aspect-[1.58/1] place-items-center rounded-lg bg-zx-surface text-xs text-zx-text-secondary">{isArabic ? 'جارٍ تحميل معاينة النموذج...' : 'Loading model preview...'}</div>}>
                              <NfcLivePreview
                                finish="pearl"
                                modelUrl={publicAssetUrl(previewRow.url)}
                                reducedMotion={false}
                              >
                                <div className="zx-nfc-preview-card flex aspect-[1.58/1] w-full flex-col justify-between rounded-2xl p-5 text-zx-text shadow-xl">
                                  <span className="text-xs font-bold tracking-[0.28em]" dir="ltr">ZEXOR</span>
                                  <span className="text-sm font-semibold">{isArabic ? 'معاينة البطاقة' : 'Card preview'}</span>
                                  <span className="text-xs">NFC</span>
                                </div>
                              </NfcLivePreview>
                            </Suspense>
                          </div>
                          : <div className="mb-3 grid aspect-video place-items-center rounded-lg bg-zx-mint px-3 text-center text-xs text-zx-text">{isArabic ? 'معاينة مباشرة لهذا النوع لسه مش متاحة.' : `Live preview is not available for ${previewRow.type}.`}</div>}
                    <p className="break-all text-xs font-semibold text-zx-text" dir="ltr">{key}</p>
                    <p className="mt-1 text-xs leading-5 text-zx-text-secondary">{fallback.usage}</p>
                    <p className="mt-1 text-xs text-zx-text-secondary">{fallback.recommendedRatio} · {fallback.recommendedSize}</p>
                    <p className="mt-1 text-xs text-zx-text-secondary">
                      {isArabic
                        ? key.endsWith('.sequence') ? 'اسحب صور الإطارات هنا أو استخدم زر الرفع.' : 'اسحب ملفًا واحدًا هنا أو استخدم زر الرفع.'
                        : key.endsWith('.sequence') ? 'Drop ordered frame images here or use Upload.' : 'Drop one file here or use Upload.'}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-zx-text">
                        {draft
                          ? (isArabic ? 'مسودة جاهزة للنشر' : 'Draft ready to publish')
                          : row ? (isArabic ? row.status === 'published' ? 'مخصص · منشور' : 'مخصص · مسودة' : `Custom · ${row.status}`) : (isArabic ? 'افتراضي' : 'Default')}
                        {previewRow?.updated_at && <time className="ms-2 font-normal text-zx-text-secondary" dateTime={previewRow.updated_at}>{new Date(previewRow.updated_at).toLocaleDateString(isArabic ? 'ar-EG' : 'en')}</time>}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                      <button className="min-h-11 rounded-lg bg-zx-cinematic px-3 text-xs font-semibold text-zx-accent-contrast" disabled={busyKey === key} onClick={() => {
                        setSelectedKey(key);
                        if (inputRef.current) {
                          inputRef.current.multiple = key.endsWith('.sequence');
                          inputRef.current.click();
                        }
                      }} type="button">
                        <UploadCloud className="me-1 inline h-4 w-4" />{isArabic ? 'رفع / استبدال' : 'Upload / Replace'}
                      </button>
                      {expectedType(key, fallback.type) === 'video' && (draft?.type === 'video' || row?.type === 'video') && <>
                        <button className="min-h-11 rounded-lg border border-zx-border px-3 text-xs" disabled={busyKey === key} onClick={() => {
                          setPosterKey(key);
                          posterInputRef.current?.click();
                        }} type="button">{isArabic ? 'تغيير الغلاف' : 'Change poster'}</button>
                      </>}
                      {draft && <button className="min-h-11 rounded-lg border border-zx-border px-3 text-xs" disabled={busyKey === key} onClick={() => void setAssetStatus(key, 'published')} type="button">{isArabic ? 'نشر المسودة' : 'Publish draft'}</button>}
                      {row && <button className="min-h-11 rounded-lg border border-zx-border px-3 text-xs" disabled={busyKey === key} onClick={() => void setAssetStatus(key, row.status === 'published' ? 'draft' : 'published')} type="button">{isArabic ? row.status === 'published' ? 'إلغاء النشر' : 'نشر النسخة' : row.status === 'published' ? 'Unpublish' : 'Publish version'}</button>}
                      <button className="min-h-11 rounded-lg border border-zx-border px-3 text-xs" onClick={() => void loadHistory(key)} type="button"><Eye className="me-1 inline h-4 w-4" />{isArabic ? 'سجل النسخ' : 'Version history'}</button>
                      {(row || draft) && <button className="min-h-11 rounded-lg border border-zx-border px-3 text-xs" disabled={busyKey === key} onClick={() => void resetAsset(key)} type="button"><RotateCcw className="me-1 inline h-4 w-4" />{isArabic ? 'الافتراضي' : 'Reset'}</button>}
                    </div>
                    {selectedKey === key && history.length > 0 && (
                      <ul className="mt-3 space-y-2 border-t border-zx-border pt-3">
                        {history.map((version) => <li className="flex flex-wrap items-center justify-between gap-2 text-xs" key={version.id}>
                          <time dateTime={version.archived_at}>{new Date(version.archived_at).toLocaleString(isArabic ? 'ar-EG' : 'en')}</time>
                          <button className="min-h-11 rounded-lg border border-zx-border px-3" onClick={() => void rollbackAsset(key, version)} type="button">{isArabic ? 'استرجاع' : 'Roll back'}</button>
                        </li>)}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <input accept="image/avif,image/jpeg,image/png,image/webp,video/mp4,video/webm,model/gltf-binary,.glb,.hdr" className="hidden" multiple={Boolean(selectedKey?.endsWith('.sequence'))} onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        if (!selectedKey || files.length === 0) return;
        handleAssetFiles(selectedKey, files);
      }} ref={inputRef} type="file" />
      <input accept="image/avif,image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
        const file = event.target.files?.[0];
        if (posterKey && file) void uploadVideoPoster(posterKey, file);
      }} ref={posterInputRef} type="file" />

      <section className="space-y-4 rounded-2xl border border-zx-border bg-zx-surface-raised/80 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-zx-text">{isArabic ? 'النصوص ومفاتيح المزايا' : 'Copy and feature switches'}</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {Object.entries(DEFAULT_SITE_CONTENT).map(([key, fallback]) => {
            const row = contentDraftRows[key] ?? contentRows[key] ?? { key, ...fallback, status: 'draft' as const };
            const jsonValue = row.value_json;
            const isFlag = key.startsWith('feature.') && typeof fallback.value_json === 'boolean';
            return <article className="rounded-xl border border-zx-border bg-zx-surface p-3" key={key}>
              <p className="mb-2 break-all text-xs font-semibold" dir="ltr">{key}</p>
              {isFlag ? <label className="flex min-h-11 items-center gap-2 text-xs">
                <input checked={typeof jsonValue === 'boolean' ? jsonValue : Boolean(fallback.value_json)} onChange={(event) => setContentDraftRows((current) => ({ ...current, [key]: { ...row, value_json: event.target.checked } }))} type="checkbox" />
                {isArabic ? 'تفعيل الميزة' : 'Enable feature'}
              </label> : <>
                <textarea aria-label={`${key} Arabic`} className="mb-2 min-h-20 w-full rounded-lg border border-zx-border bg-zx-surface-raised p-2 text-sm" dir="rtl" onChange={(event) => setContentDraftRows((current) => ({ ...current, [key]: { ...row, value_ar: event.target.value } }))} placeholder={fallback.value_ar ?? ''} value={row.value_ar ?? ''} />
                <textarea aria-label={`${key} English`} className="min-h-20 w-full rounded-lg border border-zx-border bg-zx-surface-raised p-2 text-sm" dir="ltr" onChange={(event) => setContentDraftRows((current) => ({ ...current, [key]: { ...row, value_en: event.target.value } }))} placeholder={fallback.value_en ?? ''} value={row.value_en ?? ''} />
              </>}
              <div className="mt-2 flex justify-end gap-2">
                <button className="min-h-11 rounded-lg border border-zx-border px-3 text-xs" onClick={() => void saveContent(key, 'draft')} type="button">{isArabic ? 'حفظ مسودة' : 'Save draft'}</button>
                <button className="min-h-11 rounded-lg bg-zx-cinematic px-3 text-xs text-zx-accent-contrast" onClick={() => void saveContent(key, 'published')} type="button"><Check className="me-1 inline h-4 w-4" />{isArabic ? 'نشر' : 'Publish'}</button>
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-zx-border bg-zx-surface-raised/80 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-zx-text">{isArabic ? 'نقاط منتجات الـLookbook' : 'Lookbook product hotspots'}</h3>
        <p className="text-xs leading-5 text-zx-text-secondary">{isArabic ? 'اختار منتجًا ثم اضغط على الصورة لتحديد مكان النقطة.' : 'Choose a product, then click the preview to place a hotspot.'}</p>
        <div className="flex flex-wrap gap-2">
          <select aria-label={isArabic ? 'اختيار الإطلالة' : 'Select look'} className="min-h-11 rounded-lg border border-zx-border bg-zx-surface px-3 text-sm" onChange={(event) => setHotspotLook(event.target.value)} value={hotspotLook}>
            {[1, 2, 3, 4].map((number) => <option key={number} value={`look-0${number}`}>{isArabic ? `إطلالة 0${number}` : `Look 0${number}`}</option>)}
          </select>
          <select aria-label={isArabic ? 'ربط النقطة بمنتج' : 'Link hotspot to product'} className="min-h-11 min-w-56 rounded-lg border border-zx-border bg-zx-surface px-3 text-sm" onChange={(event) => setHotspotProduct(event.target.value)} value={hotspotProduct}>
            <option value="">{isArabic ? 'اختار منتج' : 'Choose a product'}</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name[locale]}</option>)}
          </select>
        </div>
        <button aria-label={isArabic ? 'إضافة نقطة تجريبية للصورة' : 'Add hotspot using the preview image'} className="relative max-h-96 w-full overflow-hidden rounded-xl border border-zx-border bg-zx-surface" onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          void saveHotspot(((event.clientX - bounds.left) / bounds.width) * 100, ((event.clientY - bounds.top) / bounds.height) * 100);
        }} type="button">
          <img alt="" className="max-h-96 w-full object-contain" src={publicAssetUrl(DEFAULT_SITE_ASSETS[`fashion.look.${hotspotLook.slice(-1)}.photo`]?.url ?? DEFAULT_SITE_ASSETS['fashion.look.1.photo']!.url) ?? undefined} />
          {hotspots.filter((item) => item.look_id === hotspotLook).map((item) => <span aria-hidden="true" className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${item.status === 'published' ? 'bg-zx-accent' : 'bg-zx-highlight'}`} key={item.id ?? `${item.x}-${item.y}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} />)}
        </button>
        <p className="text-xs text-zx-text-secondary">{isArabic ? 'النقاط الجديدة تُحفظ كمسودة من قاعدة البيانات.' : 'New hotspots are saved as drafts.'}</p>
        <ul className="space-y-2">
          {hotspots.filter((item) => item.look_id === hotspotLook).map((item) => {
            const product = products.find((candidate) => candidate.id === item.product_id);
            return <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zx-border p-3 text-xs" key={item.id ?? `${item.product_id}-${item.x}-${item.y}`}>
              <span>{product?.name[locale] ?? item.product_id} · {item.x.toFixed(1)}%, {item.y.toFixed(1)}% · {item.status}</span>
              <span className="flex gap-2">
                {item.id && item.status !== 'published' && <button className="min-h-11 rounded-lg border border-zx-border px-3" onClick={() => void updateHotspotStatus(item.id!, 'published')} type="button">{isArabic ? 'نشر' : 'Publish'}</button>}
                {item.id && <button className="min-h-11 rounded-lg border border-zx-border px-3" onClick={() => void deleteHotspot(item.id!)} type="button">{isArabic ? 'حذف' : 'Delete'}</button>}
              </span>
            </li>;
          })}
        </ul>
      </section>
    </div>
  );
}

function groupLabel(group: string) {
  const labels: Record<string, string> = {
    hero: 'الافتتاحية',
    fashion: 'الأزياء والـLookbook',
    cars: 'السيارات',
    'real-estate': 'العقارات',
    nfc: 'بطاقات NFC',
    studio: 'الاستوديو الرقمي',
    textures: 'الخامات والمؤثرات',
    social: 'المشاركة الاجتماعية',
  };
  return labels[group] ?? group;
}
