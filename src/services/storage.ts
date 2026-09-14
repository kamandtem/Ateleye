import { FilterState, MyLocation, Pose, StudioProfile, OfficeProject } from '../types/pose';
import { INITIAL_POSES } from '../data/poses';
import { extensionForDataUrl, isAnimatedDataUrl } from './media';

const K = {
fav: 'pd_favorites_v2',
recent: 'pd_recent_v2',
custom: 'pd_custom_poses_v2',
photos: 'pd_user_photos_v2',
notes: 'pd_notes_v2',
prefs: 'pd_prefs_v2',
seen: 'pd_onboarded_v2',
session: 'pd_session_v2',
promoted: 'pd_promoted_poses_v1',
deletedBuiltin: 'pd_deleted_builtin_v1',
projects: 'pd_projects_v1',
filmNotes: 'pd_film_notes_v1',
myLocations: 'pd_my_locations_v1',
selectedLocation: 'pd_selected_location_v1',
weatherCache: 'pd_weather_cache_v1',
};

function read<T>(key: string, fallback: T): T {
try {
const raw = localStorage.getItem(key);
return raw ? (JSON.parse(raw) as T) : fallback;
} catch {
return fallback;
}
}

function write(key: string, value: unknown): boolean {
try {
localStorage.setItem(key, JSON.stringify(value));
return true;
} catch {
return false;
}
}

/* ------------------------------ تنظیمات ------------------------------ */

export interface Prefs {
theme: 'dark' | 'light';
bigScript: boolean;
keepAwakeHint: boolean;
}

export const DEFAULT_PREFS: Prefs = {
theme: 'dark',
bigScript: true,
keepAwakeHint: true,
};

export interface ShootProject {
id: string;
name: string;
date: string;
poseIds: string[];
completedPoseIds?: string[];
createdAt: number;
mode?: 'عکاسی' | 'فیلم‌برداری';
}

export type FilmNote = {
start: string;
movement: string;
camera: string;
direction: string;
sound: string;
safety: string;
transition: string;
sequence: string[];
};

export function getProjects(): ShootProject[] {
return read<ShootProject[]>(K.projects, []);
}

export function saveProject(project: ShootProject): void {
const all = getProjects().filter((p) => p.id !== project.id);
write(K.projects, [project, ...all]);
}

export function deleteProject(id: string): void {
write(K.projects, getProjects().filter((p) => p.id !== id));
}

export function getFilmNotes(): Record<string, FilmNote> {
return read<Record<string, FilmNote>>(K.filmNotes, {});
}

export function saveFilmNote(poseId: string, note: FilmNote): void {
write(K.filmNotes, { ...getFilmNotes(), [poseId]: note });
}

/* --------------------------- لوکیشن‌های من --------------------------- */

export function getMyLocations(): MyLocation[] {
return read<MyLocation[]>(K.myLocations, []);
}

export function saveMyLocation(loc: MyLocation): { ok: boolean; error?: string } {
const all = getMyLocations();
const i = all.findIndex((l) => l.id === loc.id);
const next = [...all];
if (i >= 0) next[i] = loc;
else next.unshift(loc);
const ok = write(K.myLocations, next);
return ok
? { ok: true }
: { ok: false, error: 'حافظه دستگاه پر شده است. چند مورد قدیمی را حذف کنید و دوباره تلاش کنید.' };
}

export function deleteMyLocation(id: string): MyLocation[] {
const next = getMyLocations().filter((l) => l.id !== id);
write(K.myLocations, next);
if (getSelectedLocationId() === id) setSelectedLocationId(null);
return next;
}

export function getSelectedLocationId(): string | null {
return read<string | null>(K.selectedLocation, null);
}

export function setSelectedLocationId(id: string | null): void {
write(K.selectedLocation, id);
}

export function getSelectedLocation(): MyLocation | null {
const id = getSelectedLocationId();
if (!id) return null;
return getMyLocations().find((l) => l.id === id) || null;
}

/* --------------------------- کش آب‌وهوا --------------------------- */

