import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, CircleDollarSign, FileText, Plus, Search, Settings2, Users } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { EmptyState } from '../components/EmptyState';

interface Props { projects: OfficeProject[]; profile: StudioProfile | null; onAddProject: () => void; onSelectProject: (p: OfficeProject) => void; onEditProfile: () => void; }
const money = (n: number) => n.toLocaleString('fa-IR');
const date = (iso?: string) => iso ? new Intl.DateTimeFormat('fa-IR', { month: 'long', day: 'numeric' }).format(new Date(`${iso}T12:00:00`)) : 'بدون تاریخ';

export const OfficeView: React.FC<Props> = ({ projects, profile, onAddProject, onSelectProject, onEditProfile }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => projects.filter((p) => `${p.name} ${p.customer?.brideName || ''} ${p.customer?.groomName || ''}`.includes(query.trim())).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)), [projects, query]);
  const draftCount = projects.filter((p) => p.ceremonyInvoice?.status !== 'final').length;

  return <div className="office-home space-y-5">
    <header className="office-title"><div><p>مدیریت آتلیه</p><h1>پروژه‌ها، از رزرو تا قرارداد</h1></div><button onClick={onEditProfile} className="icon-button" aria-label="پروفایل آتلیه"><Settings2 className="w-4 h-4" /></button></header>

    {!profile && <button onClick={onEditProfile} className="studio-setup"><span><strong>اول مشخصات آتلیه را کامل کن</strong><small>نام، تلفن و لوگو روی فاکتور و قرارداد می‌آید.</small></span><ChevronLeft className="w-5 h-5" /></button>}

    <section className="office-summary" aria-label="خلاصه پروژه‌ها"><span><Users className="w-4 h-4" /><small>همه پروژه‌ها</small><b>{money(projects.length)}</b></span><span><FileText className="w-4 h-4" /><small>پیش‌نویس</small><b>{money(draftCount)}</b></span><span><CircleDollarSign className="w-4 h-4" /><small>فاکتور نهایی</small><b>{money(projects.length - draftCount)}</b></span></section>

    <div className="office-toolbar"><label><Search className="w-4 h-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی نام زوج یا پروژه" /></label><button onClick={onAddProject} className="btn btn-primary"><Plus className="w-4 h-4" />پروژه جدید</button></div>

    {filtered.length === 0 ? <EmptyState icon={CalendarDays} title={query ? 'پروژه‌ای پیدا نشد' : 'هنوز پروژه‌ای ثبت نشده'} text={query ? 'عبارت جستجو را کوتاه‌تر کن.' : 'اولین پروژه را بساز؛ خدمات انتخابی خودش وارد فاکتور و قرارداد می‌شود.'} action={!query ? { label: 'ساخت اولین پروژه', onClick: onAddProject } : undefined} /> : <div className="project-list">{filtered.map((p) => {
      const invoice = p.ceremonyInvoice;
      const names = [p.customer?.brideName, p.customer?.groomName].filter(Boolean).join(' و ');
      return <button key={p.id} onClick={() => onSelectProject(p)} className="project-row"><span className="project-date"><b>{date(p.ceremony?.date)}</b><small>{p.eventType || 'مراسم'}</small></span><span className="project-main"><strong>{names || p.name}</strong><small>{p.ceremony?.location || 'محل مراسم ثبت نشده'}</small></span><span className="project-money"><b>{money(invoice?.total || 0)}</b><small>تومان</small></span><span className={`status-dot ${invoice?.status === 'final' ? 'is-final' : ''}`}>{invoice?.status === 'final' ? 'نهایی' : 'پیش‌نویس'}</span><ChevronLeft className="w-4 h-4 text-faint" /></button>;
    })}</div>}
  </div>;
};
