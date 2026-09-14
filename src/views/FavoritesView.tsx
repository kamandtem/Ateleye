import React, { useState } from 'react';
import {
  Heart,
  CalendarDays,
  Plus,
  Trash2,
  Pencil,
  ChevronRight,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Pose, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { PoseVisual } from '../components/PoseVisual';
import { EmptyState } from '../components/EmptyState';
import { SectionGuide } from '../components/SectionGuide';
import { ConfirmDialog, ConfirmRequest } from '../components/ConfirmDialog';
import { ProjectDialog, ProjectDialogResult } from '../components/ProjectDialog';
import { isoToJalaliLabel } from '../services/jalali';
import { ShootProject, deleteProject, getProjects, saveProject } from '../services/storage';

interface Props {
  poses: Pose[];
  favoriteIds: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (p: Pose) => void;
  onDelete: (p: Pose) => void;
  onAddToProject: (p: Pose) => void;
  onTab: (t: ViewTab) => void;
}

type SubTab = 'favorites' | 'projects';

export const FavoritesView: React.FC<Props> = ({
  poses,
  favoriteIds,
  onToggleFavorite,
  onSelect,
  onDelete,
  onAddToProject,
  onTab,
}) => {
  const [sub, setSub] = useState<SubTab>('projects');
  const [projects, setProjects] = useState<ShootProject[]>(getProjects());
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{ open: boolean; editing?: ShootProject }>({ open: false });
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [pickingPose, setPickingPose] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  const refreshProjects = () => setProjects(getProjects());

  const list = favoriteIds
    .map((id) => poses.find((p) => p.id === id))
    .filter(Boolean) as Pose[];

  const grouped = list.reduce<Record<string, Pose[]>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  const saveNewOrEdited = (result: ProjectDialogResult) => {
    if (dialogState.editing) {
      saveProject({ ...dialogState.editing, name: result.name, date: result.date });
    } else {
      saveProject({ id: `project-${Date.now()}`, name: result.name, date: result.date, poseIds: [], createdAt: Date.now() });
    }
    setDialogState({ open: false });
    refreshProjects();
  };

  const askDeleteProject = (project: ShootProject) => {
    setConfirm({
      title: 'حذف پروژه روز',
      text: `پروژه «${project.name}» حذف شود؟ این کار برگشت‌پذیر نیست.`,
      confirmLabel: 'حذف پروژه',
      tone: 'danger',
      icon: Trash2,
      onConfirm: () => {
        deleteProject(project.id);
        if (openProjectId === project.id) setOpenProjectId(null);
        refreshProjects();
      },
    });
  };

  const openProject = projects.find((p) => p.id === openProjectId) || null;
  const openProjectPoses = openProject
    ? (openProject.poseIds.map((id) => poses.find((p) => p.id === id)).filter(Boolean) as Pose[])
    : [];

  const completedPoseIds = openProject?.completedPoseIds || [];
  const toggleProjectPose = (poseId: string) => {
    if (!openProject) return;
    const next = completedPoseIds.includes(poseId)
      ? completedPoseIds.filter((id) => id !== poseId)
      : [...completedPoseIds, poseId];
    saveProject({ ...openProject, completedPoseIds: next });
    refreshProjects();
  };

  const pickerResults = poses.filter((p) => {
    if (!pickerSearch.trim()) return true;
    return p.title.includes(pickerSearch.trim()) || p.tags.some((t) => t.includes(pickerSearch.trim()));
  });

  const addPoseToOpenProject = (pose: Pose) => {
    if (!openProject) return;
    saveProject({ ...openProject, poseIds: Array.from(new Set([...openProject.poseIds, pose.id])) });
    refreshProjects();
  };
  const removePoseFromOpenProject = (pose: Pose) => {
    if (!openProject) return;
    saveProject({ ...openProject, poseIds: openProject.poseIds.filter((id) => id !== pose.id) });
    refreshProjects();
  };

  // ---------- نمای جزئیات یک پروژه روز ----------
  if (openProject) {
    return (
      <div className="space-y-4">
        <button onClick={() => setOpenProjectId(null)} className="flex items-center gap-1.5 text-[12px] font-bold text-gold">
          <ChevronRight className="w-4 h-4" />
          بازگشت به پروژه‌های روز
        </button>

        <div className="card p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}
            >
              <CalendarDays className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[15px] line-clamp-1">{openProject.name}</h2>
              <p className="text-[11px] text-muted mt-0.5">
                {isoToJalaliLabel(openProject.date)} · {openProjectPoses.length} ژست
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setDialogState({ open: true, editing: openProject })}
              className="p-2 rounded-xl text-muted"
              aria-label="ویرایش پروژه"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => askDeleteProject(openProject)}
              className="p-2 rounded-xl"
              style={{ color: 'var(--color-rose)' }}
              aria-label="حذف پروژه"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button onClick={() => setPickingPose(true)} className="btn btn-primary w-full">
          <Plus className="w-4 h-4" />
          افزودن ژست به این پروژه
        </button>

        {openProjectPoses.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="هنوز ژستی به این پروژه اضافه نشده"
            text="با دکمه «افزودن ژست»، ژست‌های این روز را جمع کن تا سر صحنه فقط همان‌ها را اجرا کنی."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {openProjectPoses.map((p) => {
              const done = completedPoseIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="card p-3 space-y-2 text-right overflow-hidden"
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-surface2">
                    <PoseVisual pose={p} />
                  </div>
                  <div>
                    <p className={`text-[11px] font-bold line-clamp-2 ${done ? 'line-through text-muted' : ''}`}>
                      {p.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePoseFromOpenProject(p);
                      }}
                      className="p-1 text-rose rounded-lg"
                      aria-label="حذف"
                      title="حذف از پروژه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProjectPose(p.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                      style={{ 
                        background: done ? 'var(--color-teal)' : 'color-mix(in srgb, var(--color-gold) 16%, transparent)',
                        color: done ? '#fff' : 'var(--color-gold)',
                        border: done ? '1px solid var(--color-teal)' : '1px solid var(--color-gold)',
                      }}
                      aria-label="تکمیل"
                    >
                      {done ? '✓ شده' : 'انجام شد'}
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {pickingPose && (
          <div className="fixed inset-0 z-[105] flex items-end sm:items-center justify-center p-3" dir="rtl">
            <div className="absolute inset-0" style={{ background: 'rgba(4,3,8,.68)', backdropFilter: 'blur(3px)' }} onClick={() => setPickingPose(false)} />
            <section className="relative w-full sm:max-w-sm max-h-[80vh] overflow-y-auto no-scrollbar card a-fade-up" style={{ borderRadius: '26px 26px 0 0' }}>
              <header className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 border-b border-line bg-surface/90 backdrop-blur-md">
                <Search className="w-4 h-4 text-faint shrink-0" />
                <input
                  autoFocus
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="جستجوی ژست..."
                  className="field flex-1 !py-2"
                />
                <button onClick={() => setPickingPose(false)} className="p-1.5 rounded-full text-muted shrink-0" aria-label="بستن">
                  <X className="w-5 h-5" />
                </button>
              </header>
              <div className="p-3 space-y-1.5">
                {pickerResults.map((p) => {
                  const already = openProject.poseIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => !already && addPoseToOpenProject(p)}
                      disabled={already}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl border text-right"
                      style={{
                        borderColor: already ? 'var(--color-teal)' : 'var(--color-line)',
                        background: already ? 'color-mix(in srgb, var(--color-teal) 10%, transparent)' : 'transparent',
                      }}
                    >
                      <span className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface2">
                        <PoseVisual pose={p} />
                      </span>
                      <span className="flex-1 text-[12px] font-semibold line-clamp-2">{p.title}</span>
                      {already ? (
                        <span className="text-[10px] text-teal shrink-0">اضافه شده</span>
                      ) : (
                        <Plus className="w-4 h-4 text-gold shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        <ProjectDialog
          open={dialogState.open}
          initialName={dialogState.editing?.name}
          initialDateIso={dialogState.editing?.date}
          onCancel={() => setDialogState({ open: false })}
          onConfirm={saveNewOrEdited}
        />
        <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
      </div>
    );
  }

  // ---------- نمای اصلی: نشان‌شده‌ها ----------
  return (
    <div className="space-y-4">
      <SectionGuide section="favorites" title="نشان‌شده‌ها" text="در «علاقه‌مندی‌ها» ژست‌های موردعلاقه‌ات را نگه دار؛ در «پروژه روز» ژست‌های هر عروسی را جدا کن." />

      <div className="card p-1.5 flex items-center gap-1.5">
        <SubTabBtn active={sub === 'favorites'} onClick={() => setSub('favorites')} icon={Heart} label="علاقه‌مندی‌ها" />
        <SubTabBtn active={sub === 'projects'} onClick={() => setSub('projects')} icon={CalendarDays} label="پروژه روز" />
      </div>

      {sub === 'favorites' ? (
        <>
          <div className="card p-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-extrabold text-[15px]">
                <Heart className="w-4 h-4" style={{ color: 'var(--color-rose)' }} fill="currentColor" />
                علاقه‌مندی‌ها
              </h2>
              <p className="text-[11px] text-muted mt-1">{list.length} ژست نشان‌شده</p>
            </div>

          </div>

          {list.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="هنوز ژستی نشان نکردی"
              text="قبل از پروژه، ژست‌هایی که می‌خواهی اجرا کنی را نشان کن تا سر صحنه سریع پیدایشان کنی."
              action={{ label: 'رفتن به کتابخانه ژست‌ها', onClick: () => onTab('library') }}
            />
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([category, items]) => (
                <section key={category} className="space-y-2.5">
                  <h3 className="flex items-center gap-2 text-[12.5px] font-extrabold text-muted">
                    {category}
                    <span className="pill !text-[10px] !py-0.5">{items.length}</span>
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((p) => (
                      <PoseCard
                        key={p.id}
                        pose={p}
                        isFavorite
                        onToggleFavorite={onToggleFavorite}
                        onSelect={onSelect}
                        onDelete={onDelete}
                        onAddToProject={onAddToProject}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-extrabold text-[15px]">
              <CalendarDays className="w-4 h-4 text-gold" />
              پروژه‌های روز
            </h2>
            <button onClick={() => setDialogState({ open: true })} className="btn btn-primary !py-2 !px-3 !text-[11px]">
              <Plus className="w-3.5 h-3.5" />
              پروژه جدید
            </button>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="هنوز پروژه روزی نساخته‌ای"
              text="برای هر عروسی یک پروژه بساز، تاریخش را روی تقویم شمسی مشخص کن و ژست‌های همان روز را جمع کن."
              action={{ label: 'پروژه روز جدید', onClick: () => setDialogState({ open: true }) }}
            />
          ) : (
            <div className="space-y-2.5">
              {projects.map((project) => {
                const projectPoses = project.poseIds.length;
                return (
                  <button
                    key={project.id}
                    onClick={() => setOpenProjectId(project.id)}
                    className="w-full card card-hover p-4 flex items-center gap-3 text-right"
                  >
                    <span
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}
                    >
                      <CalendarDays className="w-5 h-5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <b className="block text-[13px] line-clamp-1">{project.name}</b>
                      <span className="text-[10px] text-muted">
                        {isoToJalaliLabel(project.date)} · {projectPoses} ژست
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-faint rotate-180 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      <ProjectDialog
        open={dialogState.open}
        initialName={dialogState.editing?.name}
        initialDateIso={dialogState.editing?.date}
        onCancel={() => setDialogState({ open: false })}
        onConfirm={saveNewOrEdited}
      />
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

const SubTabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ElementType; label: string }> = ({
  active,
  onClick,
  icon: Icon,
  label,
}) => (
  <button
    onClick={onClick}
    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[12px] font-bold transition-colors"
    style={{
      background: active ? 'linear-gradient(120deg, var(--color-gold2), var(--color-gold))' : 'transparent',
      color: active ? '#241B0C' : 'var(--color-muted)',
    }}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);
