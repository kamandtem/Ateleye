import React, { useMemo, useState } from 'react';
import { Camera, Clapperboard, ChevronDown, CircleStop, Play, RotateCcw, X, Save } from 'lucide-react';
import { Pose } from '../types/pose';
import { FilmNote, getFilmNotes, saveFilmNote } from '../services/storage';

interface Props { pose: Pose; open: boolean; onClose: () => void; }

function planFor(p: Pose): FilmNote {
  const moving = ['راه رفتن','حرکتی'].includes(p.poseType);
  const intimate = ['رمانتیک','بغل کردن'].includes(p.poseType);
  return {
    start: intimate ? `پلان را با ${p.title} در حالت ثابت شروع کن؛ یک قاب نزدیک از ارتباط چشم‌ها و دست‌ها بگیر.` : `پلان را با ${p.title} به‌عنوان قاب معرفی شروع کن؛ اول اجازه بده فرم بدن و لوکیشن خوانا شود.`,
    movement: moving ? 'حرکت را آهسته و پیوسته اجرا کن: از نمای باز شروع کن، هم‌سرعت سوژه حرکت کن و در پایان یک توقف کوتاه برای قاب تمیز داشته باش.' : intimate ? 'دوربین آرام به سوژه نزدیک شود یا یک نیم‌دایره کوتاه دور آن‌ها بزند؛ حرکت باید از احساس جلو نزند.' : 'از قاب ثابت به یک پوش‌این آرام یا حرکت نیم‌دایره‌ای برو؛ تغییر را فقط با یک متغیر انجام بده تا پلان شلوغ نشود.',
    camera: moving ? 'گیمبال یا استبلایزر، شاتر حداقل ۱/۱۰۰، فوکوس پیوسته روی صورت نزدیک‌تر و فضای خالی در جهت حرکت.' : 'حرکت نرم گیمبال یا هند‌هلد کنترل‌شده، فوکوس روی چشم‌ها، سرعت حرکت کمتر از سرعت تغییر حالت سوژه.',
    sequence: ['قاب شروع: ۲ تا ۳ ثانیه بدون حرکت برای معرفی لوکیشن و فرم.', 'حرکت اصلی: یک دستور کوتاه بده و فقط یک تغییر را دنبال کن.', 'نقطه اوج: نگاه، تماس دست یا حرکت لباس را نگه دار.', 'پایان: ۲ ثانیه مکث، بعد کات.'],
    direction: moving ? 'آرام راه بروید، به هم نگاه کنید، در پایان سه ثانیه همان حالت را نگه دارید.' : intimate ? 'آرام نفس بکشید، حرکت اضافه نکنید، در لحظه نگاه یا تماس اصلی مکث کنید.' : 'بدن را در همین فرم نگه دارید، فقط سر یا دست را کمی تغییر دهید و بعد مکث کنید.',
    sound: 'صدای محیط لوکیشن را یک برداشت جدا بگیر؛ برای پلان اصلی از موسیقی یا صدای طبیعی با کات نرم استفاده کن.',
    transition: 'پلان بعدی را با جهت نگاه یا حرکت دست وصل کن؛ اگر سوژه به راست نگاه می‌کند، نمای بعدی را از همان مسیر ادامه بده.',
    safety: p.poseType === 'حرکتی' ? 'قبل از حرکت، مسیر پا، لباس و سطح زمین را چک کن. نسخه ساده‌تر ژست را هم آماده داشته باش.' : 'قبل از ضبط، راحتی سوژه و فضای امن حرکت را بررسی کن.',
  };
}

const LABELS: { key: keyof FilmNote; title: string; icon: React.ReactNode }[] = [
  { key: 'start', title: 'نقطه شروع پلان', icon: <Play/> },
  { key: 'movement', title: 'حرکت اصلی', icon: <RotateCcw/> },
  { key: 'camera', title: 'حرکت و تنظیم دوربین', icon: <Camera/> },
  { key: 'direction', title: 'دستور به سوژه', icon: <Play/> },
  { key: 'sound', title: 'صدا و فضا', icon: <CircleStop/> },
  { key: 'safety', title: 'ایمنی', icon: <X/> },
  { key: 'transition', title: 'اتصال به نمای بعد', icon: <ChevronDown/> },
];