export function getWeatherCache(key: string): Record<string, any> | null {
const all = read<Record<string, Record<string, any>>>(K.weatherCache, {});
return all[key] || null;
}

export function setWeatherCache(key: string, value: unknown): void {
const all = read<Record<string, unknown>>(K.weatherCache, {});
all[key] = value;
write(K.weatherCache, all);
}

export function getPrefs(): Prefs {
return { ...DEFAULT_PREFS, ...read<Partial<Prefs>>(K.prefs, {}) };
}

export function savePrefs(p: Prefs): void {
write(K.prefs, p);
applyTheme(p.theme);
}

export function applyTheme(theme: 'dark' | 'light'): void {
document.documentElement.setAttribute('data-theme', theme);
const meta = document.querySelector('meta[name="theme-color"]');
if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0A12' : '#F6F2EC');
}

export function hasOnboarded(): boolean {
return localStorage.getItem(K.seen) === '1';
}

export function markOnboarded(): void {
try {
localStorage.setItem(K.seen, '1');
} catch {
/* ignore */
}
}

/* --------------------------- علاقه‌مندی‌ها --------------------------- */

export function getFavoriteIds(): string[] {
return read<string[]>(K.fav, []);
}

export function toggleFavorite(id: string): string[] {
const cur = getFavoriteIds();
const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
write(K.fav, next);
return next;
}

export function setFavoriteIds(ids: string[]): void {
write(K.fav, ids);
}

/* ------------------------- بازدیدهای اخیر ------------------------- */

export function getRecentIds(): string[] {
return read<string[]>(K.recent, []);
}

export function pushRecent(id: string): string[] {
const next = [id, ...getRecentIds().filter((x) => x !== id)].slice(0, 12);
write(K.recent, next);
return next;
}

/* --------------------- عکس مرجع کاربر روی ژست --------------------- */
/** عکس‌هایی که کاربر برای ژست‌های آماده انتخاب کرده: { poseId: dataURL } */

export function getUserPhotos(): Record<string, string> {
return read<Record<string, string>>(K.photos, {});
}

export function setUserPhoto(poseId: string, dataUrl: string): boolean {
const all = getUserPhotos();
all[poseId] = dataUrl;
return write(K.photos, all);
}

export function removeUserPhoto(poseId: string): void {
const all = getUserPhotos();
delete all[poseId];
write(K.photos, all);
}

/* ------------------------- یادداشت شخصی ------------------------- */

export function getNotes(): Record<string, string> {
return read<Record<string, string>>(K.notes, {});
}

export function setNote(poseId: string, note: string): void {
const all = getNotes();
if (note.trim()) all[poseId] = note.trim();
else delete all[poseId];
write(K.notes, all);
}

/* ------------------------- ژست‌های کاربر ------------------------- */

export function getCustomPoses(): Pose[] {
return read<Pose[]>(K.custom, []);
}

export function nextTransferCode(existing: Pose[] = getCustomPoses()): string {
const used = existing
.map((p) => Number((p.transferCode || '').replace(/^P-/, '')))
.filter(Number.isFinite);
const next = Math.max(0, ...used) + 1;
return `P-${String(next).padStart(3, '0')}`;
}

export function getPromotedPoses(): Pose[] {
return read<Pose[]>(K.promoted, []);
}

export function getDeletedBuiltinIds(): string[] {
return read<string[]>(K.deletedBuiltin, []);
}

/** تبدیل ژست شخصی به ژست اصلی پایدار، بدون نیاز به کدنویسی */
export function promotePose(id: string): boolean {
const pose = getCustomPoses().find((p) => p.id === id);
if (!pose) return false;
const promoted = getPromotedPoses().filter((p) => p.id !== id);
promoted.unshift({ ...pose, isCustom: false });
const remaining = getCustomPoses().filter((p) => p.id !== id);
return write(K.promoted, promoted) && write(K.custom, remaining);
}

