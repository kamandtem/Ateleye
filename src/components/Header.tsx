import React from 'react';
import { Menu, Plus, Camera } from 'lucide-react';

interface Props {
  onOpenMenu: () => void;
  onOpenAddPose: () => void;
}

export const Header: React.FC<Props> = ({ onOpenMenu, onOpenAddPose }) => (
  <header
    className="sticky top-0 z-40 safe-top border-b border-line"
    style={{
      background: 'color-mix(in srgb, var(--color-bg) 82%, transparent)',
      backdropFilter: 'blur(14px)',
    }}
  >
    <div className="max-w-3xl mx-auto px-3 h-[62px] flex items-center justify-between gap-2">
      <button onClick={onOpenMenu} className="p-2 rounded-2xl active:scale-95 transition-transform" aria-label="باز کردن منو">
        <Menu className="w-6 h-6 text-gold" />
      </button>

      <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-extrabold text-gold whitespace-nowrap">
        کارگردان ژست
      </h1>

      <div className="flex items-center gap-1.5 mr-auto">
        <button onClick={onOpenAddPose} className="btn btn-primary !px-3 !py-2" aria-label="افزودن ژست جدید">
          <Plus className="w-4 h-4" />
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">ژست</span>
        </button>
      </div>
    </div>
  </header>
);
