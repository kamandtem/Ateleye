import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { LogoMark } from './Logo';

interface Props { onOpenMenu: () => void; onOpenAddPose: () => void; }

export const Header: React.FC<Props> = ({ onOpenMenu, onOpenAddPose }) => (
  <header className="sticky top-0 z-40 safe-top app-header">
    <div className="max-w-3xl mx-auto px-4 h-[64px] flex items-center justify-between gap-2">
      <button onClick={onOpenMenu} className="icon-button" aria-label="باز کردن منو"><Menu className="w-5 h-5" /></button>
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap" dir="ltr">
        <LogoMark size={34} />
        <div className="text-left">
          <h1 className="text-[17px] leading-none font-black text-olive">Atelito</h1>
          <p className="mt-1 text-[9px] text-faint font-extrabold">آتلیه‌ی تو</p>
        </div>
      </div>
      <button onClick={onOpenAddPose} className="icon-button icon-button-accent mr-auto" aria-label="افزودن ژست جدید"><Plus className="w-4 h-4" /></button>
    </div>
  </header>
);