export const FilmPlan: React.FC<Props> = ({ pose, open, onClose }) => {
  const saved = getFilmNotes()[pose.id];
  const hasSaved = Boolean(saved);
  const [tab, setTab] = useState<'plan'|'camera'>('plan');
  const [data, setData] = useState<FilmNote>(saved || planFor(pose));
  const [editing, setEditing] = useState<string | null>(null);
  const [savedNow, setSavedNow] = useState(false);
  React.useEffect(() => { if (open) { setData(getFilmNotes()[pose.id] || planFor(pose)); setEditing(null); setSavedNow(false); } }, [open, pose.id]);
  if (!open) return null;
  const update = (key: keyof FilmNote, value: string) => setData((d) => ({ ...d, [key]: value }));
  const save = () => { saveFilmNote(pose.id, data); setSavedNow(true); setEditing(null); setTimeout(() => setSavedNow(false), 1800); };
  const editBlock = (key: keyof FilmNote, title: string, icon: React.ReactNode) => editing === key ? (
    <div className="p-3 rounded-2xl border border-gold space-y-2"><div className="flex items-center gap-2 text-[12px] font-bold">{icon}{title}</div><textarea value={String(data[key])} onChange={(e) => update(key, e.target.value)} rows={4} autoFocus className="field resize-none leading-relaxed"/><button onClick={save} className="btn btn-primary !py-2 !text-[11px] w-full"><Save className="w-3.5 h-3.5"/>ثبت این تغییر</button></div>
  ) : <button
    onClick={() => {
      setEditing(key);
      if (!hasSaved) update(key, '');
    }}
    className="w-full text-right flex items-start gap-3 p-3 rounded-2xl border border-line hover:border-gold"
  ><span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-rose" style={{background:'color-mix(in srgb, var(--color-rose) 12%, transparent)'}}>{React.cloneElement(icon as React.ReactElement,{className:'w-4 h-4'})}</span><span><b className="block text-[12px]">{title}</b><span className="block text-[11px] text-muted leading-relaxed mt-1">{String(data[key])}</span><span className="block text-[10px] text-gold mt-1">برای ویرایش بزن</span></span></button>;
  return <div className="fixed inset-0 z-[86] flex items-end sm:items-center justify-center"><div className="absolute inset-0" style={{background:'rgba(4,3,8,.66)',backdropFilter:'blur(4px)'}} onClick={onClose}/><section className="relative w-full sm:max-w-xl max-h-[92vh] overflow-y-auto no-scrollbar card a-fade-up" style={{borderRadius:'26px 26px 0 0'}} role="dialog" aria-label="پلان فیلم‌برداری"><header className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b border-line" style={{background:'var(--color-surface)'}}><span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'color-mix(in srgb, var(--color-rose) 17%, transparent)',color:'var(--color-rose)'}}><Clapperboard className="w-5 h-5"/></span><div className="flex-1"><span className="text-[10px] font-extrabold text-rose">تبدیل ژست به پلان</span><h2 className="font-extrabold text-[15px] mt-0.5">فیلم‌برداری همین ژست</h2></div><button onClick={onClose} className="p-2 rounded-full text-muted" aria-label="بستن"><X className="w-5 h-5"/></button></header><div className="p-4 space-y-4"><div className="flex gap-1 p-1 rounded-xl" style={{background:'var(--color-surface2)'}}><button onClick={()=>setTab('plan')} className="flex-1 py-2 rounded-lg text-[11px] font-bold" style={{background:tab==='plan'?'var(--color-surface)':'transparent',color:tab==='plan'?'var(--color-rose)':'var(--color-muted)'}}>مسیر پلان</button><button onClick={()=>setTab('camera')} className="flex-1 py-2 rounded-lg text-[11px] font-bold" style={{background:tab==='camera'?'var(--color-surface)':'transparent',color:tab==='camera'?'var(--color-rose)':'var(--color-muted)'}}>دوربین و اجرا</button></div>{editing === 'sequence' ? <div className="p-3 rounded-2xl border border-gold space-y-2"><b className="text-[12px]">مراحل پلان</b><textarea value={data.sequence.join('\n')} onChange={(e)=>setData((d)=>({...d,sequence:e.target.value.split('\n')}))} rows={6} className="field resize-none leading-relaxed"/><button onClick={save} className="btn btn-primary !py-2 !text-[11px] w-full"><Save className="w-3.5 h-3.5"/>ثبت تغییرات</button></div> : tab==='plan' ? <div className="space-y-2.5">{editBlock('start','نقطه شروع پلان',<Play/>)}{editBlock('movement','حرکت اصلی',<RotateCcw/>)}<button
  onClick={() => {
    setEditing('sequence');
    if (!hasSaved) setData((d) => ({ ...d, sequence: [] }));
  }}
  className="w-full text-right p-3 rounded-2xl border border-line"
><b className="text-[12px]">مراحل پلان</b><span className="block text-[11px] text-muted mt-1">{data.sequence.join(' ')}</span><span className="block text-[10px] text-gold mt-1">برای ویرایش بزن</span></button>{editBlock('transition','اتصال به نمای بعد',<ChevronDown/>)}</div> : <div className="space-y-2.5">{editBlock('camera','حرکت و تنظیم دوربین',<Camera/>)}{editBlock('direction','دستور به سوژه',<Play/>)}{editBlock('sound','صدا و فضا',<CircleStop/>)}{editBlock('safety','ایمنی',<X/>)}</div>}<div className="p-3 rounded-2xl border border-line"><span className="text-[10px] font-extrabold text-gold">یادآوری کارگردانی</span><p className="text-[12px] leading-relaxed mt-1">هر بخش را بزن و نکته خودت را اضافه کن. نوشته‌ها برای همین ژست ذخیره می‌شوند.</p></div></div><footer className="sticky bottom-0 px-4 py-3 border-t border-line flex gap-2" style={{background:'var(--color-surface)'}}><button onClick={save} className="btn btn-ghost flex-1"><Save className="w-4 h-4"/>{savedNow ? 'ثبت شد' : 'ثبت همه تغییرات'}</button><button onClick={onClose} className="btn btn-primary flex-1">متوجه شدم، آماده ضبط‌ام</button></footer></section></div>;
};
