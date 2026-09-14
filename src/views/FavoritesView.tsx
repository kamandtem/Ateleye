import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, Film, Heart, ImagePlus, LayoutGrid, Pencil, Plus, Search, Sparkles, Trash2, Users, X } from 'lucide-react';
import { Pose, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { PoseVisual } from '../components/PoseVisual';
import { EmptyState } from '../components/EmptyState';
import { SectionGuide } from '../components/SectionGuide';
import { ConfirmDialog, ConfirmRequest } from '../components/ConfirmDialog';
import { ProjectDialog, ProjectDialogResult } from '../components/ProjectDialog';
import { isoToJalaliLabel } from '../services/jalali';
import { ShootProject, deleteProject, getProjects, saveCustomPose, saveProject } from '../services/storage';

interface Props { poses: Pose[]; favoriteIds: string[]; onToggleFavorite: (id: string, e: React.MouseEvent) => void; onSelect: (p: Pose) => void; onDelete: (p: Pose) => void; onAddToProject: (p: Pose) => void; onTab: (t: ViewTab) => void; }
type SubTab = 'favorites' | 'projects';
type Role = 'تکی عروس' | 'تکی داماد' | 'دونفره' | 'دیتیل';
const ROLES: Role[] = ['تکی عروس', 'تکی داماد', 'دونفره', 'دیتیل'];
const modeMeta = { 'عکاسی': { icon: Users, color: 'var(--color-gold)', hint: 'عکس‌های مرجع و ژست‌های برنامه' }, 'فیلم‌برداری': { icon: Film, color: 'var(--color-teal)', hint: 'پلان‌های قابل اجرا برای فیلم‌برداری' } } as const;

export const FavoritesView: React.FC<Props> = ({ poses, favoriteIds, onToggleFavorite, onSelect, onDelete, onAddToProject, onTab }) => {
  const [sub, setSub] = useState<SubTab>('projects');
  const [projects, setProjects] = useState<ShootProject[]>(getProjects());
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{ open: boolean; editing?: ShootProject }>({ open: false });
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [sourcePicker, setSourcePicker] = useState(false);
  const [appPicker, setAppPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role>('دونفره');
  const [galleryPoses, setGalleryPoses] = useState<Pose[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const refresh = () => setProjects(getProjects());
  const favorites = favoriteIds.map((id) => poses.find((p) => p.id === id)).filter(Boolean) as Pose[];
  const grouped = favorites.reduce<Record<string, Pose[]>>((acc, p) => ((acc[p.category] ||= []).push(p), acc), {});
  const openProject = projects.find((p) => p.id === openProjectId) || null;
  const projectPoses = openProject ? openProject.poseIds.map((id) => galleryPoses.find((p) => p.id === id) || poses.find((p) => p.id === id)).filter(Boolean) as Pose[] : [];
  const visibleAppPoses = useMemo(() => poses.filter((p) => !search.trim() || `${p.title} ${p.tags.join(' ')}`.includes(search.trim())), [poses, search]);

  const saveNewProject = (result: ProjectDialogResult) => {
    const project = dialogState.editing ? { ...dialogState.editing, name: result.name, date: result.date } : { id: `project-${Date.now()}`, name: result.name, date: result.date, poseIds: [], createdAt: Date.now(), mode: undefined };
    saveProject(project); refresh(); setDialogState({ open: false }); setOpenProjectId(project.id); setSourcePicker(true);
  };
  const removeProject = (project: ShootProject) => setConfirm({ title: 'حذف پروژه روز', text: `پروژه «${project.name}» حذف شود؟`, confirmLabel: 'حذف پروژه', tone: 'danger', icon: Trash2, onConfirm: () => { deleteProject(project.id); setOpenProjectId(null); refresh(); } });
  const addPose = (pose: Pose) => { if (!openProject) return; saveProject({ ...openProject, poseIds: Array.from(new Set([...openProject.poseIds, pose.id])) }); refresh(); setAppPicker(false); setSourcePicker(false); };
  const removePose = (pose: Pose) => { if (!openProject) return; saveProject({ ...openProject, poseIds: openProject.poseIds.filter((id) => id !== pose.id) }); refresh(); };
  const toggleDone = (pose: Pose) => { if (!openProject) return; const ids = openProject.completedPoseIds || []; saveProject({ ...openProject, completedPoseIds: ids.includes(pose.id) ? ids.filter((id) => id !== pose.id) : [...ids, pose.id] }); refresh(); };

  const importGallery = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!openProject) return;
    const created: Pose[] = [];
    for (const file of Array.from(event.target.files || [])) {
      const image = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      const now = Date.now();
      const pose: Pose = { id: `gallery-${now}-${Math.random().toString(36).slice(2)}`, title: file.name.replace(/\.[^.]+$/, '') || 'عکس مرجع', category: role === 'دونفره' ? 'عروس و داماد' : role === 'دیتیل' ? 'گروهی' : role === 'تکی عروس' ? 'عروس' : 'داماد', poseType: 'خلاقانه', difficulty: 'متوسط', peopleCount: role === 'دونفره' ? 2 : 1, locations: ['باغ عمارت'], art: 'silhouette', tags: ['گالری', role], image, steps: ['طبق عکس مرجع اجرا شود'], bodyPosition: 'مطابق عکس مرجع', handPosition: 'مطابق عکس مرجع', footPosition: 'مطابق عکس مرجع', headDirection: 'مطابق عکس مرجع', eyeDirection: 'مطابق عکس مرجع', photographerScript: ['با همین فرم اجرا کن'], commonMistakes: [], variations: [], cameraTips: { framing: 'مطابق عکس', cameraAngle: 'مطابق عکس', suggestedDistance: 'متوسط', lensSuggestion: '۵۰ میلی‌متر', lightTip: 'نور نرم' }, ease: 3, stage: 'گرم شدن', isCustom: true, createdAt: now };
      saveCustomPose(pose); created.push(pose);
    }
    if (created.length) { saveProject({ ...openProject, poseIds: [...openProject.poseIds, ...created.map((p) => p.id)] }); setGalleryPoses((current) => [...current, ...created]); refresh(); setSourcePicker(false); }
    event.currentTarget.value = '';
  };

  if (openProject) return <ProjectWorkspace project={openProject} poses={projectPoses} role={role} setRole={setRole} sourcePicker={sourcePicker} setSourcePicker={setSourcePicker} appPicker={appPicker} setAppPicker={setAppPicker} search={search} setSearch={setSearch} visibleAppPoses={visibleAppPoses} galleryInputRef={galleryInputRef} importGallery={importGallery} removeProject={removeProject} onBack={() => { setOpenProjectId(null); setSourcePicker(false); setAppPicker(false); }} onSelect={onSelect} onAddPose={addPose} onRemove={removePose} onToggleDone={toggleDone} />;

  return <div className="space-y-4"><SectionGuide section="favorites" title="شات‌لیست پروژه‌ها" text="برای هر روز، فقط چیزهایی را نگه دار که واقعاً قرار است سر پروژه اجرا کنی." /><div className="shot-tabs"><button className={sub === 'projects' ? 'is-on' : ''} onClick={() => setSub('projects')}><CalendarDays className="w-4 h-4" />پروژه روز</button><button className={sub === 'favorites' ? 'is-on' : ''} onClick={() => setSub('favorites')}><Heart className="w-4 h-4" />علاقه‌مندی‌ها</button></div>{sub === 'favorites' ? <FavoritesList favorites={favorites} grouped={grouped} onTab={onTab} onToggleFavorite={onToggleFavorite} onSelect={onSelect} onDelete={onDelete} onAddToProject={onAddToProject} /> : <ProjectsList projects={projects} onCreate={() => setDialogState({ open: true })} onOpen={setOpenProjectId} onDelete={removeProject} />}<ProjectDialog open={dialogState.open} initialName={dialogState.editing?.name} initialDateIso={dialogState.editing?.date} onCancel={() => setDialogState({ open: false })} onConfirm={saveNewProject} /><ConfirmDialog request={confirm} onClose={() => setConfirm(null)} /></div>;
};

const ProjectsList = ({ projects, onCreate, onOpen, onDelete }: { projects: ShootProject[]; onCreate: () => void; onOpen: (id: string) => void; onDelete: (p: ShootProject) => void }) => <><div className="shotlist-header"><div><span>آماده برای روز اجرا</span><h2>پروژه‌های روز</h2></div><button onClick={onCreate} className="btn btn-primary"><Plus className="w-4 h-4" />پروژه جدید</button></div>{projects.length === 0 ? <EmptyState icon={CalendarDays} title="اولین پروژه روزت را بساز" text="بعد از ساخت، انتخاب از گالری یا از ژست‌های موجود در برنامه را می‌بینی." action={{ label: 'ساخت پروژه', onClick: onCreate }} /> : <div className="project-stack">{projects.map((p) => <div className="project-card" key={p.id}><button onClick={() => onOpen(p.id)} className="project-card-main"><span className="project-mark">{p.mode === 'فیلم‌برداری' ? <Film className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}</span><span><strong>{p.name}</strong><small>{isoToJalaliLabel(p.date)} · {p.poseIds.length.toLocaleString('fa-IR')} آیتم</small></span><ChevronLeft className="w-4 h-4" /></button><button onClick={() => onDelete(p)} className="project-delete"><Trash2 className="w-4 h-4" /></button></div>)}</div>}</>;

const FavoritesList = ({ favorites, grouped, onTab, ...props }: any) => <><div className="shotlist-header"><div><span>ذخیره‌شده‌ها</span><h2>علاقه‌مندی‌ها</h2></div><button onClick={() => onTab('library')} className="btn btn-ghost"><LayoutGrid className="w-4 h-4" />کتابخانه</button></div>{favorites.length === 0 ? <EmptyState icon={Heart} title="هنوز چیزی نشان نشده" text="از کتابخانه ژست‌ها، موارد مهم را نشان کن." action={{ label: 'رفتن به کتابخانه', onClick: () => onTab('library') }} /> : <div className="space-y-5">{Object.entries(grouped).map(([category, list]: [string, Pose[]]) => <section key={category}><h3 className="font-extrabold text-muted text-[12px] mb-2">{category}</h3><div className="grid grid-cols-2 gap-3">{list.map((p) => <PoseCard key={p.id} pose={p} isFavorite onToggleFavorite={props.onToggleFavorite} onSelect={props.onSelect} onDelete={props.onDelete} onAddToProject={props.onAddToProject} />)}</div></section>)}</div>}</>;

function ProjectWorkspace({ project, poses, role, setRole, sourcePicker, setSourcePicker, appPicker, setAppPicker, search, setSearch, visibleAppPoses, galleryInputRef, importGallery, removeProject, onBack, onSelect, onAddPose, onRemove, onToggleDone }: any) {
  const mode = project.mode || 'عکاسی';
  const MetaIcon = modeMeta[mode].icon;
  const done = project.completedPoseIds || [];
  return <div className="shot-workspace">
    <header className="workspace-top"><button onClick={onBack} className="icon-button"><ArrowRight className="w-5 h-5" /></button><div><span>پروژه روز</span><h1>{project.name}</h1><small>{isoToJalaliLabel(project.date)} · {poses.length.toLocaleString('fa-IR')} مورد</small></div><button onClick={() => {}} className="icon-button"><Pencil className="w-4 h-4" /></button></header>
    <section className="mode-switch"><button className={mode === 'عکاسی' ? 'is-photo' : ''} onClick={() => { saveProject({ ...project, mode: 'عکاسی' }); window.location.reload(); }}><Users className="w-5 h-5" />عکاسی</button><button className={mode === 'فیلم‌برداری' ? 'is-film' : ''} onClick={() => { saveProject({ ...project, mode: 'فیلم‌برداری' }); window.location.reload(); }}><Film className="w-5 h-5" />فیلم‌برداری</button></section>
    <section className={`workspace-summary ${mode === 'فیلم‌برداری' ? 'film-summary' : ''}`}><div className="summary-title"><MetaIcon className="w-5 h-5" /><div><strong>{mode === 'عکاسی' ? 'عکس‌های گرفته‌شده' : 'پلان‌های فیلم‌برداری'}</strong><small>{modeMeta[mode].hint}</small></div></div><div className="role-tabs">{ROLES.map((item) => <button key={item} className={role === item ? 'is-on' : ''} onClick={() => setRole(item)}>{item}<b>{poses.filter((p: Pose) => p.tags.includes(item)).length.toLocaleString('fa-IR')}</b></button>)}</div><div className="summary-count"><strong>{poses.length.toLocaleString('fa-IR')}</strong><span>مورد در پروژه</span></div></section>
    {sourcePicker && <section className="source-chooser a-fade-up"><div><span>افزودن به پروژه</span><h2>منبع را انتخاب کن</h2><p>عکس مرجع خودت یا ژست آماده برنامه، هر دو کنار هم می‌نشینند.</p></div><div className="source-chooser-grid"><button onClick={() => galleryInputRef.current?.click()} className="source-option gallery"><ImagePlus className="w-6 h-6" /><strong>انتخاب از گالری</strong><small>چند عکس را هم‌زمان وارد کن</small></button><button onClick={() => { setSourcePicker(false); setAppPicker(true); }} className="source-option app"><Sparkles className="w-6 h-6" /><strong>انتخاب از برنامه</strong><small>ژست‌های آماده و قابل اجرا</small></button></div><input ref={galleryInputRef} type="file" accept="image/*" multiple hidden onChange={importGallery} /></section>}
    <button onClick={() => setSourcePicker(true)} className="add-shot-button"><Plus className="w-5 h-5" />افزودن عکس یا ژست</button>
    {appPicker && <div className="picker-overlay"><div className="picker-sheet"><header><div><span>کتابخانه برنامه</span><h2>ژست را به پروژه اضافه کن</h2></div><button onClick={() => setAppPicker(false)}><X className="w-5 h-5" /></button></header><label className="picker-search"><Search className="w-4 h-4" /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی ژست، تگ یا لوکیشن" /></label><div className="app-pose-list">{visibleAppPoses.map((p: Pose) => { const added = project.poseIds.includes(p.id); return <button key={p.id} disabled={added} onClick={() => onAddPose(p)}><span className="app-pose-image"><PoseVisual pose={p} /></span><span><strong>{p.title}</strong><small>{p.category} · {p.difficulty}</small></span>{added ? <Check className="w-4 h-4 text-teal" /> : <Plus className="w-4 h-4 text-gold" />}</button>; })}</div></div></div>}
    {poses.length === 0 ? <div className="shot-empty"><MetaIcon className="w-9 h-9" /><h2>شات‌لیستت هنوز خالی است</h2><p>از گالری یا از ژست‌های آماده برنامه شروع کن.</p><button onClick={() => setSourcePicker(true)} className="btn btn-primary"><ImagePlus className="w-4 h-4" />افزودن اولین مورد</button></div> : <div className="shot-grid">{poses.map((p: Pose) => <article className={`shot-card ${done.includes(p.id) ? 'is-done' : ''}`} key={p.id}><div className="shot-image"><PoseVisual pose={p} /><div className="shot-image-actions"><button><Heart className="w-4 h-4" /></button><button onClick={() => onRemove(p)}><Trash2 className="w-4 h-4" /></button></div>{done.includes(p.id) && <span className="done-badge"><Check className="w-3 h-3" />اجرا شد</span>}</div><div className="shot-card-body"><strong>{p.title}</strong><small>{p.tags.includes('گالری') ? 'مرجع شخصی' : p.category} · {mode === 'فیلم‌برداری' ? 'پلان' : 'ژست'}</small><button onClick={() => onToggleDone(p)} className="shot-done-button">{done.includes(p.id) ? 'علامت‌گذاری به‌عنوان باز' : 'انجام شد'}<Check className="w-3.5 h-3.5" /></button></div></article>)}</div>}
    <button onClick={removeProject.bind(null, project)} className="workspace-delete"><Trash2 className="w-4 h-4" />حذف پروژه روز</button>
  </div>;
}
