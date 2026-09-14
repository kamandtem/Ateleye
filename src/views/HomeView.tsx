import React from 'react';
import { ArrowLeft, CalendarDays, Compass, Heart, LayoutGrid, PlusCircle } from 'lucide-react';
import { CategoryType, LocationType, MyLocation, Pose, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { WeatherCard } from '../components/WeatherCard';

interface Props {
  poses: Pose[]; favoriteIds: string[]; recentIds: string[]; onSelect: (p: Pose) => void; onDelete: (p: Pose) => void; onAddToProject: (p: Pose) => void; onToggleFavorite: (id: string, e: React.MouseEvent) => void; onOpenAddPose: () => void; onPickCategory: (c: CategoryType) => void; onPickLocation: (l: LocationType) => void; onTab: (t: ViewTab) => void; selectedLocation: MyLocation | null; onOpenWeather: () => void; onOpenMyLocations: () => void; onQuickStart: () => void;
}

export const HomeView: React.FC<Props> = ({ poses, favoriteIds, recentIds, onSelect, onDelete, onAddToProject, onToggleFavorite, onOpenAddPose, onTab, selectedLocation, onOpenWeather, onQuickStart }) => {
  const recents = recentIds.map((id) => poses.find((p) => p.id === id)).filter(Boolean).slice(0, 2) as Pose[];
  const favorites = poses.filter((p) => favoriteIds.includes(p.id)).slice(0, 2);
  return <div className="home-focus space-y-6">
    <WeatherCard selected={selectedLocation} onOpen={onOpenWeather} />

    <section className="quick-hero">
      <p>دستیار سر صحنه</p>
      <h1>الان کجای مراسمی؟</h1>
      <span>مرحله را بگو، ژست‌های مناسب را به ترتیب اجرا می‌چینیم.</span>
      <button onClick={onQuickStart}><Compass className="w-5 h-5" />شروع سریع<ArrowLeft className="w-4 h-4" /></button>
    </section>

    <section className="home-paths"><button onClick={() => onTab('library')}><LayoutGrid className="w-5 h-5" /><span><strong>پیدا کردن ژست</strong><small>جستجو و فیلتر دقیق</small></span><ArrowLeft className="w-4 h-4" /></button><button onClick={() => onTab('favorites')}><CalendarDays className="w-5 h-5" /><span><strong>شات‌لیست پروژه</strong><small>ژست‌های روز مراسم</small></span><ArrowLeft className="w-4 h-4" /></button><button onClick={onOpenAddPose}><PlusCircle className="w-5 h-5" /><span><strong>ثبت ژست خودم</strong><small>عکس و توضیح شخصی</small></span><ArrowLeft className="w-4 h-4" /></button></section>

    {recents.length > 0 && <PoseStrip title="ادامه بده" poses={recents} favoriteIds={favoriteIds} onSelect={onSelect} onDelete={onDelete} onAddToProject={onAddToProject} onToggleFavorite={onToggleFavorite} onMore={() => onTab('library')} />}
    {favorites.length > 0 && <PoseStrip title="نشان‌شده‌ها" poses={favorites} favoriteIds={favoriteIds} onSelect={onSelect} onDelete={onDelete} onAddToProject={onAddToProject} onToggleFavorite={onToggleFavorite} onMore={() => onTab('favorites')} />}
  </div>;
};

const PoseStrip = ({ title, poses, favoriteIds, onSelect, onDelete, onAddToProject, onToggleFavorite, onMore }: { title: string; poses: Pose[]; favoriteIds: string[]; onSelect: (p: Pose) => void; onDelete: (p: Pose) => void; onAddToProject: (p: Pose) => void; onToggleFavorite: (id: string, e: React.MouseEvent) => void; onMore: () => void }) => <section className="space-y-3"><header className="strip-head"><h2>{title}</h2><button onClick={onMore}>همه<ArrowLeft className="w-3.5 h-3.5" /></button></header><div className="grid grid-cols-2 gap-3">{poses.map((p) => <PoseCard key={p.id} pose={p} isFavorite={favoriteIds.includes(p.id)} onToggleFavorite={onToggleFavorite} onSelect={onSelect} onDelete={onDelete} onAddToProject={onAddToProject} compact />)}</div></section>;
