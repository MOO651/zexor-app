import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured, supabase } from '../../supabase';
import {
  DEFAULT_SITE_ASSETS,
  DEFAULT_SITE_CONTENT,
  type SiteAssetType,
} from '../config/assets';
import type { Locale } from '../types';
import {
  SiteMediaContext,
  type ResolvedSiteAsset,
  type SiteContentRecord,
  type SiteHotspot,
  type SiteMediaContextValue,
} from './siteMediaContext';

const CACHE_KEY = 'zexor-site-media-v1';

type AssetRow = {
  key: string;
  type: SiteAssetType;
  url: string;
  poster_url: string | null;
  meta: Record<string, unknown>;
  alt_ar: string;
  alt_en: string;
  updated_at: string;
  status: 'draft' | 'published';
};

type CachedSiteMedia = {
  assets: AssetRow[];
  content: SiteContentRecord[];
  hotspots: SiteHotspot[];
  savedAt: number;
};

type LoadedSiteMedia = CachedSiteMedia & { errors: string[] };

let siteMediaRequest: Promise<LoadedSiteMedia> | null = null;

function readCache(): CachedSiteMedia | null {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const cache = parsed as Partial<CachedSiteMedia>;
    if (!Array.isArray(cache.assets) || !Array.isArray(cache.content) || !Array.isArray(cache.hotspots)) {
      return null;
    }
    return {
      assets: cache.assets,
      content: cache.content,
      hotspots: cache.hotspots,
      savedAt: typeof cache.savedAt === 'number' ? cache.savedAt : 0,
    };
  } catch (error) {
    console.warn('Could not read cached site media; using local defaults.', error);
    return null;
  }
}

function writeCache(cache: CachedSiteMedia): void {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Could not cache site media for this session.', error);
  }
}

