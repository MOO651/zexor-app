import type { Locale } from '../types';

export type DepartmentSceneKey = 'cards' | 'fashion' | 'services' | 'cars' | 'property';

export const departmentSceneChapters: Record<DepartmentSceneKey, Record<Locale, string>> = {
  cards: { ar: '01 / هوية متصلة', en: '01 / CONNECTED IDENTITY' },
  fashion: { ar: '02 / أزياء زكسور', en: '02 / ZEXOR FASHION' },
  services: { ar: '03 / الاستوديو الرقمي', en: '03 / DIGITAL STUDIO' },
  cars: { ar: '04 / زكسور موتورز', en: '04 / ZEXOR MOTORS' },
  property: { ar: '05 / زكسور إستيتس', en: '05 / ZEXOR ESTATES' },
};

export function toDepartmentSceneKey(slug: string): DepartmentSceneKey | undefined {
  return slug in departmentSceneChapters ? (slug as DepartmentSceneKey) : undefined;
}
