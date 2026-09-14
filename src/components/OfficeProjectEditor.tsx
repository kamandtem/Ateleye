import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Camera, Check, FileText, MapPin, Minus, Plus, Receipt, Save, Trash2, Users } from 'lucide-react';
import { CameraType, Ceremony, OfficeCustomer, OfficeProject, ProjectInvoice, ServiceType } from '../types/pose';
import { JalaliDatePicker } from './JalaliDatePicker';
import { JalaliDate, jalaliToIso, todayJalali } from '../services/jalali';

type Line = { name: string; count: number; price: number };
const SERVICES: ServiceType[] = ['فیلم‌برداری و تدوین', 'عکاسی باغ', 'عکاسی مراسم', 'فرمالیته شهری', 'فرمالیته اطراف شهر', 'فرمالیته شمال یا جنوب', 'عقد محضری', 'آلبوم', 'چاپ عکس', 'پخش کلیپ در مراسم', 'اسلایدشو و ادیت عکس', 'تحویل آرشیو عکس', 'ورودی آتلیه', 'ورودی باغ و عمارت'];
const EQUIPMENT: CameraType[] = ['دوربین فیلم‌برداری', 'دوربین عکاسی', 'رونین', 'هلی‌شات', 'FPV', 'کرین', 'نور و صدابرداری'];
const STEPS = [
  { title: 'زوج', icon: Users },
  { title: 'مراسم', icon: CalendarDays },
  { title: 'خدمات', icon: Camera },
  { title: 'فاکتور', icon: Receipt },
];

interface Props { project: OfficeProject; onSave: (p: OfficeProject) => void; onClose: () => void; }
const money = (n: number) => n.toLocaleString('fa-IR');
const cleanNumber = (value: string) => Number(value.replace(/[^0-9]/g, '')) || 0;
const dateValue = (iso?: string): JalaliDate => iso ? (() => { const [jy, jm, jd] = iso.split('-').map(Number); return { jy, jm, jd }; })() : todayJalali();

