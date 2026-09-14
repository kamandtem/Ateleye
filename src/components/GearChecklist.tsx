import React, { useState } from 'react';
import { Check, ChevronDown, ClipboardCheck, RotateCcw, Plus } from 'lucide-react';
import { LocationType } from '../types/pose';
import { LOCATIONS } from '../data/locations';

/**
 * چک‌لیست وسایل قبل از رفتن سر ضبط.
 * (قبلاً «حالت اضطراری» بود؛ حالا داخل پروژه‌ی روز زندگی می‌کند.)
 * کاملاً آفلاین و تیک‌ها در حافظه‌ی مرورگر ذخیره می‌شوند.
 */

const BASE = [
  'باتری دوربین و گوشی',
  'کارت حافظه و فضای خالی',
  'لنز و دستمال میکروفایبر',
  'سه‌پایه یا گیمبال',
  'رفلکتور یا نور پرکن',
  'آب، کفش مناسب و مسیر امن',
];

const EXTRA: Record<LocationType, string[]> = {
  'جنوب': ['محافظت از لنز در برابر گردوغبار و گرما', 'آب کافی و کلاه برای گرمای شدید', 'بررسی مسیر پیاده در نخلستان'],
  'ساحل': ['محافظت از لنز در برابر نمک و شن', 'بررسی موج و مسیر برگشت آب', 'فیلتر ND برای نور سخت'],
  'شمال': ['دستمال ضدبخار لنز', 'کفش ضدلغزش برای مسیر خیس', 'بررسی مه و نور کم جنگل'],
  'کویر': ['تعویض لنز فقط داخل خودرو یا کیف', 'آب کافی و محافظ گردوغبار', 'مشخص کردن مسیر برگشت قبل از غروب'],
  'شهر': ['هماهنگی مجوز عکاسی در اماکن خصوصی', 'توجه به تردد خودرو و عابران', 'باتری اضافه برای جابه‌جایی سریع بین لوکیشن'],
  'باغ عمارت': ['هماهنگی زمان ورود و مجوز عکاسی', 'بررسی پله، حوض و مسیرهای عبور', 'حذف وسایل اضافه از کادر معماری'],
};

interface Props {
  /** کلید ذخیره‌ی تیک‌ها (مثلاً id پروژه) تا هر پروژه چک‌لیست جداگانه داشته باشد. */
  storageKey?: string;
  /** لوکیشن پیش‌فرض (مثلاً لوکیشن فرمالیته‌ی پروژه). */
  defaultLocation?: LocationType;
}

export const GearChecklist: React.FC<Props> = ({ storageKey, defaultLocation = 'باغ عمارت' }) => {
  const key = 'pd_gear_check_' + (storageKey || 'default');
  const [loc, setLoc] = useState<LocationType>(defaultLocation);
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  });
  const [open, setOpen] = useState(false);

  const items = [...BASE, ...EXTRA[loc]];
  const persist = (d: Record<string, boolean>) => {
    setDone(d);
    try { localStorage.setItem(key, JSON.stringify(d)); } catch { /* حافظه پر */ }
  };
  const toggle = (x: string) => persist({ ...done, [x]: !done[x] });
  const reset = () => persist({});
  const checked = items.filter((x) => done[x]).length;

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full p-4 flex items-center gap-3 text-right">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}
        >
          <ClipboardCheck className="w-4 h-4" />
        </span>
        <span className="flex-1">
          <b className="block text-[14px]">چک‌لیست وسایل</b>
          <small className="text-[10px] text-muted">{checked} از {items.length} مورد برای {loc} بررسی شده</small>
        </span>
        <ChevronDown className="w-4 h-4 text-faint" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 a-fade">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {LOCATIONS.map((l) => (
              <button key={l.key} onClick={() => setLoc(l.key)} className={`pill ${loc === l.key ? 'pill-on' : ''}`}>
                <l.icon className="w-3.5 h-3.5" /> {l.key}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {items.map((x) => (
              <button
                key={x}
                onClick={() => toggle(x)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl border text-right"
                style={{
                  borderColor: done[x] ? 'var(--color-teal)' : 'var(--color-line)',
                  background: done[x] ? 'color-mix(in srgb, var(--color-teal) 10%, transparent)' : 'transparent',
                }}
              >
                <span
                  className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
                  style={{ borderColor: done[x] ? 'var(--color-teal)' : 'var(--color-faint)', background: done[x] ? 'var(--color-teal)' : 'transparent' }}
                >
                  {done[x] && <Check className="w-3.5 h-3.5 text-bg" />}
                </span>
                <span className="text-[12px]">{x}</span>
              </button>
            ))}
            <button onClick={reset} className="text-[10px] text-gold font-bold flex items-center gap-1 mt-1">
              <RotateCcw className="w-3 h-3" /> پاک کردن تیک‌ها
            </button>
          </div>
          
          {/* Personal Items Section */}
          <div className="mt-4 pt-4 border-t border-line space-y-3">
            <span className="label text-[13px] font-bold">وسایل شخصی</span>
            <div className="space-y-2" id="personal-items">
              {/* Items will be added here */}
            </div>
            <button
              onClick={() => {
                const input = prompt('نام وسیله:');
                if (input?.trim()) {
                  const list = document.getElementById('personal-items');
                  if (list) {
                    const div = document.createElement('div');
                    div.className = 'flex items-center gap-2.5 p-2.5 rounded-2xl border border-line';
                    div.innerHTML = `<input type="checkbox" class="w-5 h-5" /><span class="text-[12px] flex-1">${input}</span><button class="text-gold text-[12px]">×</button>`;
                    list.appendChild(div);
                  }
                }
              }}
              className="text-[11px] text-gold font-bold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> افزودن وسیله شخصی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