/** حذف هر نوع ژست، چه اصلی و چه شخصی */
export function deletePoseEverywhere(pose: Pose): void {
if (pose.isCustom) {
deleteCustomPose(pose.id);
return;
}
write(K.promoted, getPromotedPoses().filter((p) => p.id !== pose.id));
if (INITIAL_POSES.some((p) => p.id === pose.id)) {
write(K.deletedBuiltin, Array.from(new Set([...getDeletedBuiltinIds(), pose.id])));
}
setFavoriteIds(getFavoriteIds().filter((x) => x !== pose.id));
const notes = getNotes();
delete notes[pose.id];
write(K.notes, notes);
}

export function saveCustomPose(pose: Pose): { ok: boolean; error?: string } {
const cur = getCustomPoses();
const i = cur.findIndex((p) => p.id === pose.id);
const next = [...cur];
if (i >= 0) next[i] = pose;
else next.unshift(pose);
const ok = write(K.custom, next);
return ok
? { ok: true }
: {
ok: false,
error:
'حافظه دستگاه پر شده است. چند ژست قدیمی یا عکس‌های مرجع را حذف کنید و دوباره تلاش کنید.',
};
}

export function deleteCustomPose(id: string): Pose[] {
const next = getCustomPoses().filter((p) => p.id !== id);
write(K.custom, next);
removeUserPhoto(id);
const notes = getNotes();
delete notes[id];
write(K.notes, notes);
setFavoriteIds(getFavoriteIds().filter((x) => x !== id));
return next;
}

/* ---------------------------- خواندن کل ---------------------------- */

/** ژست‌های آماده + ژست‌های کاربر، با عکس‌ها و یادداشت‌های ذخیره‌شده */
export function getAllPoses(): Pose[] {
const photos = getUserPhotos();
const notes = getNotes();
const merge = (p: Pose): Pose => {
const photo = photos[p.id];
return {
...p,
image: photo || p.image,
note: notes[p.id],
isAnimated: photo ? isAnimatedDataUrl(photo) : p.isAnimated,
};
};
const deleted = new Set(getDeletedBuiltinIds());
const promotedIds = new Set(getPromotedPoses().map((p) => p.id));
return [
...getCustomPoses().map(merge),
...getPromotedPoses().map(merge),
...INITIAL_POSES.filter((p) => !deleted.has(p.id) && !promotedIds.has(p.id)).map(merge),
];
}

/* --------------------------- فیلتر و جستجو --------------------------- */

const PERSIAN_SYNONYMS: Record<string, string[]> = {
'عروس': ['دختر عروس', 'برايد', 'bride'],
'داماد': ['آقا داماد', 'شوهر', 'groom'],
'زوج': ['عروس داماد', 'دو نفره', 'دونفره', 'زوجین', 'کاپل', 'couple'],
'رمانتیک': ['عاشقانه', 'احساسی', 'رمانتیک'],
'بغل کردن': ['آغوش', 'در آغوش', 'بغل', 'احتضان'],
'راه رفتن': ['قدم زدن', 'راه رفتن', 'پیاده روی', 'پیاده‌روی'],
'ایستاده': ['سرپا', 'ایستادن', 'ایستاده'],
'نشسته': ['نشستن', 'نشسته'],
'خلاقانه': ['هنری', 'خاص', 'خلاقیتی'],
'رسمی': ['کلاسیک', 'فورمال'],
'جنوب': ['ساحل', 'دریا', 'بندر', 'جزیره'],
'شمال': ['جنگل', 'مه', 'سبز'],
'کویر': ['صحرا', 'شن', 'بیابان'],
'باغ عمارت': ['عمارت', 'باغ', 'کاخ', 'لوکیشن عروسی'],
'پرتره': ['پورتریت', 'چهره', 'کلوزآپ'],
'بوسه': ['بوسیدن', 'ماچ'],
'تور': ['veil', 'حجاب عروس'],
'حلقه': ['انگشتر', 'رینگ'],
};

