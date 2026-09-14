import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

/** نشان برنامه: قاب ویوفایندر + زوج داخل کادر */
export const LogoMark: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="کارگردان ژست"
    >
      <defs>
        <linearGradient id={`g1${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFDCA6" />
          <stop offset=".5" stopColor="#F0B357" />
          <stop offset="1" stopColor="#E08A4E" />
        </linearGradient>
        <linearGradient id={`g2${uid}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFC9C0" />
          <stop offset="1" stopColor="#E4715B" />
        </linearGradient>
      </defs>

      <g
        fill="none"
        stroke={`url(#g1${uid})`}
        strokeWidth={24}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.92}
      >
        <path d="M104 182V132a28 28 0 0 1 28-28h50" />
        <path d="M408 182V132a28 28 0 0 0-28-28h-50" />
        <path d="M104 330v50a28 28 0 0 0 28 28h50" />
        <path d="M408 330v50a28 28 0 0 1-28 28h-50" />
      </g>
      <circle cx={256} cy={122} r={10} fill="#FFE9C7" />

      <circle cx={210} cy={188} r={25} fill={`url(#g1${uid})`} />
      <g fill="none" stroke={`url(#g1${uid})`} strokeWidth={21} strokeLinecap="round">
        <path d="M210 216v84" />
        <path d="M210 300l-16 72" />
        <path d="M210 300l17 72" />
        <path d="M210 240l50 20" />
      </g>

      <circle cx={306} cy={200} r={22} fill={`url(#g2${uid})`} />
      <g fill="none" stroke={`url(#g2${uid})`} strokeWidth={20} strokeLinecap="round">
        <path d="M306 226v56" />
        <path d="M306 250l-48 12" />
      </g>
      <path d="M306 274l-40 96q40 14 80 0z" fill={`url(#g2${uid})`} />
    </svg>
  );
};

export const LogoLockup: React.FC<{ size?: number; subtitle?: boolean }> = ({
  size = 38,
  subtitle = true,
}) => (
  <div className="flex items-center gap-2.5">
    <LogoMark size={size} />
    <div className="text-right leading-tight">
      <div className="font-extrabold text-[15px] gold-text">کارگردان ژست</div>
      {subtitle && (
        <div className="text-[10px] text-muted tracking-wide">POSE DIRECTOR</div>
      )}
    </div>
  </div>
);
