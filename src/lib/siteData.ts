import { isSupabaseConfigured, supabase } from '../../supabase';
import type { CustomerOrder, Locale, Market, PlatformInquiry, SiteSettings } from '../types';

/**
 * Supabase-backed persistence for everything the admin dashboard manages.
 *
 * The storefront used to keep `SiteSettings` in `localStorage`, which meant the
 * admin's edits only ever reached the browser they were made in. This module
 * moves that payload into Supabase so the admin dashboard, the storefront and
 * every visitor share one source of truth, while keeping `localStorage` as an
 * offline / not-yet-provisioned fallback.
 *
 * Schema (see the ordered files in `supabase/migrations/`):
 *   - `site_settings`      one row per key (`brand`, `content`, `hero`, ...)
 *   - `social_links`       Instagram / TikTok / Telegram handles
 *   - `payment_methods`    InstaPay & Vodafone Cash wallet details
 *   - `store_content`      public catalogue and promotional content
 *   - `store_orders`       private customer orders with protected tracking RPCs
 *   - `store_inquiries`    private customer messages and booking requests
 *   - `store_private_settings` Telegram credentials, admin-only
 */

export type SocialLink = {
  id: string;
  platform: string;
  label: string;
  handle: string;
  url: string;
  active: boolean;
  sortOrder: number;
};

export type PaymentMethod = {
  id: string;
  market: Market;
  method: string;
  label: string;
  accountName: string;
  accountNumber: string;
  instructions: Record<Locale, string>;
  active: boolean;
  sortOrder: number;
};

/** Public storefront documents edited by the authenticated admin. */
export type StoreContentKey = 'products' | 'categories' | 'vehicles' | 'properties' | 'promo_codes';

export async function fetchStoreContent<T>(key: StoreContentKey): Promise<T | null> {
  try {
    const { data, error } = await supabase.from('store_content').select('value').eq('key', key).maybeSingle();
    return error || !data ? null : data.value as T;
  } catch {
    return null;
  }
}