const TYPO_REPLACEMENTS: Array<[RegExp, string]> = [
[/ي/g, 'ی'], [/ى/g, 'ی'], [/ك/g, 'ک'], [/ۀ/g, 'ه'], [/ة/g, 'ه'],
[/ؤ/g, 'و'], [/إ|أ|ٱ/g, 'ا'], [/ـ/g, ''],
[/پوز/g, 'پوز'], [/ژستها/g, 'ژست ها'], [/ژستام/g, 'ژست من'],
];

function normalize(v: string): string {
let out = v || '';
for (const [pattern, replacement] of TYPO_REPLACEMENTS) out = out.replace(pattern, replacement);
return out
.replace(/[\u200C\u200F\u200E]/g, ' ')
.replace(/[ًٌٍَُِّْ]/g, '')
.replace(/\s+/g, ' ')
.trim()
.toLowerCase();
}

function expandQuery(query: string): string[] {
const terms = new Set<string>();
const normalized = normalize(query);
for (const word of normalized.split(' ').filter(Boolean)) {
terms.add(word);
for (const [canonical, synonyms] of Object.entries(PERSIAN_SYNONYMS)) {
const group = [canonical, ...synonyms].map(normalize);
if (group.some((x) => x === word || x.includes(word) || word.includes(x))) {
group.forEach((x) => terms.add(x));
}
}
}
return [...terms];
}

function editDistance(a: string, b: string): number {
if (a === b) return 0;
if (!a.length) return b.length;
if (!b.length) return a.length;
const row = Array.from({ length: b.length + 1 }, (_, i) => i);
for (let i = 1; i <= a.length; i++) {
let prev = row[0];
row[0] = i;
for (let j = 1; j <= b.length; j++) {
const next = row[j];
row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
prev = next;
}
}
return row[b.length];
}

function fuzzyMatch(word: string, haystack: string): boolean {
if (word.length < 3) return false;
const tokens = haystack.split(' ').filter(Boolean);
return tokens.some((token) => {
if (token.includes(word) || word.includes(token)) return true;
const maxDistance = word.length >= 6 ? 2 : 1;
return editDistance(word, token) <= maxDistance;
});
}

export function filterPoses(poses: Pose[], f: FilterState, favoriteIds: string[] = []): Pose[] {
const queryTerms = expandQuery(f.search || '');
const queryWords = normalize(f.search || '').split(' ').filter(Boolean);
return poses.filter((p) => {
if (f.customOnly && !p.isCustom) return false;
if (f.category !== 'همه' && p.category !== f.category) return false;
if (f.poseType !== 'همه' && p.poseType !== f.poseType) return false;
if (f.difficulty !== 'همه' && p.difficulty !== f.difficulty) return false;
if (f.location !== 'همه' && !p.locations.includes(f.location)) return false;
if (
f.location === 'باغ عمارت' &&
f.gardenSubCategory !== 'همه' &&
p.gardenSubCategory !== f.gardenSubCategory
) return false;
if (f.peopleCount && p.peopleCount !== f.peopleCount) return false;

if (f.search && f.search.trim()) {
const haystack = normalize(
[
p.title,
p.category,
p.poseType,
p.difficulty,
p.note || '',
p.tags.join(' '),
p.locations.join(' '),
p.steps.join(' '),
p.photographerScript.join(' '),
p.variations.join(' '),
p.commonMistakes.join(' '),
].join(' ')
);
const eachWordMatches = queryWords.every((word) => {
const expanded = queryTerms.filter((term) => term === word || term.includes(word) || word.includes(term));
return expanded.some((term) => haystack.includes(term)) || fuzzyMatch(word, haystack);
});
if (!eachWordMatches) return false;
}

void favoriteIds;
return true;
});
}

/* ------------------------ موتور «ژست بعدی» ------------------------ */

function getSession(): string[] {
try {
const raw = sessionStorage.getItem(K.session);
return raw ? JSON.parse(raw) : [];
} catch {
return [];
}
}

function pushSession(id: string): void {
try {
const s = getSession();
if (!s.includes(id)) sessionStorage.setItem(K.session, JSON.stringify([...s, id]));
} catch {
/* ignore */
}
}

export function resetSession(): void {
try {
sessionStorage.removeItem(K.session);
} catch {
/* ignore */
}
}

