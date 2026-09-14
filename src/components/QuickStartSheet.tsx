import React, { useEffect, useState } from 'react';
import { ArrowRight, Clapperboard, X } from 'lucide-react';
import { GARDEN_SUB_CATEGORIES, GardenSubCategory, LocationType } from '../types/pose';
import { LOCATIONS } from '../data/locations';

interface Props {
  open: boolean;
  onCancel: () => void;
  /** gsc فقط وقتی location === 'باغ عمارت' باشد معنا دارد؛ 'همه' یعنی همه مراحل باغ. */
  onStart: (location: LocationType, gsc: GardenSubCategory | 'همه') => void;
}

/**
 * دکمه‌ی «الان کجای مراسمی؟» در خانه این کادر را باز می‌کند: انتخاب لوکیشن
 * (و برای باغ عمارت، انتخاب مرحله) و بلافاصله ورود به حالت عکاسی با صفی از
 * ژست‌های همان بخش، مرتب از یخ‌شکن به صمیمی/حرفه‌ای.
 */
export const QuickStartSheet: React.FC<Props> = ({ open, onCancel, onStart }) => {
  const [step, setStep] = useState<'location' | 'garden'>('location');
  const [location, setLocation] = useState<LocationType | null>(null);

  useEffect(() => {
    if (open) {
      setStep('location');
      setLocation(null);
    }
  }, [open]);

  if (!open) return null;

  const pickLocation = (l: LocationType) => {
    if (l === 'باغ عمارت') {
      setLocation(l);
      setStep('garden');
    } else {
      onStart(l, 'همه');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-3" dir="rtl">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.72)', backdropFilter: 'blur(3px)' }}
        onClick={onCancel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="شروع سریع"
        className="relative w-full sm:max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar card a-fade-up"
        style={{ borderRadius: '26px 26px 0 0' }}
      >
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface/90 backdrop-blur-md">
          {step === 'garden' ? (
            <button
              onClick={() => setStep('location')}
              className="p-1.5 rounded-full text-muted"
              aria-label="برگشت"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}
            >
              <Clapperboard className="w-4.5 h-4.5" />
            </span>
          )}
          <h2 className="flex-1 font-extrabold text-[15px]">
            {step === 'location' ? 'الان کجای مراسمی؟' : 'کدوم مرحله باغ عمارت؟'}
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-full text-muted" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </header>

        {step === 'location' && (
          <div className="p-4 grid grid-cols-2 gap-2.5">
            {LOCATIONS.map((l) => (
              <button
                key={l.key}
                onClick={() => pickLocation(l.key)}
                className="card card-hover relative overflow-hidden p-3.5 text-right h-20 flex flex-col justify-between"
              >
                <img
                  src={l.cover}
                  alt={l.key}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in srgb, ${l.colors[0]} 60%, transparent), rgba(6,5,10,.55))`,
                  }}
                />
                <span
                  className="relative w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(8,6,14,.32)' }}
                >
                  <l.icon className="w-3.5 h-3.5" style={{ color: '#FFF8EC' }} />
                </span>
                <span className="relative font-extrabold text-[12px]" style={{ color: '#FFF8EC' }}>
                  {l.key}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 'garden' && location && (
          <div className="p-4 space-y-2">
            <p className="text-[11px] text-muted leading-relaxed pb-1">
              با انتخاب مرحله، صف ژست همون بخش (از یخ‌شکن تا صمیمی) آماده می‌شه.
            </p>
            <button
              onClick={() => onStart(location, 'همه')}
              className="btn btn-primary w-full !justify-between !py-3"
            >
              <span>همه مراحل، پشت سر هم</span>
              <Clapperboard className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {GARDEN_SUB_CATEGORIES.map((g) => (
                <button
                  key={g}
                  onClick={() => onStart(location, g)}
                  className="btn btn-ghost w-full !justify-start"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
