import { createContext, useContext } from 'react';
import type { DefaultSiteAsset } from '../config/assets';
import type { Locale } from '../types';

export type SiteContentRecord = {
  key: string;
  value_ar: string | null;
  value_en: string | null;
  value_json: unknown;
  status: 'draft' | 'published';
  source?: 'default' | 'published';
};

export type SiteHotspot = {
  id: string;
  look_id: string;
  x: number;
  y: number;
  product_id: string;
  sort_order: number;
};

export type ResolvedSiteAsset = DefaultSiteAsset & {
  key: string;
  posterUrl: string | null;
  mobileUrl: string | null;
  alt: Record<Locale, string>;
  meta: Record<string, unknown>;
  updatedAt: string | null;
  source: 'default' | 'published';
};

export type SiteMediaContextValue = {
  assets: Record<string, ResolvedSiteAsset>;
  content: Record<string, SiteContentRecord>;
  hotspots: SiteHotspot[];
  status: 'loading' | 'refreshing' | 'ready' | 'fallback' | 'error';
  refresh: () => Promise<void>;
  getText: (key: string, locale: Locale) => string | null;
};

export const SiteMediaContext = createContext<SiteMediaContextValue | null>(null);

export function useSiteMedia(): SiteMediaContextValue {
  const context = useContext(SiteMediaContext);
  if (!context) throw new Error('useSiteMedia must be used inside SiteMediaProvider.');
  return context;
}

export function useSiteAssets(): Pick<SiteMediaContextValue, 'assets' | 'status' | 'refresh'> {
  const { assets, status, refresh } = useSiteMedia();
  return { assets, status, refresh };
}

export function useSiteContent(): Pick<SiteMediaContextValue, 'content' | 'getText' | 'status' | 'refresh'> {
  const { content, getText, status, refresh } = useSiteMedia();
  return { content, getText, status, refresh };
}
