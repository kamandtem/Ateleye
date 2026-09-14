import React, { useState } from 'react';
import { ArrowRight, CalendarDays, Check, Download, Edit2, FileCheck2, MapPin, Receipt, Trash2, Users } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { OfficeProjectEditor } from '../components/OfficeProjectEditor';
import { openPrintableDocument } from '../services/contractGenerator';

interface Props { project: OfficeProject; profile: StudioProfile | null; onBack: () => void; onSave: (p: OfficeProject) => void; onDelete: (id: string) => void; }
const money = (n: number) => n.toLocaleString('fa-IR');
const date = (iso?: string) => iso ? new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${iso}T12:00:00`)) : 'ثبت نشده';

export const ProjectDetailView: React.FC<Props> = ({ project, profile, onBack, onSave, onDelete }) => {
  const [editing, setEditing] = useState(project.createdAt === project.updatedAt && !project.ceremony);
  const [deleting, setDeleting] = useState(false);
  const invoice = project.ceremonyInvoice;
  const customerName = [project.customer?.brideName, project.customer?.groomName].filter(Boolean).join(' و ') || project.name;

  if (editing) return <OfficeProjectEditor project={project} onSave={(p) => { onSave(p); setEditing(false); }} onClose={() => project.ceremony ? setEditing(false) : onBack()} />;

  const finalize = () => invoice && onSave({ ...project, ceremonyInvoice: { ...invoice, status: 'final', updatedAt: Date.now() }, updatedAt: Date.now() });

  return <div className="project-detail space-y-5 pb-24">
    <header className="detail-head"><button onClick={onBack} className="icon-button"><ArrowRight className="w-5 h-5" /></button><div className="flex-1"><span className={`invoice-status ${invoice?.status === 'final' ? 'is-final' : ''}`}>{invoice?.status === 'final' ? <><Check className="w-3 h-3" />نهایی</> : 'پیش‌نویس'}</span><h1>{customerName}</h1><p>{project.name}</p></div><button onClick={() => setEditing(true)} className="icon-button" aria-label="ویرایش"><Edit2 className="w-4 h-4" /></button></header>

    <section className="project-facts"><span><CalendarDays className="w-4 h-4" /><small>تاریخ</small><b>{date(project.ceremony?.date)}</b></span><span><MapPin className="w-4 h-4" /><small>محل</small><b>{project.ceremony?.location || 'ثبت نشده'}</b></span><span><Users className="w-4 h-4" /><small>نوع پروژه</small><b>{project.eventType || 'مراسم'}</b></span></section>

    <section className="document-actions"><button onClick={() => openPrintableDocument(project, profile, 'invoice')}><Receipt className="w-5 h-5" /><span><strong>فاکتور PDF</strong><small>پیش‌نمایش و ذخیره</small></span><Download className="w-4 h-4" /></button><button onClick={() => openPrintableDocument(project, profile, 'contract')}><FileCheck2 className="w-5 h-5" /><span><strong>قرارداد PDF</strong><small>با اطلاعات زوج و فاکتور</small></span><Download className="w-4 h-4" /></button></section>

    <section className="detail-invoice"><div className="detail-section-head"><div><h2>فاکتور خدمات</h2><p>{invoice?.items.length || 0} ردیف، قابل ویرایش تا قبل از نهایی‌شدن</p></div>{invoice?.status !== 'final' && <button onClick={finalize}>نهایی کردن</button>}</div>
      <div className="detail-lines">{invoice?.items.map((item, i) => <div key={`${item.name}-${i}`}><span><b>{item.name}</b><small>{money(item.count)} × {money(item.price)}</small></span><strong>{money(item.count * item.price)} تومان</strong></div>)}</div>
      <div className="detail-total"><span>جمع کل</span><b>{money(invoice?.total || 0)} تومان</b></div>
      <div className="detail-balance"><span>بیعانه: {money(invoice?.deposit || 0)}</span><strong>مانده: {money(Math.max(0, (invoice?.total || 0) - (invoice?.deposit || 0)))} تومان</strong></div>
    </section>

    <section className="detail-secondary"><button onClick={() => setEditing(true)}><Edit2 className="w-4 h-4" />ویرایش پروژه و فاکتور</button>{!deleting ? <button onClick={() => setDeleting(true)} className="danger"><Trash2 className="w-4 h-4" />حذف پروژه</button> : <div className="inline-confirm"><span>پروژه برای همیشه حذف شود؟</span><button onClick={() => setDeleting(false)}>نه</button><button onClick={() => { onDelete(project.id); onBack(); }} className="danger">بله، حذف</button></div>}</section>
  </div>;
};
