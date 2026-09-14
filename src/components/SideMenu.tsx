import React, { useEffect, useRef } from 'react';
import {
  Home,
  Briefcase,
  LayoutGrid,
  MapPin,
  MapPinned,
  CloudSun,
  Heart,
  FolderHeart,
  PlusCircle,
  BookOpen,
  Settings,
  UserRound,
  Moon,
  Sun,
  X,
  ChevronLeft,
  ClipboardCheck,
  Phone,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { StudioProfile, ViewTab } from '../types/pose';

interface Props {
  open: boolean;
  onClose: () => void;
  activeTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
  onOpenAddPose: () => void;
  onOpenStudioProfile: () => void;
  onOpenChecklist: () => void;
  profile: StudioProfile | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  counts: { total: number; favorites: number; mine: number };
}

export const SideMenu: React.FC<Props> = ({
  open,
  onClose,
  activeTab,
  onNavigate,
  onOpenAddPose,
  onOpenStudioProfile,
  onOpenChecklist,
  profile,
  theme,
  onToggleTheme,
  counts,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const touchStart = useRef<number | null>(null);
  if (!open) return null;

  const go = (tab: ViewTab) => {
    onNavigate(tab);
    onClose();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (profile) {
          try {
            const updated = { ...profile, logo: dataUrl, updatedAt: Date.now() };
            localStorage.setItem('studioProfile', JSON.stringify(updated));
            window.location.reload();
          } catch (e) {
            console.error('Error saving profile image:', e);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const items: {
    tab?: ViewTab;
    icon: React.ElementType;
    label: string;
    badge?: number;
    action?: () => void;
    accent?: boolean;
  }[] = [
    { tab: 'office', icon: Briefcase, label: 'دفتر آتلیه' },
    { tab: 'home', icon: Home, label: 'خانه' },
    { tab: 'library', icon: LayoutGrid, label: 'کتابخانه ژست‌ها', badge: counts.total },
    { tab: 'principles', icon: BookOpen, label: 'اصول ژست‌دهی' },
    { tab: 'myposes', icon: FolderHeart, label: 'ژست‌های من', badge: counts.mine },
    { tab: 'mylocations', icon: MapPinned, label: 'لوکیشن‌های من' },
    { tab: 'weather', icon: CloudSun, label: 'آب‌وهوا و نور' },
    { icon: ClipboardCheck, label: 'چک‌لیست وسایل', action: () => { onOpenChecklist(); onClose(); } },
  ];

  return (
    <>
      {/* پرده پشت منو */}
      <div
        className="fixed inset-0 z-[70] a-fade"
        style={{ background: 'rgba(4,3,8,.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden
      />

      {/* پنل شناور سمت راست */}
      <aside
        className="fixed z-[71] a-slide-right card overflow-y-auto no-scrollbar shadow-2xl"
        style={{
          top: 'calc(10px + env(safe-area-inset-top, 0px))',
          bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          right: '12px',
          width: 'min(78vw, 296px)',
          borderRadius: '22px',
        }}
        role="dialog"
        aria-label="منوی برنامه"
        onTouchStart={(e) => { touchStart.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          const end = e.changedTouches[0]?.clientX;
          touchStart.current = null;
          if (start !== null && end !== undefined && end - start > 70) onClose();
        }}
      >
        {/* Profile Section */}
        <div className="sticky top-0 z-10 px-4 py-4 space-y-3 border-b border-line bg-surface">
          <div className="space-y-2">
            <label
              htmlFor="profile-image-input"
              className="block w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-surface2 border-2 border-gold cursor-pointer hover:opacity-80 transition-opacity mx-auto"
              title="لمس برای تغییر تصویر"
            >
              {profile?.logo ? (
                <img src={profile.logo} alt="تصویر پروفایل" className="w-full h-full object-cover" />
              ) : (
                <UserRound className="w-8 h-8 text-gold" />
              )}
            </label>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ display: 'none' }}
              aria-label="انتخاب عکس پروفایل"
            />
            <p className="text-[10px] text-muted text-center">لمس برای تغییر</p>
          </div>
          <div className="text-center">
            <span className="text-[10px] text-muted">خوش آمدی</span>
            <b className="block text-[14px]">{profile?.name || 'کاربر'}</b>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenStudioProfile}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-line text-[11px] font-bold"
              title="ویرایش پروفایل"
            >
              <UserRound className="w-4 h-4" />
              پروفایل
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="w-10 h-10 rounded-xl border border-line flex items-center justify-center"
              title="تنظیمات"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-xl border border-line flex items-center justify-center"
              title="تغییر تم"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-gold" />}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2.5 space-y-1">
          {items.map((it, idx) => {
            const active = it.tab && activeTab === it.tab;
            const Icon = it.icon;
            return (
              <button
                key={idx}
                onClick={() => (it.action ? it.action() : it.tab && go(it.tab))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors text-right"
                style={{
                  background: active
                    ? 'color-mix(in srgb, var(--color-gold) 16%, transparent)'
                    : 'transparent',
                  border: active
                    ? '1px solid color-mix(in srgb, var(--color-gold) 45%, transparent)'
                    : '1px solid transparent',
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: it.accent || active ? 'var(--color-gold)' : 'var(--color-muted)' }}
                />
                <span
                  className="flex-1 text-[13px] font-semibold"
                  style={{ color: active ? 'var(--color-ink)' : 'var(--color-ink)' }}
                >
                  {it.label}
                </span>
                {typeof it.badge === 'number' && it.badge > 0 && (
                  <span className="pill text-[10px] px-2 py-0.5">{it.badge}</span>
                )}
                <ChevronLeft className="w-3.5 h-3.5 text-faint" />
              </button>
            );
          })}
        </nav>

        {/* Developer Contact Section */}
        <div className="px-3 pb-4 pt-4 space-y-3 border-t border-line">
          <div className="space-y-2">
            <p className="text-[10px] text-muted text-center font-bold">برنامه‌نویس</p>
            <p className="text-[13px] font-bold text-center">محمدرضا ارجمند</p>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <a
              href="tel:+989164573083"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line text-[11px] font-bold hover:bg-surface2 transition-colors"
              title="تماس"
            >
              <Phone className="w-4 h-4" />
              تماس
            </a>
            <a
              href="sms:+989164573083"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line text-[11px] font-bold hover:bg-surface2 transition-colors"
              title="پیامک"
            >
              <MessageSquare className="w-4 h-4" />
              پیامک
            </a>
          </div>
          <p className="text-[10px] text-muted text-center">09164573083</p>
        </div>
      </aside>
    </>
  );
};