function cacheBustedUrl(url: string | null, updatedAt: string | null): string | null {
  if (!url || !updatedAt) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set('v', updatedAt);
    return parsed.origin === window.location.origin
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(updatedAt)}`;
  }
}

function resolveAssets(rows: AssetRow[]): Record<string, ResolvedSiteAsset> {
  const publishedRows = new Map(rows.filter((row) => row.status === 'published').map((row) => [row.key, row]));
  return Object.fromEntries(
    Object.entries(DEFAULT_SITE_ASSETS).map(([key, fallback]) => {
      const row = publishedRows.get(key);
      if (!row) {
        return [key, {
          ...fallback,
          key,
          posterUrl: fallback.posterUrl ?? null,
          mobileUrl: null,
          alt: { ar: '', en: '' },
          meta: {},
          updatedAt: null,
          source: 'default',
        }];
      }
      return [key, {
        ...fallback,
        key,
        type: row.type,
        url: cacheBustedUrl(row.url, row.updated_at) ?? fallback.url,
        posterUrl: cacheBustedUrl(row.poster_url, row.updated_at) ?? fallback.posterUrl ?? null,
        mobileUrl: typeof row.meta?.mobile_url === 'string'
          ? cacheBustedUrl(row.meta.mobile_url, row.updated_at)
          : null,
        alt: { ar: row.alt_ar ?? '', en: row.alt_en ?? '' },
        meta: row.meta ?? {},
        updatedAt: row.updated_at,
        source: 'published',
      }];
    }),
  );
}

function loadSiteMedia(fallback: CachedSiteMedia): Promise<LoadedSiteMedia> {
  if (siteMediaRequest) return siteMediaRequest;
  siteMediaRequest = Promise.all([
    supabase.from('site_assets')
      .select('key,type,url,poster_url,meta,alt_ar,alt_en,updated_at,status')
      .eq('status', 'published'),
    supabase.from('site_content')
      .select('key,value_ar,value_en,value_json,status')
      .eq('status', 'published'),
    supabase.from('site_hotspots')
      .select('id,look_id,x,y,product_id,sort_order')
      .eq('status', 'published')
      .order('sort_order'),
  ]).then(([assetResult, contentResult, hotspotResult]) => {
    const errors: string[] = [];
    if (assetResult.error) {
      console.error('Could not load published site assets:', assetResult.error.message);
      errors.push(assetResult.error.message);
    }
    if (contentResult.error) {
      console.error('Could not load published site content:', contentResult.error.message);
      errors.push(contentResult.error.message);
    }
    if (hotspotResult.error) {
      console.error('Could not load published lookbook hotspots:', hotspotResult.error.message);
      errors.push(hotspotResult.error.message);
    }

    return {
      assets: assetResult.error ? fallback.assets : assetResult.data as AssetRow[],
      content: contentResult.error ? fallback.content : contentResult.data as SiteContentRecord[],
      hotspots: hotspotResult.error ? fallback.hotspots : hotspotResult.data as SiteHotspot[],
      savedAt: Date.now(),
      errors,
    };
  }).finally(() => {
    siteMediaRequest = null;
  });
  return siteMediaRequest;
}

export function SiteMediaProvider({ children }: { children: ReactNode }) {
  const [cached] = useState(readCache);
  const [assets, setAssets] = useState<AssetRow[]>(cached?.assets ?? []);
  const [contentRows, setContentRows] = useState<SiteContentRecord[]>(cached?.content ?? []);
  const [hotspots, setHotspots] = useState<SiteHotspot[]>(cached?.hotspots ?? []);
  const lastKnown = useRef<CachedSiteMedia>(cached ?? {
    assets: [],
    content: [],
    hotspots: [],
    savedAt: 0,
  });
  const [status, setStatus] = useState<SiteMediaContextValue['status']>(
    isSupabaseConfigured ? (cached ? 'refreshing' : 'loading') : 'fallback',
  );

  const applyResult = useCallback((result: LoadedSiteMedia) => {
    const cache: CachedSiteMedia = {
      assets: result.assets,
      content: result.content,
      hotspots: result.hotspots,
      savedAt: result.savedAt,
    };
    lastKnown.current = cache;
    setAssets(cache.assets);
    setContentRows(cache.content);
    setHotspots(cache.hotspots);
    writeCache(cache);
    setStatus(result.errors.length ? 'error' : 'ready');
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus('fallback');
      return;
    }
    try {
      applyResult(await loadSiteMedia(lastKnown.current));
    } catch (error) {
      console.error('Could not refresh site media; retaining cached assets and local defaults.', error);
      setStatus('error');
    }
  }, [applyResult]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.info('Supabase is not configured; the site is using local media defaults.');
      return;
    }
    let active = true;
    void loadSiteMedia(lastKnown.current).then((result) => {
      if (active) applyResult(result);
    }).catch((error: unknown) => {
      console.error('Could not refresh site media; retaining cached assets and local defaults.', error);
      if (active) setStatus('error');
    });
    return () => {
      active = false;
    };
  }, [applyResult]);

  const resolvedAssets = useMemo(() => resolveAssets(assets), [assets]);
  const content = useMemo(() => {
    const merged: Record<string, SiteContentRecord> = {};
    for (const [key, row] of Object.entries(DEFAULT_SITE_CONTENT)) {
      merged[key] = { ...row, key, status: 'published', source: 'default' };
    }
    for (const row of contentRows) {
      if (row.status === 'published') merged[row.key] = { ...row, source: 'published' };
    }
    return merged;
  }, [contentRows]);
  const getText = useCallback((key: string, locale: Locale) => {
    const value = content[key]?.[locale === 'ar' ? 'value_ar' : 'value_en'];
    return typeof value === 'string' && value.trim() ? value : null;
  }, [content]);

  const value = useMemo(() => ({
    assets: resolvedAssets,
    content,
    hotspots,
    status,
    refresh,
    getText,
  }), [resolvedAssets, content, hotspots, status, refresh, getText]);

  return <SiteMediaContext.Provider value={value}>{children}</SiteMediaContext.Provider>;
}
