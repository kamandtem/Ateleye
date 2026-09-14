import React, { useState } from 'react';
import { ChevronLeft, Check, Clapperboard, Mic, Map, PlusCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LogoMark } from './Logo';

const SLIDES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Clapperboard,
    title: 'کارگردان ژست',
    text: 'وسط پروژه عکاسی، دیگر لازم نیست دنبال ایده بگردید. ۱۲۰ ژست آماده با مراحل اجرا، فرم بدن و دیالوگ دقیق برای هدایت سوژه.',
  },
  {
    icon: Mic,
    title: 'چی به سوژه بگم؟',
    text: 'برای هر ژست، جمله‌های آماده‌ای داریم که مستقیم به عروس و داماد می‌گویید. حتی می‌توانید صوتش را پخش کنید.',
  },
  {
    icon: Map,
    title: 'بر اساس لوکیشن',
    text: 'جنوب، شمال، کویر و باغ عمارت. برای هر لوکیشن راهنمای نور، بهترین ساعت، استایل لباس و تجهیزات پیشنهادی آماده است.',
  },
  {
    icon: PlusCircle,
    title: 'ژست‌های خودتان',
    text: 'هر ژستی که جایی دیدید و پسندیدید را با عکس و مراحل اجرا ذخیره کنید. با تگ‌گذاری، هر وقت خواستید سریع پیدایش می‌کنید.',
  },
];

export const Onboarding: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];

  return (
    <div className="fixed inset-0 z-[95] bg-bg flex flex-col safe-top safe-bottom">
      <div className="flex items-center justify-between px-5 pt-4">
        <LogoMark size={34} />
        <button onClick={onDone} className="text-[11px] font-bold text-faint">
          رد کردن
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-7 text-center">
        <div
          key={i}
          className="a-pop w-24 h-24 rounded-3xl flex items-center justify-center mb-7"
          style={{
            background: 'color-mix(in srgb, var(--color-gold) 14%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-gold) 35%, transparent)',
            color: 'var(--color-gold)',
          }}
        >
          <s.icon className="w-11 h-11" />
        </div>

        <h2 key={`t${i}`} className="a-fade-up text-2xl font-extrabold gold-text">
          {s.title}
        </h2>
        <p
          key={`p${i}`}
          className="a-fade-up mt-3 text-[13px] leading-7 text-muted max-w-sm"
          style={{ animationDelay: '.08s' }}
        >
          {s.text}
        </p>
      </div>

      <div className="px-6 pb-8 space-y-5">
        <div className="flex items-center justify-center gap-1.5">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? '22px' : '6px',
                background: idx === i ? 'var(--color-gold)' : 'var(--color-line)',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => (last ? onDone() : setI(i + 1))}
          className="btn btn-primary w-full !py-3.5 !text-sm"
        >
          {last ? <Check className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {last ? 'شروع کار' : 'بعدی'}
        </button>
      </div>
    </div>
  );
};