export async function saveStoreContent(key: StoreContentKey, value: unknown): Promise<boolean> {
  try {
    if (key === 'products') {
      const { data, error } = await supabase.rpc('admin_save_products', { product_payload: value });
      if (error) {
        console.error(`Supabase rejected store content document "${key}":`, error.message, error.code);
        return false;
      }
      if (data !== true) {
        console.error(`Supabase rejected store content document "${key}": admin_save_products returned`, data);
        return false;
      }
      return true;
    }
    const { error } = await supabase.from('store_content').upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    );
    if (error) {
      console.error(`Supabase rejected store content document "${key}":`, error.message, error.code);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Could not save store content document "${key}":`, error);
    return false;
  }
}

export async function setCloudProductStock(productId: string, stock: number | null): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_set_product_stock', {
      requested_product_id: productId,
      stock_value: stock,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}

export async function updateCloudOrderStatus(
  orderId: string,
  status: CustomerOrder['status'],
): Promise<{ accepted: boolean; reason?: string; payload?: CustomerOrder }> {
  try {
    const { data, error } = await supabase.rpc('admin_update_order_status', {
      requested_order_id: orderId,
      target_status: status,
    });
    if (error || !data || typeof data !== 'object') return { accepted: false, reason: 'unavailable' };
    const result = data as { accepted?: unknown; reason?: unknown; payload?: unknown };
    return {
      accepted: result.accepted === true,
      reason: typeof result.reason === 'string' ? result.reason : undefined,
      payload: result.payload && typeof result.payload === 'object' ? result.payload as CustomerOrder : undefined,
    };
  } catch {
    return { accepted: false, reason: 'unavailable' };
  }
}

export async function updateCloudOrderShipping(orderId: string, details: Pick<CustomerOrder, 'shippingCarrier' | 'trackingNumber' | 'trackingUrl'>): Promise<CustomerOrder | null> {
  try {
    const { data, error } = await supabase.rpc('admin_update_order_shipping', {
      requested_order_id: orderId,
      shipping_details: details,
    });
    if (error || !data || typeof data !== 'object' || data.accepted !== true || !data.payload) return null;
    return data.payload as CustomerOrder;
  } catch {
    return null;
  }
}

export type CloudOrderResult = 'saved' | 'stock_conflict' | 'price_changed' | 'rejected' | 'unavailable' | 'local_only';

export async function createPaymobCheckout(orderId: string, phone: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.functions.invoke('paymob-create-intention', {
      body: { orderId, phone },
    });
    const checkoutUrl = data && typeof data.checkoutUrl === 'string' ? data.checkoutUrl : '';
    if (error || !/^https:\/\/eg\.checkout\.paymob\.com\//i.test(checkoutUrl)) return null;
    return checkoutUrl;
  } catch {
    return null;
  }
}

export async function sendTelegramTestNotification(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { data, error } = await supabase.functions.invoke('telegram-test-notification', { body: {} });
    return !error && data?.sent === true;
  } catch {
    return false;
  }
}

export async function createCloudOrder(order: CustomerOrder): Promise<CloudOrderResult> {
  if (!isSupabaseConfigured) return 'local_only';
  try {
    const { data, error } = await supabase.rpc('create_store_order', { order_payload: order });
    if (error) return 'unavailable';
    if (data && typeof data === 'object' && 'accepted' in data) {
      if (data.accepted === true) return 'saved';
      if (data.reason === 'stock' || data.reason === 'item' || data.reason === 'catalog') return 'stock_conflict';
      if (data.reason === 'price') return 'price_changed';
      return 'rejected';
    }
    return data === true ? 'saved' : 'rejected';
  } catch {
    return 'unavailable';
  }
}

export async function findCloudOrder(id: string, phone: string): Promise<CustomerOrder | null> {
  try {
    const { data, error } = await supabase.rpc('lookup_store_order', {
      order_id: id.trim().toUpperCase(),
      customer_phone: phone.trim(),
    });
    if (error || !data || typeof data !== 'object') return null;
    return data as CustomerOrder;
  } catch {
    return null;
  }
}

export async function fetchAdminOrders(): Promise<CustomerOrder[] | null> {
  try {
    const orders: CustomerOrder[] = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from('store_orders').select('payload')
        .order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);
      if (error || !data) return null;
      orders.push(...data.map((row) => row.payload as CustomerOrder));
      if (data.length < pageSize) return orders;
    }
  } catch {
    return null;
  }
}

export async function saveAdminOrders(orders: CustomerOrder[]): Promise<boolean> {
  if (!orders.length) return true;
  try {
    for (let offset = 0; offset < orders.length; offset += 100) {
      const { data, error } = await supabase.rpc('admin_import_orders', {
        order_payloads: orders.slice(offset, offset + 100),
      });
      if (error || data !== true) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function clearAdminOrders(): Promise<boolean> {
  try {
    const { error } = await supabase.from('store_orders').delete().neq('id', '');
    return !error;
  } catch {
    return false;
  }
}

export async function createCloudInquiry(inquiry: PlatformInquiry): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('create_store_inquiry', { inquiry_payload: inquiry });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchAdminInquiries(): Promise<PlatformInquiry[] | null> {
  try {
    const inquiries: PlatformInquiry[] = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from('store_inquiries').select('payload')
        .order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);
      if (error || !data) return null;
      inquiries.push(...data.map((row) => row.payload as PlatformInquiry));
      if (data.length < pageSize) return inquiries;
    }
  } catch {
    return null;
  }
}

export async function saveAdminInquiries(inquiries: PlatformInquiry[]): Promise<boolean> {
  if (!inquiries.length) return true;
  try {
    for (let offset = 0; offset < inquiries.length; offset += 100) {
      const { data, error } = await supabase.rpc('admin_import_inquiries', {
        inquiry_payloads: inquiries.slice(offset, offset + 100),
      });
      if (error || data !== true) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function updateCloudInquiryStatus(
  inquiryId: string,
  status: PlatformInquiry['status'],
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('admin_update_inquiry_status', {
      requested_inquiry_id: inquiryId,
      target_status: status,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}

export async function deleteAdminInquiry(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('store_inquiries').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function clearAdminInquiries(): Promise<boolean> {
  try {
    const { error } = await supabase.from('store_inquiries').delete().neq('id', '');
    return !error;
  } catch {
    return false;
  }
}

/** Social platforms the admin can manage. `instagram` is the headline one. */
export const SOCIAL_PLATFORMS = ['instagram', 'tiktok', 'facebook', 'x', 'snapchat'] as const;
/** Wallet-style payment methods the admin can manage. */
export const PAYMENT_METHODS_BY_MARKET: Record<Market, { method: string; label: string; active: boolean }[]> = {
  eg: [
    { method: 'visa', label: 'Visa / Mastercard', active: true },
    { method: 'fawry', label: 'FawryPay', active: true },
    { method: 'instapay', label: 'InstaPay', active: true },
    { method: 'vodafone_cash', label: 'Vodafone Cash', active: true },
    { method: 'cash', label: 'Cash on delivery', active: true },
  ],
  ksa: [
    { method: 'mada', label: 'مدى / Mada', active: true },
    { method: 'stc_pay', label: 'STC Pay', active: true },
    { method: 'apple_pay', label: 'Apple Pay', active: true },
    { method: 'bank_transfer', label: 'Bank transfer', active: false },
    { method: 'cash', label: 'Cash on delivery', active: true },
  ],
};

const LOCAL_SOCIALS_KEY = 'zexor-social-links-v1';
const LOCAL_PAYMENTS_KEY = 'zexor-payment-methods-v1';

function readLocalRows<T>(key: string): T[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value as T[] : null;
  } catch {
    return null;
  }
}

function saveLocalRow<T>(key: string, rows: T[], matches: (row: T) => boolean, value: T): T | null {
  try {
    const next = [...rows.filter((row) => !matches(row)), value];
    localStorage.setItem(key, JSON.stringify(next));
    return value;
  } catch {
    return null;
  }
}

const SOCIAL_LABELS: Record<string, Record<Locale, string>> = {
  instagram: { en: 'Instagram', ar: 'إنستجرام' },
  tiktok: { en: 'TikTok', ar: 'تيك توك' },
  facebook: { en: 'Facebook', ar: 'فيسبوك' },
  x: { en: 'X (Twitter)', ar: 'إكس (تويتر)' },
  snapchat: { en: 'Snapchat', ar: 'سناب شات' },
};

const WALLET_LABELS: Record<string, Record<Locale, string>> = {
  instapay: { en: 'InstaPay', ar: 'إنستاباي' },
  vodafone_cash: { en: 'Vodafone Cash', ar: 'فودافون كاش' },
  cash: { en: 'Cash', ar: 'نقدي' },
  wallet: { en: 'Wallet', ar: 'محفظة إلكترونية' },
};

function emptyLocalized(value?: string): Record<Locale, string> {
  return { en: value ?? '', ar: value ?? '' };
}

/** Builds an empty row for a platform so the admin form always has inputs. */
export function blankSocialLink(platform: string, sortOrder = 0): SocialLink {
  const label = SOCIAL_LABELS[platform] ?? { en: platform, ar: platform };
  return {
    id: `social-${platform}`,
    platform,
    label: label.en,
    handle: '',
    url: '',
    active: true,
    sortOrder,
  };
}

export function blankPaymentMethod(method: string, market: Market = 'eg', sortOrder = 0): PaymentMethod {
  const configured = PAYMENT_METHODS_BY_MARKET[market].find((entry) => entry.method === method);
  const label = WALLET_LABELS[method] ?? { en: configured?.label ?? method, ar: configured?.label ?? method };
  return {
    id: `pay-${market}-${method}`,
    market,
    method,
    label: configured?.label ?? label.en,
    accountName: '',
    accountNumber: '',
    instructions: emptyLocalized(),
    active: configured?.active ?? false,
    sortOrder,
  };
}

export function socialLabel(platform: string, locale: Locale): string {
  return SOCIAL_LABELS[platform]?.[locale] ?? platform;
}

export function walletLabel(method: string, locale: Locale): string {
  return WALLET_LABELS[method]?.[locale] ?? method;
}

/* ------------------------------------------------------------------ */
/* Row <-> app-type mapping                                            */
/* ------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToSocial(row: any): SocialLink {
  return {
    id: String(row.id ?? ''),
    platform: String(row.platform ?? ''),
    label: String(row.label ?? ''),
    handle: String(row.handle ?? ''),
    url: String(row.url ?? ''),
    active: row.active !== false,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function rowToPayment(row: any): PaymentMethod {
  return {
    id: String(row.id ?? ''),
    market: row.market === 'ksa' ? 'ksa' : 'eg',
    method: String(row.method ?? ''),
    label: String(row.label ?? ''),
    accountName: String(row.account_name ?? ''),
    accountNumber: String(row.account_number ?? ''),
    instructions: {
      en: String(row.instructions_en ?? ''),
      ar: String(row.instructions_ar ?? ''),
    },
    active: row.active !== false,
    sortOrder: Number(row.sort_order ?? 0),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/**
 * Fetches the site-wide settings payload from Supabase and merges it over the
 * caller's defaults. Returns `null` when the table is missing, empty or the
 * network is unavailable so the caller can fall back to localStorage.
 */
export async function fetchSiteSettings(defaults: SiteSettings): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase.from('site_settings').select('key, value');
    if (error || !data || data.length === 0) return null;

    const stored: Record<string, unknown> = {};
    for (const row of data) {
      if (row?.key && row.key !== 'telegramBotToken' && row.key !== 'telegramChatId') {
        stored[String(row.key)] = row.value;
      }
    }

    // Same one-level merge rule as `mergeSettings`: defaults win for anything
    // the database row does not carry yet (e.g. a field added in this build).
    const merged = { ...defaults } as Record<string, unknown>;
    for (const [key, value] of Object.entries(stored)) {
      const base = (defaults as unknown as Record<string, unknown>)[key];
      if (base && typeof base === 'object' && !Array.isArray(base) && value && typeof value === 'object') {
        merged[key] = { ...(base as object), ...(value as object) };
      } else if (value !== undefined && value !== null) {
        merged[key] = value;
      }
    }
    return merged as SiteSettings;
  } catch {
    return null;
  }
}

/**
 * Writes the settings payload to Supabase as one row per key. Values are plain
 * JSON columns, so adding a field to `SiteSettings` needs no schema change.
 */
export async function saveSiteSettings(settings: SiteSettings): Promise<boolean> {
  try {
    // Telegram credentials must never enter the publicly readable settings table.
    const publicSettings = Object.fromEntries(
      Object.entries(settings).filter(([key]) => key !== 'telegramBotToken' && key !== 'telegramChatId'),
    );
    const rows = Object.entries(publicSettings as unknown as Record<string, unknown>).map(
      ([key, value]) => ({ key, value, updated_at: new Date().toISOString() }),
    );
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchPrivateSiteSecrets(): Promise<Pick<SiteSettings, 'telegramBotToken' | 'telegramChatId'> | null> {
  try {
    const { data, error } = await supabase.from('store_private_settings').select('key, value');
    if (error || !data) return null;
    const values = Object.fromEntries(data.map((row) => [String(row.key), row.value]));
    return {
      telegramBotToken: typeof values.telegramBotToken === 'string' ? values.telegramBotToken : '',
      telegramChatId: typeof values.telegramChatId === 'string' ? values.telegramChatId : '',
    };
  } catch {
    return null;
  }
}

export async function savePrivateSiteSecrets(secrets: Pick<SiteSettings, 'telegramBotToken' | 'telegramChatId'>): Promise<boolean> {
  try {
    const rows = [
      { key: 'telegramBotToken', value: secrets.telegramBotToken },
      { key: 'telegramChatId', value: secrets.telegramChatId },
    ];
    const { error } = await supabase.from('store_private_settings').upsert(rows, { onConflict: 'key' });
    return !error;
  } catch {
    return false;
  }
}

/** Fetches the social links; returns `null` when unavailable. */
export async function fetchSocialLinks(includeLocalFallback = true): Promise<SocialLink[] | null> {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return includeLocalFallback ? readLocalRows<SocialLink>(LOCAL_SOCIALS_KEY) : null;
    if (data.length === 0) return includeLocalFallback ? readLocalRows<SocialLink>(LOCAL_SOCIALS_KEY) ?? [] : [];
    const remote = data.map(rowToSocial);
    if (!includeLocalFallback) return remote;
    const local = readLocalRows<SocialLink>(LOCAL_SOCIALS_KEY) ?? [];
    return [...remote, ...local.filter((item) => !remote.some((entry) => entry.platform === item.platform))];
  } catch {
    return includeLocalFallback ? readLocalRows<SocialLink>(LOCAL_SOCIALS_KEY) : null;
  }
}

/** Fetches the wallet / payment methods; returns `null` when unavailable. */
export async function fetchPaymentMethods(includeLocalFallback = true): Promise<PaymentMethod[] | null> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error || !data) return includeLocalFallback ? readLocalRows<PaymentMethod>(LOCAL_PAYMENTS_KEY) : null;
    if (data.length === 0) return includeLocalFallback ? readLocalRows<PaymentMethod>(LOCAL_PAYMENTS_KEY) ?? [] : [];
    const remote = data.map(rowToPayment);
    if (!includeLocalFallback) return remote;
    const local = readLocalRows<PaymentMethod>(LOCAL_PAYMENTS_KEY) ?? [];
    return [...remote, ...local.filter((item) => !remote.some((entry) => entry.market === item.market && entry.method === item.method))];
  } catch {
    return includeLocalFallback ? readLocalRows<PaymentMethod>(LOCAL_PAYMENTS_KEY) : null;
  }
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

/**
 * Upserts one social link. Rows without a database id are inserted, so the
 * first save of a platform the admin just filled in creates the row.
 */
export async function saveSocialLink(link: SocialLink): Promise<SocialLink | null> {
  const payload = {
    platform: link.platform,
    label: link.label,
    handle: link.handle,
    url: link.url,
    active: link.active,
    sort_order: link.sortOrder,
  };
  try {
    const hasDbId = link.id && !link.id.startsWith('social-');
    const { data, error } = hasDbId
      ? await supabase.from('social_links').update(payload).eq('id', link.id).select().single()
      : await supabase.from('social_links').insert(payload).select().single();
    if (error || !data) return saveLocalRow(LOCAL_SOCIALS_KEY, readLocalRows<SocialLink>(LOCAL_SOCIALS_KEY) ?? [], (row) => row.platform === link.platform, link);
    return rowToSocial(data);
  } catch {
    return saveLocalRow(LOCAL_SOCIALS_KEY, readLocalRows<SocialLink>(LOCAL_SOCIALS_KEY) ?? [], (row) => row.platform === link.platform, link);
  }
}

/** Upserts one payment method row. */
export async function savePaymentMethod(method: PaymentMethod): Promise<PaymentMethod | null> {
  const payload = {
    method: method.method,
    market: method.market,
    label: method.label,
    account_name: method.accountName,
    account_number: method.accountNumber,
    instructions_en: method.instructions.en,
    instructions_ar: method.instructions.ar,
    active: method.active,
    sort_order: method.sortOrder,
  };
  try {
    const hasDbId = method.id && !method.id.startsWith('pay-');
    const { data, error } = hasDbId
      ? await supabase.from('payment_methods').update(payload).eq('id', method.id).select().single()
      : await supabase.from('payment_methods').insert(payload).select().single();
    if (error || !data) return saveLocalRow(LOCAL_PAYMENTS_KEY, readLocalRows<PaymentMethod>(LOCAL_PAYMENTS_KEY) ?? [], (row) => row.method === method.method && row.market === method.market, method);
    return rowToPayment(data);
  } catch {
    return saveLocalRow(LOCAL_PAYMENTS_KEY, readLocalRows<PaymentMethod>(LOCAL_PAYMENTS_KEY) ?? [], (row) => row.method === method.method && row.market === method.market, method);
  }
}

/** Cheap connectivity probe used by the admin header to show DB status. */
export async function pingSiteData(): Promise<boolean> {
  try {
    const { error } = await supabase.from('site_settings').select('key').limit(1);
    return !error;
  } catch {
    return false;
  }
}
