import React, { useMemo, useState } from 'react';
import { ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  CategoryType,
  DifficultyLevel,
  EMPTY_FILTERS,
  FilterState,
  GARDEN_SUB_CATEGORIES,
  GardenSubCategory,
  LocationType,
  PoseType,
} from '../types/pose';
import { LOCATION_KEYS } from '../data/locations';

const CATEGORIES: (CategoryType | 'همه')[] = ['همه', 'عروس و داماد', 'عروس', 'داماد', 'زوج', 'گروهی'];
const TYPES: (PoseType | 'همه')[] = ['همه', 'ایستاده', 'نشسته', 'راه رفتن', 'بغل کردن', 'رمانتیک', 'رسمی', 'خلاقانه', 'حرکتی'];
const DIFFS: (DifficultyLevel | 'همه')[] = ['همه', 'آسان', 'متوسط', 'حرفه‌ای'];
const LOCS: (LocationType | 'همه')[] = ['همه', ...LOCATION_KEYS];
const GARDEN_SUBS: (GardenSubCategory | 'همه')[] = ['همه', ...GARDEN_SUB_CATEGORIES];
const PEOPLE = [null, 1, 2, 3, 4] as const;

interface Props { filters: FilterState; onChange: (f: FilterState) => void; total: number; }

type ActiveFilter = { key: string; label: string; clear: () => void };

export const Filters: React.FC<Props> = ({ filters, onChange, total }) => {
  const [expanded, setExpanded] = useState(false);
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) => onChange({ ...filters, [key]: value });

  const active = useMemo<ActiveFilter[]>(() => {
    const a: ActiveFilter[] = [];
    if (filters.location !== 'همه') a.push({ key: 'location', label: filters.location, clear: () => onChange({ ...filters, location: 'همه', gardenSubCategory: 'همه' }) });
    if (filters.gardenSubCategory !== 'همه') a.push({ key: 'garden', label: filters.gardenSubCategory, clear: () => set('gardenSubCategory', 'همه') });
    if (filters.category !== 'همه') a.push({ key: 'category', label: filters.category, clear: () => set('category', 'همه') });
    if (filters.poseType !== 'همه') a.push({ key: 'type', label: filters.poseType, clear: () => set('poseType', 'همه') });
    if (filters.difficulty !== 'همه') a.push({ key: 'difficulty', label: filters.difficulty, clear: () => set('difficulty', 'همه') });
    if (filters.peopleCount) a.push({ key: 'people', label: `${filters.peopleCount === 4 ? '۴+' : filters.peopleCount} نفر`, clear: () => set('peopleCount', null) });
    if (filters.customOnly) a.push({ key: 'custom', label: 'ژست‌های من', clear: () => set('customOnly', false) });
    return a;
  }, [filters]);

  return (
    <section className="filter-shell" aria-label="جستجو و فیلتر ژست‌ها">
      <div className="relative">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
        <input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="چه ژستی می‌خوای؟ مثلاً راه رفتن کنار ساحل"
          className="field !pr-10 !pl-10 !py-3.5"
          aria-label="جستجوی ژست"
        />
        {filters.search && <button onClick={() => set('search', '')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-faint" aria-label="پاک کردن جستجو"><X className="w-4 h-4" /></button>}
      </div>

      <FilterRow label="کجا هستی؟" options={LOCS} value={filters.location} onPick={(v) => onChange({ ...filters, location: v, gardenSubCategory: v === 'باغ عمارت' ? filters.gardenSubCategory : 'همه' })} />

      {filters.location === 'باغ عمارت' && (
        <FilterRow label="کدام مرحله؟" options={GARDEN_SUBS} value={filters.gardenSubCategory} onPick={(v) => set('gardenSubCategory', v)} />
      )}

      <button type="button" onClick={() => setExpanded(!expanded)} className="filter-more" aria-expanded={expanded}>
        <span><SlidersHorizontal className="w-4 h-4" />فیلترهای بیشتر</span>
        <span className="text-muted font-normal">{active.length ? `${active.length.toLocaleString('fa-IR')} انتخاب` : 'سوژه، حالت، سختی'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="filter-advanced a-fade">
          <FilterRow label="سوژه" options={CATEGORIES} value={filters.category} onPick={(v) => set('category', v)} />
          <FilterRow label="حالت ژست" options={TYPES} value={filters.poseType} onPick={(v) => set('poseType', v)} />
          <FilterRow label="سختی اجرا" options={DIFFS} value={filters.difficulty} onPick={(v) => set('difficulty', v)} />
          <FilterRow label="تعداد نفرات" options={PEOPLE} value={filters.peopleCount} onPick={(v) => set('peopleCount', v)} render={(v) => v === null ? 'همه' : v === 4 ? '۴+' : v.toLocaleString('fa-IR')} />
          <button onClick={() => set('customOnly', !filters.customOnly)} className={`filter-check ${filters.customOnly ? 'is-on' : ''}`}><span className="check-dot">{filters.customOnly ? '✓' : ''}</span>فقط ژست‌های خودم</button>
        </div>
      )}

      <div className="filter-summary">
        <strong>{total.toLocaleString('fa-IR')} ژست</strong>
        <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar">
          {active.map((item) => <button key={item.key} onClick={item.clear} className="active-filter">{item.label}<X className="w-3 h-3" /></button>)}
        </div>
        {(active.length > 0 || filters.search) && <button onClick={() => onChange({ ...EMPTY_FILTERS })} className="filter-reset" aria-label="پاک کردن همه فیلترها"><RotateCcw className="w-3.5 h-3.5" />پاک کردن</button>}
      </div>
    </section>
  );
};

function FilterRow<T extends string | number | null>({ label, options, value, onPick, render }: { label: string; options: readonly T[]; value: T; onPick: (v: T) => void; render?: (v: T) => string }) {
  return <div className="space-y-2"><span className="label !mb-0">{label}</span><div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">{options.map((o, i) => <button key={`${String(o)}-${i}`} onClick={() => onPick(o)} className={`choice-chip ${value === o ? 'is-on' : ''}`}>{render ? render(o) : String(o)}</button>)}</div></div>;
}