/** ژست بعدی را با توجه به فیلتر فعال و ژست‌های دیده‌شده در همین جلسه پیشنهاد می‌دهد */
export function getNextPose(currentId: string | undefined, filters: FilterState): Pose {
const all = getAllPoses();
let pool = filterPoses(all, filters);
if (pool.length === 0) pool = all;

const withoutCurrent = pool.filter((p) => p.id !== currentId);
const candidates = withoutCurrent.length ? withoutCurrent : pool;

const seen = getSession();
const fresh = candidates.filter((p) => !seen.includes(p.id));
const source = fresh.length ? fresh : candidates;

const picked = source[Math.floor(Math.random() * source.length)];
pushSession(picked.id);
pushRecent(picked.id);
return picked;
}

/* --------------------------- پشتیبان‌گیری --------------------------- */

export interface Backup {
app: 'pose-director';
version: 2;
exportedAt: string;
favorites: string[];
recent: string[];
customPoses: Pose[];
userPhotos: Record<string, string>;
notes: Record<string, string>;
prefs: Prefs;
promotedPoses?: Pose[];
deletedBuiltinIds?: string[];
myLocations?: MyLocation[];
}

/** بسته‌ای سبک برای فرستادن ژست‌های تازه به سازنده برنامه */
export interface PosePack {
app: 'pose-director';
exportType: 'pose-pack';
version: 1;
exportedAt: string;
/** false تا وقتی کلود این بسته را داخل سورس کد اضافه کند؛ برای ردیابی بسته‌های پشت‌سرهم. */
reviewed: false;
poses: Pose[];
userPhotos: Record<string, string>;
photoManifest: Array<{ code: string; title: string; filename: string }>;
}

export function buildBackup(): Backup {
return {
app: 'pose-director',
version: 2,
exportedAt: new Date().toISOString(),
favorites: getFavoriteIds(),
recent: getRecentIds(),
customPoses: getCustomPoses(),
userPhotos: getUserPhotos(),
notes: getNotes(),
prefs: getPrefs(),
promotedPoses: getPromotedPoses(),
deletedBuiltinIds: getDeletedBuiltinIds(),
myLocations: getMyLocations(),
};
}

export function buildPosePack(): PosePack {
const poses = getCustomPoses();
const photos = getUserPhotos();
const userPhotos: Record<string, string> = {};
poses.forEach((pose) => {
const photo = photos[pose.id] || pose.image;
if (photo) userPhotos[pose.id] = photo;
});
return {
app: 'pose-director',
exportType: 'pose-pack',
version: 1,
exportedAt: new Date().toISOString(),
reviewed: false,
poses,
userPhotos,
// نام فایل با پسوند واقعی عکس ساخته می‌شود (نه همیشه jpg)، وگرنه گیف با
// پسوند اشتباه ذخیره می‌شود و در بازبینی سردرگم‌کننده خواهد بود.
photoManifest: poses.map((pose) => {
const code = pose.transferCode || pose.id;
const photo = userPhotos[pose.id];
const ext = photo ? extensionForDataUrl(photo) : 'jpg';
return { code, title: pose.title, filename: `${code}.${ext}` };
}),
};
}

function dataUrlToBytes(dataUrl: string): Uint8Array | null {
const m = /^data:[^;]+;base64,(.+)$/.exec(dataUrl);
if (!m) return null;
try {
const binary = atob(m[1]);
const bytes = new Uint8Array(binary.length);
for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
return bytes;
} catch {
return null;
}
}

/**
 * بسته‌ی انتقال را به‌صورت یک فایل zip می‌سازد: خود عکس‌ها با همان نامی که
 * در «فهرست عکس‌ها» مشخص شده به‌صورت فایل جدا داخل پوشه‌ی photos قرار
 * می‌گیرند، در کنار فایل poses.json که اطلاعات متنی ژست‌ها را دارد.
 * این‌طور کاربر فقط یک فایل zip را برای سازنده‌ی برنامه می‌فرستد.
 */
