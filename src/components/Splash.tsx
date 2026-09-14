import React from 'react';
import { LogoMark } from './Logo';

/** اسپلش اسکرین برنامه؛ حدود ۱.۶ ثانیه پیش از ورود نمایش داده می‌شود */
export const Splash: React.FC<{ leaving?: boolean }> = ({ leaving }) => (
  <div
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg transition-opacity duration-500"
    style={{ opacity: leaving ? 0 : 1 }}
  >
    <div className="a-pop">
      <div className="relative">
        <div
          className="absolute inset-0 blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, var(--color-gold), transparent 65%)' }}
        />
        <LogoMark size={132} className="relative" />
      </div>
    </div>

    <div className="mt-7 text-center a-fade-up" style={{ animationDelay: '.15s' }}>
      <h1 className="text-2xl font-extrabold gold-text">کارگردان ژست</h1>
      <p className="mt-1 text-[11px] text-muted">دستیار حرفه‌ای هدایت ژست</p>
    </div>

    <div className="absolute bottom-14 w-40 h-1 rounded-full overflow-hidden bg-line">
      <div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, var(--color-gold2), var(--color-rose))',
          animation: 'pd-fade 1.4s ease both',
          width: '100%',
        }}
      />
    </div>

    <p className="absolute bottom-4 text-[10px] text-faint">برنامه‌نویس: محمدرضا ارجمند</p>
  </div>
);