export const OfficeProjectEditor: React.FC<Props> = ({ project, onSave, onClose }) => {
  const existingLines = [...(project.ceremonyInvoice?.items || []), ...(project.formalityInvoice?.items || [])];
  const [step, setStep] = useState(0);
  const [name, setName] = useState(project.name === 'پروژه جدید' ? '' : project.name);
  const [customer, setCustomer] = useState<OfficeCustomer>(project.customer || {});
  const [eventType, setEventType] = useState<OfficeProject['eventType']>(project.eventType || 'عروسی');
  const [date, setDate] = useState(dateValue(project.ceremony?.date || project.formality?.recordDate));
  const [location, setLocation] = useState(project.ceremony?.location || project.formality?.location || '');
  const [startTime, setStartTime] = useState(project.startTime || '۱۶:۰۰');
  const [endTime, setEndTime] = useState(project.endTime || '۲۳:۰۰');
  const [lines, setLines] = useState<Line[]>(existingLines);
  const [deposit, setDeposit] = useState(project.ceremonyInvoice?.deposit || 0);
  const [discount, setDiscount] = useState(project.ceremonyInvoice?.discount || 0);
  const [paymentPlan, setPaymentPlan] = useState<OfficeProject['paymentPlan']>(project.paymentPlan || 'نقد');
  const [overtimeRate, setOvertimeRate] = useState(project.overtimeRate || 0);
  const [notes, setNotes] = useState(project.contractNotes || '');
  const [error, setError] = useState('');

  const selectedServices = SERVICES.filter((x) => lines.some((l) => l.name === x));
  const selectedEquipment = EQUIPMENT.filter((x) => lines.some((l) => l.name === `تجهیزات: ${x}`));
  const subtotal = useMemo(() => lines.reduce((sum, x) => sum + x.count * x.price, 0), [lines]);
  const total = Math.max(0, subtotal - discount);

  const patchCustomer = (key: keyof OfficeCustomer, value: string) => setCustomer((v) => ({ ...v, [key]: value }));
  const toggleLine = (name: string) => setLines((current) => current.some((x) => x.name === name) ? current.filter((x) => x.name !== name) : [...current, { name, count: 1, price: 0 }]);
  const updateLine = (index: number, patch: Partial<Line>) => setLines((current) => current.map((line, i) => i === index ? { ...line, ...patch } : line));

  const next = () => {
    if (step === 0 && !customer.brideName?.trim() && !customer.groomName?.trim() && !name.trim()) { setError('نام زوج یا نام پروژه را وارد کن.'); return; }
    if (step === 1 && !location.trim()) { setError('محل مراسم را وارد کن.'); return; }
    setError('');
    setStep((v) => Math.min(3, v + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = () => {
    const now = Date.now();
    const projectName = name.trim() || [customer.brideName, customer.groomName].filter(Boolean).join(' و ') || 'پروژه جدید';
    const services = Object.fromEntries(SERVICES.map((service) => [service, { checked: selectedServices.includes(service) }]));
    const cameras = Object.fromEntries(EQUIPMENT.map((gear) => [gear, selectedEquipment.includes(gear) ? (lines.find((x) => x.name === `تجهیزات: ${gear}`)?.count || 1) : 0]));
    const ceremony: Ceremony = {
      id: project.ceremony?.id || `cer_${now.toString(36)}`,
      date: jalaliToIso(date), location: location.trim(), services, cameras,
      createdAt: project.ceremony?.createdAt || now, updatedAt: now,
    };
    const invoice: ProjectInvoice = {
      id: project.ceremonyInvoice?.id || `inv_${now.toString(36)}`,
      items: lines.filter((x) => x.name.trim()), deposit, discount, status: 'draft',
      customerName: [customer.brideName, customer.groomName].filter(Boolean).join(' و '),
      total, createdAt: project.ceremonyInvoice?.createdAt || now, updatedAt: now,
    };
    onSave({ ...project, name: projectName, customer, eventType, ceremony, formality: undefined, ceremonyInvoice: invoice, formalityInvoice: undefined, startTime, endTime, overtimeRate, paymentPlan, contractNotes: notes, updatedAt: now });
  };

  return (
    <div className="office-editor pb-28">
      <header className="editor-head">
        <button onClick={onClose} className="icon-button" aria-label="بازگشت"><ArrowRight className="w-5 h-5" /></button>
        <div><p className="text-[10px] text-muted">{project.createdAt === project.updatedAt ? 'پروژه جدید' : 'ویرایش پروژه'}</p><h1 className="text-[18px] font-extrabold">{name || 'مشخصات پروژه'}</h1></div>
      </header>

      <nav className="stepper" aria-label="مراحل ساخت پروژه">
        {STEPS.map(({ title, icon: Icon }, i) => <button key={title} onClick={() => i <= step && setStep(i)} className={`step ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}><span>{i < step ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}</span><small>{title}</small></button>)}
      </nav>

      {error && <p className="form-error">{error}</p>}

      <main className="editor-body">
        {step === 0 && <section className="editor-section a-fade"><SectionTitle title="زوج و پروژه" text="اطلاعاتی که روی فاکتور و قرارداد می‌آید." />
          <Field label="نام پروژه" value={name} onChange={setName} placeholder="مثلاً عروسی نگار و علی" />
          <div className="form-grid"><Field label="نام عروس" value={customer.brideName || ''} onChange={(v) => patchCustomer('brideName', v)} /><Field label="کد ملی عروس" value={customer.brideNationalId || ''} onChange={(v) => patchCustomer('brideNationalId', v)} inputMode="numeric" /><Field label="تلفن عروس" value={customer.bridePhone || ''} onChange={(v) => patchCustomer('bridePhone', v)} inputMode="tel" /></div>
          <div className="form-grid"><Field label="نام داماد" value={customer.groomName || ''} onChange={(v) => patchCustomer('groomName', v)} /><Field label="کد ملی داماد" value={customer.groomNationalId || ''} onChange={(v) => patchCustomer('groomNationalId', v)} inputMode="numeric" /><Field label="تلفن داماد" value={customer.groomPhone || ''} onChange={(v) => patchCustomer('groomPhone', v)} inputMode="tel" /></div>
          <Field label="نشانی" value={customer.address || ''} onChange={(v) => patchCustomer('address', v)} placeholder="نشانی کامل زوج" />
        </section>}

        {step === 1 && <section className="editor-section a-fade"><SectionTitle title="زمان و مکان" text="فقط اطلاعات اجرایی مراسم، بدون حواس‌پرتی." />
          <ChoiceGroup label="نوع پروژه" options={['عقد', 'عروسی', 'عقد و عروسی', 'فرمالیته'] as const} value={eventType} onChange={setEventType} />
          <div><span className="label">تاریخ مراسم</span><JalaliDatePicker value={date} onChange={setDate} /></div>
          <Field label="محل برگزاری" value={location} onChange={setLocation} placeholder="نام تالار، باغ یا نشانی" icon={MapPin} />
          <div className="grid grid-cols-2 gap-3"><Field label="ساعت شروع" value={startTime} onChange={setStartTime} placeholder="۱۶:۰۰" /><Field label="ساعت پایان" value={endTime} onChange={setEndTime} placeholder="۲۳:۰۰" /></div>
        </section>}

        {step === 2 && <section className="editor-section a-fade"><SectionTitle title="خدمات و تجهیزات" text="هر انتخاب مستقیم وارد پیش‌نویس فاکتور می‌شود." />
          <PickList title="خدمات انتخابی" options={SERVICES} selected={selectedServices} onToggle={(x) => toggleLine(x)} />
          <PickList title="تجهیزات پروژه" options={EQUIPMENT} selected={selectedEquipment} onToggle={(x) => toggleLine(`تجهیزات: ${x}`)} equipment lines={lines} onCount={(name, count) => setLines((cur) => cur.map((x) => x.name === `تجهیزات: ${name}` ? { ...x, count } : x))} />
          <button onClick={() => setLines((v) => [...v, { name: '', count: 1, price: 0 }])} className="add-custom"><Plus className="w-4 h-4" />خدمت سفارشی</button>
        </section>}

        {step === 3 && <section className="editor-section a-fade"><SectionTitle title="پیش‌نویس فاکتور" text="قبل از نهایی‌کردن، شرح، تعداد و مبلغ هر ردیف را ویرایش کن." />
          {lines.length === 0 ? <div className="invoice-empty"><FileText className="w-6 h-6" /><p>هنوز خدمتی انتخاب نشده.</p><button onClick={() => setStep(2)}>برگشت به خدمات</button></div> : <div className="invoice-lines">{lines.map((line, i) => <div className="invoice-line" key={`${line.name}-${i}`}><div className="line-main"><input value={line.name} onChange={(e) => updateLine(i, { name: e.target.value })} className="field" aria-label="شرح ردیف" /><button onClick={() => setLines((v) => v.filter((_, j) => j !== i))} className="line-delete" aria-label="حذف ردیف"><Trash2 className="w-4 h-4" /></button></div><div className="line-meta"><Counter value={line.count} onChange={(count) => updateLine(i, { count })} /><label><span>فی، تومان</span><input inputMode="numeric" value={line.price ? money(line.price) : ''} onChange={(e) => updateLine(i, { price: cleanNumber(e.target.value) })} placeholder="۰" /></label><strong>{money(line.count * line.price)}</strong></div></div>)}</div>}
          <button onClick={() => setLines((v) => [...v, { name: '', count: 1, price: 0 }])} className="add-custom"><Plus className="w-4 h-4" />افزودن ردیف</button>
          <div className="invoice-adjustments"><Field label="بیعانه، تومان" value={deposit ? money(deposit) : ''} onChange={(v) => setDeposit(cleanNumber(v))} inputMode="numeric" /><Field label="تخفیف، تومان" value={discount ? money(discount) : ''} onChange={(v) => setDiscount(cleanNumber(v))} inputMode="numeric" /><ChoiceGroup label="روش پرداخت" options={['نقد', 'سه ماهه', 'پنج ماهه'] as const} value={paymentPlan} onChange={setPaymentPlan} /><Field label="هزینه هر ساعت اضافه" value={overtimeRate ? money(overtimeRate) : ''} onChange={(v) => setOvertimeRate(cleanNumber(v))} inputMode="numeric" /><Field label="توضیحات قرارداد" value={notes} onChange={setNotes} placeholder="توافق یا سفارش خاص" /></div>
          <div className="invoice-total"><span><small>جمع فاکتور</small><b>{money(total)} تومان</b></span><span><small>مانده پس از بیعانه</small><b>{money(Math.max(0, total - deposit))} تومان</b></span></div>
        </section>}
      </main>

      <footer className="editor-actions">
        {step > 0 ? <button onClick={() => setStep(step - 1)} className="btn btn-ghost"><ArrowRight className="w-4 h-4" />قبلی</button> : <button onClick={onClose} className="btn btn-ghost">انصراف</button>}
        {step < 3 ? <button onClick={next} className="btn btn-primary flex-1">مرحله بعد<ArrowLeft className="w-4 h-4" /></button> : <button onClick={save} className="btn btn-primary flex-1"><Save className="w-4 h-4" />ذخیره پیش‌نویس</button>}
      </footer>
    </div>
  );
};

const SectionTitle = ({ title, text }: { title: string; text: string }) => <div className="section-title"><h2>{title}</h2><p>{text}</p></div>;
const Field = ({ label, value, onChange, placeholder, inputMode, icon: Icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; icon?: React.ElementType }) => <label className="field-wrap"><span className="label">{label}</span><span className="relative block">{Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />}<input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} className={`field ${Icon ? '!pr-9' : ''}`} /></span></label>;
function ChoiceGroup<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T | undefined; onChange: (v: T) => void }) { return <div><span className="label">{label}</span><div className="choice-grid">{options.map((x) => <button type="button" key={x} onClick={() => onChange(x)} className={value === x ? 'is-on' : ''}>{x}</button>)}</div></div>; }
const PickList = ({ title, options, selected, onToggle, equipment, lines = [], onCount }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void; equipment?: boolean; lines?: Line[]; onCount?: (name: string, count: number) => void }) => <div className="pick-list"><h3>{title}<small>{selected.length.toLocaleString('fa-IR')} انتخاب</small></h3>{options.map((item) => { const on = selected.includes(item); const count = lines.find((x) => x.name === `تجهیزات: ${item}`)?.count || 1; return <div key={item} className={`pick-row ${on ? 'is-on' : ''}`}><button onClick={() => onToggle(item)} className="pick-toggle"><span>{on && <Check className="w-3.5 h-3.5" />}</span>{item}</button>{equipment && on && <Counter value={count} onChange={(n) => onCount?.(item, n)} />}</div>; })}</div>;
const Counter = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => <span className="counter"><button onClick={() => onChange(Math.max(1, value - 1))}><Minus className="w-3 h-3" /></button><b>{value.toLocaleString('fa-IR')}</b><button onClick={() => onChange(value + 1)}><Plus className="w-3 h-3" /></button></span>;
