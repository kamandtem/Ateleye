import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryType, DifficultyLevel, EMPTY_FILTERS, EnvironmentType, FilterState, Framing, LocationType, Mood, MovementFilter, Pose, PoseScope, PoseType } from '../types/pose';
import { LOCATION_KEYS } from '../data/locations';
import { detailSubjectsFor, ENVIRONMENTS, FRAMINGS, MOODS, SCOPES } from '../data/taxonomy';
import { ScenarioRail } from './ScenarioRail';

const CATEGORIES: (CategoryType | 'همه')[] = ['همه', 'عروس و داماد', 'عروس', 'داماد', 'زوج', 'گروهی'];
const TYPES: (PoseType | 'همه')[] = ['همه', 'ایستاده', 'نشسته', 'راه رفتن', 'بغل کردن', 'رمانتیک', 'رسمی', 'خلاقانه', 'حرکتی'];
const DIFFS: (DifficultyLevel | 'همه')[] = ['همه', 'آسان', 'متوسط', 'حرفه‌ای'];
const LOCS: (LocationType | 'همه')[] = ['همه', ...LOCATION_KEYS];
const SCOPE_OPTS: (PoseScope | 'همه')[] = ['همه', ...SCOPES];
const FRAMING_OPTS: (Framing | 'همه')[] = ['همه', ...FRAMINGS];
const MOOD_OPTS: (Mood | 'همه')[] = ['همه', ...MOODS];
const ENV_OPTS: (EnvironmentType | 'همه')[] = ['همه', ...ENVIRONMENTS];
const MOVE_OPTS: MovementFilter[] = ['همه', 'دارد', 'ندارد'];

interface Props { filters: FilterState; onChange: (f: FilterState) => void; total: number; allPoses?: Pose[]; }

export const Filters: React.FC<Props> = ({ filters, onChange, total, allPoses }) => {
  const [open, setOpen] = useState(false);
  const active = useMemo(() => [
    filters.scenario !== 'همه' && { key: 'scenario', label: filters.scenario }, filters.mood !== 'همه' && { key: 'mood', label: filters.mood },
    filters.location !== 'همه' && { key: 'location', label: filters.location }, filters.framing !== 'همه' && { key: 'framing', label: filters.framing },
    filters.category !== 'همه' && { key: 'category', label: filters.category }, filters.scope !== 'همه' && { key: 'scope', label: filters.scope },
    filters.movement !== 'همه' && { key: 'movement', label: `حرکت ${filters.movement}` }, filters.environment !== 'همه' && { key: 'environment', label: filters.environment },
    filters.poseType !== 'همه' && { key: 'poseType', label: filters.poseType }, filters.difficulty !== 'همه' && { key: 'difficulty', label: filters.difficulty },
    filters.customOnly && { key: 'customOnly', label: 'ژست‌های من' },
  ].filter(Boolean) as { key: keyof FilterState; label: string }[], [filters]);
  const clearOne = (key: keyof FilterState) => onChange({ ...filters, [key]: EMPTY_FILTERS[key] });
  const Row = <T extends string>({ label, options, value, onPick }: { label: string; options: T[]; value: T; onPick: (value: T) => void }) => (
    <div className="filter-group"><span>{label}</span><div className="filter-options">{options.map((option) => <button key={option} onClick={() => onPick(option)} className={value === option ? 'selected' : ''}>{value === option && <Check className="w-3 h-3" />}{option}</button>)}</div></div>
  );
  return (
    <section className="filter-console">
      <div className="filter-search"><Search className="w-4 h-4" /><input value={filters.search} onChange={(e) => onChange({ ...filters, search: e.target.value })} placeholder="ژست، حس، لوکیشن یا حرکت..." />
        {filters.search && <button onClick={() => onChange({ ...filters, search: '' })} aria-label="پاک کردن جستجو"><X className="w-4 h-4" /></button>}
        <button onClick={() => setOpen((v) => !v)} className={`filter-trigger ${open ? 'open' : ''}`}><SlidersHorizontal className="w-4 h-4" /><span>فیلتر</span>{active.length > 0 && <b>{active.length}</b>}</button>
      </div>
      <div className="scenario-quick"><ScenarioRail poses={allPoses || []} value={filters.scenario} onPick={(scenario) => onChange({ ...filters, scenario, detailSubject: scenario === 'دیتیل صحنه' || scenario === 'اکسسوری' ? filters.detailSubject : 'همه' })} /></div>
      {active.length > 0 && <div className="active-filters no-scrollbar">{active.map((item) => <button key={item.key} onClick={() => clearOne(item.key)}>{item.label}<X className="w-3 h-3" /></button>)}<button onClick={() => onChange({ ...EMPTY_FILTERS })} className="clear-all"><RotateCcw className="w-3 h-3" /> پاک کردن</button></div>}
      {open && <div className="filter-panel a-fade">
        {(filters.scenario === 'دیتیل صحنه' || filters.scenario === 'اکسسوری') && <Row label="موضوع" options={['همه', ...detailSubjectsFor(filters.scenario)]} value={filters.detailSubject} onPick={(value) => onChange({ ...filters, detailSubject: value })} />}
        <Row label="حال‌وهوا" options={MOOD_OPTS} value={filters.mood} onPick={(value) => onChange({ ...filters, mood: value })} />
        <Row label="لوکیشن" options={LOCS} value={filters.location} onPick={(value) => onChange({ ...filters, location: value })} />
        <Row label="سوژه" options={CATEGORIES} value={filters.category} onPick={(value) => onChange({ ...filters, category: value })} />
        <Row label="کادر" options={FRAMING_OPTS} value={filters.framing} onPick={(value) => onChange({ ...filters, framing: value })} />
        <details className="advanced-filters"><summary>فیلترهای بیشتر <ChevronDown className="w-4 h-4" /></summary><div>
          <Row label="نوع ژست" options={SCOPE_OPTS} value={filters.scope} onPick={(value) => onChange({ ...filters, scope: value })} />
          <Row label="حرکت" options={MOVE_OPTS} value={filters.movement} onPick={(value) => onChange({ ...filters, movement: value })} />
          <Row label="فضا" options={ENV_OPTS} value={filters.environment} onPick={(value) => onChange({ ...filters, environment: value })} />
          <Row label="حالت بدن" options={TYPES} value={filters.poseType} onPick={(value) => onChange({ ...filters, poseType: value })} />
          <Row label="سختی" options={DIFFS} value={filters.difficulty} onPick={(value) => onChange({ ...filters, difficulty: value })} />
          <button onClick={() => onChange({ ...filters, customOnly: !filters.customOnly })} className={`mine-toggle ${filters.customOnly ? 'selected' : ''}`}>{filters.customOnly && <Check className="w-4 h-4" />} فقط ژست‌های خودم</button>
        </div></details>
        <button onClick={() => setOpen(false)} className="filter-done">{total} نتیجه، نمایش بده</button>
      </div>}
    </section>
  );
};
