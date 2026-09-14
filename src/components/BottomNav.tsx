import React from 'react';
import { Home, LayoutGrid, MapPin, Heart, Pencil } from 'lucide-react';
import { ViewTab } from '../types/pose';

interface Props {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  favoritesCount: number;
  onOpenOffice: () => void;
}

const ITEMS: { tab: ViewTab; icon: React.ElementType; label: string }[] = [
  { tab: 'home', icon: Home, label: 'خانه' },
  { tab: 'library', icon: LayoutGrid, label: 'ژست‌ها' },
  { tab: 'locations', icon: MapPin, label: 'لوکیشن' },
  { tab: 'favorites', icon: Heart, label: 'شات‌لیست' },
];

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onTabChange,
  favoritesCount,
  onOpenOffice,
}) => (
  <nav className="fixed bottom-3 left-3 right-3 z-40 safe-bottom">
    <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
      {/* Office button - isolated on left */}
      <button
        onClick={onOpenOffice}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform shrink-0"
        style={{ background: 'var(--color-gold)', color: '#241B0C' }}
        aria-label="دفتر آتلیه"
        title="دفتر آتلیه"
      >
        <Pencil className="w-6 h-6" />
      </button>

      {/* Navigation bar */}
      <div className="relative flex-1 h-[68px] px-3 flex items-center justify-between rounded-[30px] border border-line bg-surface shadow-xl">
        {ITEMS.map((it) => (
          <NavBtn
            key={it.tab}
            {...it}
            active={activeTab === it.tab}
            badge={it.tab === 'favorites' ? favoritesCount : undefined}
            onClick={() => onTabChange(it.tab)}
          />
        ))}
      </div>
    </div>
  </nav>
);

const NavBtn: React.FC<{
  icon: React.ElementType;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}> = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors"
    style={{ color: active ? 'var(--color-gold)' : 'var(--color-faint)' }}
  >
    <span className="relative">
      <Icon className="w-5 h-5" style={{ transform: active ? 'scale(1.1)' : 'none' }} />
      {typeof badge === 'number' && badge > 0 && (
        <span
          className="absolute -top-1.5 -left-2 min-w-[16px] text-center text-[9px] font-extrabold rounded-full px-1"
          style={{ background: 'var(--color-rose)', color: '#fff' }}
        >
          {badge}
        </span>
      )}
    </span>
    <span className="text-[10px] font-semibold">{label}</span>
  </button>
);
