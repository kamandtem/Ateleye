import React, { useRef, useState } from 'react';
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
  ImagePlus,
  LibraryBig,
  Upload,
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

const readGalleryImage = (file: File): Promise<{ name: string; dataUrl: string }> => new Promise((resolve, reject) => {
  const fallback = () => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name.replace(/\.[^/.]+$/, '') || 'ژست گالری', dataUrl: String(reader.result) });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  };
  if (file.size > 15 * 1024 * 1024) { reject(new Error('large')); return; }
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    try {
      const max = 1600;
      const scale = Math.min(1, max / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
      canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/webp', 0.8);
      URL.revokeObjectURL(url);
      resolve({ name: file.name.replace(/\.[^/.]+$/, '') || 'ژست گالری', dataUrl: dataUrl.length > 100 ? dataUrl : '' });
    } catch { URL.revokeObjectURL(url); fallback(); }
  };
  image.onerror = () => { URL.revokeObjectURL(url); fallback(); };
  image.src = url;
});

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
  const [sub, setSub] = useState<SubTab>('favorites');
  const [projects, setProjects] = useState<ShootProject[]>(getProjects());
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{ open: boolean; editing?: ShootProject }>({ open: false });
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [pickingPose, setPickingPose] = useState(false);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  const galleryItems = openProject?.galleryItems || [];
  const completedGalleryIds = openProject?.completedGalleryIds || [];
  const completedPoseIds = openProject?.completedPoseIds || [];
  const toggleGalleryItem = (itemId: string) => {
    if (!openProject) return;
    const next = completedGalleryIds.includes(itemId) ? completedGalleryIds.filter(id => id !== itemId) : [...completedGalleryIds, itemId];
    saveProject({ ...openProject, completedGalleryIds: next });
    refreshProjects();
  };

  const handleGalleryFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!openProject) return;
    const files = Array.from(event.target.files || []).filter(file => file.type.startsWith('image/')).slice(0, 30);
    if (!files.length) return;
    setGalleryError(null);
    Promise.all(files.map(readGalleryImage)).then(items => {
      const added = items.map((item, index) => ({ id: `gallery-${Date.now()}-${index}`, name: item.name, dataUrl: item.dataUrl, addedAt: Date.now() }));
      const saved = saveProject({ ...openProject, galleryItems: [...galleryItems, ...added] });
      if (saved) {
        setSourcePickerOpen(false);
        refreshProjects();
      }
      else { setGalleryError('حافظه دستگاه برای ذخیره این عکس‌ها کافی نیست. عکس‌های کم‌حجم‌تر انتخاب کن.'); setSourcePickerOpen(false); }
      event.target.value = '';
    }).catch(() => setGalleryError('خواندن عکس‌های گالری انجام نشد. دوباره تلاش کن.'));
  };

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

        <button onClick={() => setSourcePickerOpen(true)} className="btn btn-primary w-full">
          <Plus className="w-4 h-4" /> افزودن ژست به شات‌لیست
        </button>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFiles} />
        {galleryError && <p className="text-[11px] text-rose bg-[color-mix(in_srgb,var(--color-rose)_10%,transparent)] rounded-xl p-3">{galleryError}</p>}
        {sourcePickerOpen && <div className="card p-3 space-y-2 a-fade">
          <div className="flex items-center justify-between"><b className="text-[13px]">منبع ژست را انتخاب کن</b><button onClick={() => setSourcePickerOpen(false)} className="p-1 text-muted"><X className="w-4 h-4" /></button></div>
          <button onClick={() => { setSourcePickerOpen(false); setPickingPose(true); }} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-line text-right"><span className="w-10 h-10 rounded-xl grid place-items-center bg-surface2 text-gold"><LibraryBig className="w-5 h-5" /></span><span><b className="block text-[12px]">انتخاب از ژست‌های برنامه</b><small className="text-[10px] text-muted">از کتابخانه داخلی انتخاب کن</small></span></button>
          <button onClick={() => galleryInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 rounded-2xl border border-line text-right"><span className="w-10 h-10 rounded-xl grid place-items-center bg-surface2 text-gold"><Upload className="w-5 h-5" /></span><span><b className="block text-[12px]">انتخاب از گالری</b><small className="text-[10px] text-muted">یک یا چند عکس از گوشی</small></span></button>
        </div>}

        {openProjectPoses.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="هنوز ژستی به این پروژه اضافه نشده"
            text="ژست‌ها حذف نمی‌شوند؛ با «انجام شد» به پایین صف می‌روند و هر زمان بخواهی دوباره قابل بازیابی‌اند."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {openProjectPoses.map((p) => {
              const done = completedPoseIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(p)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(p); }}
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
                </div>
              );
            })}
          </div>
        )}

        {galleryItems.length > 0 && <section className="space-y-2">
          <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-[12.5px] font-extrabold text-muted"><ImagePlus className="w-4 h-4 text-gold" /> ژست‌های گالری <span className="pill !text-[10px] !py-0.5">{galleryItems.length}</span></h3><span className="text-[10px] text-faint">تا حذف پروژه باقی می‌ماند</span></div>
          <div className="grid grid-cols-2 gap-3">{galleryItems.map(item => { const done = completedGalleryIds.includes(item.id); return <div key={item.id} className="card p-2 overflow-hidden"><button onClick={() => toggleGalleryItem(item.id)} className="w-full text-right"><div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface2 relative"><img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />{done && <span className="absolute inset-0 grid place-items-center bg-[color-mix(in_srgb,var(--color-olive)_62%,transparent)] text-paper"><CheckCircle2 className="w-7 h-7" /></span>}</div><b className={`block text-[11px] mt-2 line-clamp-1 ${done ? 'line-through text-muted' : ''}`}>{item.name}</b><small className="text-[10px] text-muted">{done ? 'انجام شده، برای بازیابی لمس کن' : 'برای علامت‌گذاری لمس کن'}</small></button></div>; })}</div>
        </section>}

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
      <SectionGuide section="favorites-v2" title="شات‌لیست‌ها" text="ژست‌های الهام‌بخش را ذخیره کن یا برای هر زوج یک لیست اجرایی جدا بساز." />

      <div className="card p-1.5 flex items-center gap-1.5">
        <SubTabBtn active={sub === 'projects'} onClick={() => setSub('projects')} icon={CalendarDays} label="شات‌لیست پروژه" />
        <SubTabBtn active={sub === 'favorites'} onClick={() => setSub('favorites')} icon={Heart} label="ذخیره‌شده‌ها" />
      </div>

      {sub === 'favorites' ? (
        <>
          <div className="card p-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-extrabold text-[15px]">
                <Heart className="w-4 h-4" style={{ color: 'var(--color-rose)' }} fill="currentColor" />
                ذخیره‌شده‌ها
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
              شات‌لیست‌های پروژه
            </h2>
            <button onClick={() => setDialogState({ open: true })} className="btn btn-primary !py-2 !px-3 !text-[11px]">
              <Plus className="w-3.5 h-3.5" />
              شات‌لیست جدید
            </button>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="هنوز شات‌لیستی نساخته‌ای"
              text="برای هر زوج یک شات‌لیست بساز و ژست‌های روز پروژه را از قبل مرتب کن."
              action={{ label: 'ساخت شات‌لیست', onClick: () => setDialogState({ open: true }) }}
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
      background: active ? 'var(--color-olive)' : 'transparent',
      color: active ? 'var(--color-paper)' : 'var(--color-muted)',
    }}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);