export async function buildPosePackZip(): Promise<{ blob: Blob; count: number } | null> {
const pack = buildPosePack();
if (!pack.poses.length) return null;
const JSZip = (await import('jszip')).default;
const zip = new JSZip();
const { userPhotos: _omit, ...manifestForJson } = pack;
void _omit;
zip.file('poses.json', JSON.stringify(manifestForJson, null, 2));
const photosFolder = zip.folder('photos');
let count = 0;
pack.photoManifest.forEach((entry) => {
const raw = pack.poses.find((p) => (p.transferCode || p.id) === entry.code);
const photo = raw ? pack.userPhotos[raw.id] : undefined;
if (!photo) return;
const bytes = dataUrlToBytes(photo);
if (!bytes) return;
photosFolder?.file(entry.filename, bytes);
count += 1;
});
const blob = await zip.generateAsync({ type: 'blob' });
return { blob, count };
}

export function restoreBackup(raw: string): { ok: boolean; message: string } {
try {
const data = JSON.parse(raw) as Partial<Backup>;
if (!data || data.app !== 'pose-director') {
return { ok: false, message: 'این فایل پشتیبان مربوط به این برنامه نیست.' };
}
if (Array.isArray(data.customPoses)) write(K.custom, data.customPoses);
if (Array.isArray(data.favorites)) write(K.fav, data.favorites);
if (Array.isArray(data.recent)) write(K.recent, data.recent);
if (data.userPhotos) write(K.photos, data.userPhotos);
if (data.notes) write(K.notes, data.notes);
if (data.prefs) savePrefs({ ...DEFAULT_PREFS, ...data.prefs });
if (Array.isArray(data.promotedPoses)) write(K.promoted, data.promotedPoses);
if (Array.isArray(data.deletedBuiltinIds)) write(K.deletedBuiltin, data.deletedBuiltinIds);
if (Array.isArray(data.myLocations)) write(K.myLocations, data.myLocations);
return {
ok: true,
message: `بازیابی انجام شد: ${(data.customPoses || []).length} ژست شخصی برگشت.`,
};
} catch {
return { ok: false, message: 'فایل خوانده نشد. مطمئن شوید فایل پشتیبان سالم است.' };
}
}

export function wipeAll(): void {
Object.values(K).forEach((k) => {
try {
localStorage.removeItem(k);
} catch {
/* ignore */
}
});
resetSession();
}

/** تخمین حجم اشغال‌شده در حافظه مرورگر (مگابایت) */
export function estimateUsageMb(): number {
let bytes = 0;
Object.values(K).forEach((k) => {
bytes += (localStorage.getItem(k) || '').length * 2;
});
return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}


/* ==================== بخش دفتر کار ==================== */

export function getStudioProfile(): StudioProfile | null {
  const K = { studioProfile: 'pd_studio_profile_v1' };
  return read<StudioProfile | null>(K.studioProfile, null);
}

export function saveStudioProfile(p: StudioProfile): boolean {
  const K = { studioProfile: 'pd_studio_profile_v1' };
  return write(K.studioProfile, p);
}

export function getOfficeProjects(): OfficeProject[] {
  const K = { officeProjects: 'pd_office_projects_v1' };
  return read<OfficeProject[]>(K.officeProjects, []);
}

export function saveOfficeProject(proj: OfficeProject): { ok: boolean; error?: string } {
  const K = { officeProjects: 'pd_office_projects_v1' };
  const all = getOfficeProjects();
  const idx = all.findIndex((p) => p.id === proj.id);
  const next = [...all];
  if (idx >= 0) next[idx] = proj;
  else next.unshift(proj);
  const ok = write(K.officeProjects, next);
  return ok ? { ok: true } : { ok: false, error: 'حافظه پر شد' };
}

export function deleteOfficeProject(id: string): void {
  const K = { officeProjects: 'pd_office_projects_v1' };
  write(K.officeProjects, getOfficeProjects().filter((p) => p.id !== id));
}

export function getOfficeProject(id: string): OfficeProject | null {
  return getOfficeProjects().find((p) => p.id === id) || null;
}
