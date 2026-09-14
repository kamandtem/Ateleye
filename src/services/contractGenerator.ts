import { OfficeProject, StudioProfile } from '../types/pose';

const fa = (n: number) => n.toLocaleString('fa-IR');
const esc = (value?: string | number) => String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] || c));
const formatDate = (iso?: string) => iso ? new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${iso}T12:00:00`)) : '................';

const TERMS = [
  'در صورت بی‌احترامی یا دخالت اطرافیان در کار عوامل اجرایی، استودیو می‌تواند فرایند عکاسی و فیلم‌برداری را متوقف کند.',
  'تحویل نهایی سفارش فقط پس از تسویه کامل انجام می‌شود.',
  'پرداخت اقساطی فقط با ارائه چک صیادی و تسویه کامل پیش‌پرداخت تا یک هفته پیش از مراسم امکان‌پذیر است.',
  'سبک خاص عکاسی یا فیلم‌برداری باید پیش از مراسم به استودیو اعلام و در بخش توضیحات ثبت شود.',
  'پس از تحویل نهایی، استودیو مجاز به حذف فایل‌هاست. در صورت مراجعه‌نکردن، فایل‌ها حداکثر شش ماه نگهداری می‌شوند.',
  'زمان تحویل آلبوم، دو تا سه ماه پس از تسویه کامل است.',
  'هزینه ایاب‌وذهاب و پذیرایی پرسنل بر عهده سفارش‌دهنده است.',
  'لغو قرارداد تا ۳۰ روز پیش از جشن پس از کسر هزینه‌های قانونی ممکن است. پس از آن پیش‌پرداخت قابل استرداد نیست.',
  'تغییر تاریخ مراسم تا ۶۰ روز بدون افزایش هزینه است. پس از آن هزینه‌ها با نرخ جدید محاسبه می‌شوند.',
  'آرشیو کامل عکس و فیلم متعلق به استودیو است و تحویل آن فقط در صورت درج در فاکتور یا پرداخت هزینه جداگانه انجام می‌شود.',
  'هر سفارش یا توافق ویژه فقط در صورتی معتبر است که در این قرارداد ثبت شده باشد.',
  'اگر تسویه در موعد مقرر انجام نشود، قیمت چاپ، صحافی و سایر خدمات با نرخ روز محاسبه می‌شود.',
];

function invoiceTable(project: OfficeProject) {
  const invoice = project.ceremonyInvoice;
  const items = invoice?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.count * item.price, 0);
  const discount = invoice?.discount || 0;
  const total = invoice?.total ?? Math.max(0, subtotal - discount);
  const deposit = invoice?.deposit || 0;
  const rows = items.map((item, i) => `<tr><td>${fa(i + 1)}</td><td class="desc">${esc(item.name)}</td><td>${fa(item.count)}</td><td>${fa(item.price)}</td><td>${fa(item.count * item.price)}</td></tr>`).join('');
  return `<table><thead><tr><th>ردیف</th><th class="desc">شرح خدمت یا تجهیز</th><th>تعداد</th><th>فی، تومان</th><th>جمع، تومان</th></tr></thead><tbody>${rows || '<tr><td colspan="5">هنوز ردیفی ثبت نشده است.</td></tr>'}</tbody></table>
  <div class="totals"><p><span>جمع خدمات</span><b>${fa(subtotal)} تومان</b></p>${discount ? `<p><span>تخفیف</span><b>${fa(discount)} تومان</b></p>` : ''}<p class="grand"><span>مبلغ قرارداد</span><b>${fa(total)} تومان</b></p><p><span>پیش‌پرداخت</span><b>${fa(deposit)} تومان</b></p><p><span>مانده</span><b>${fa(Math.max(0, total - deposit))} تومان</b></p></div>`;
}

function baseStyles() {
  return `@page{size:A4;margin:13mm}*{box-sizing:border-box}body{margin:0;color:#201b24;background:#fff;font-family:Tahoma,'Segoe UI',sans-serif;direction:rtl;font-size:11px;line-height:1.8}.page{min-height:268mm;position:relative;padding-bottom:24mm}.page+.page{page-break-before:always}.brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:2px solid #201b24}.brand-main{display:flex;align-items:center;gap:10px}.logo{width:44px;height:44px;object-fit:contain;border-radius:8px}.brand h1{margin:0;font-size:17px}.brand p,.doc-meta p{margin:0;color:#675e6b}.doc-meta{text-align:left}.title{text-align:center;margin:20px 0 14px}.title h2{margin:0;font-size:20px}.title p{margin:2px 0;color:#675e6b}.lead{padding:12px 14px;background:#f4f0ea;border-radius:10px}.facts{display:grid;grid-template-columns:1fr 1fr;gap:7px 18px;margin:14px 0}.fact{display:flex;gap:5px;padding-bottom:5px;border-bottom:1px solid #ded8df}.fact span{color:#675e6b}.fact b{font-weight:700}.section{margin-top:15px}.section h3{margin:0 0 7px;font-size:13px}.terms{margin:0;padding-right:20px}.terms li{margin-bottom:4px}table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{padding:7px 5px;border:1px solid #d7d0d9;text-align:center}th{background:#2c2630;color:#fff;font-size:10px}.desc{text-align:right;min-width:170px}.totals{width:48%;margin:10px 0 0 auto}.totals p{display:flex;justify-content:space-between;margin:0;padding:4px 8px;border-bottom:1px solid #ded8df}.totals .grand{background:#f4f0ea;font-size:12px}.notes{min-height:56px;padding:9px;border:1px solid #d7d0d9;border-radius:8px;white-space:pre-wrap}.signatures{position:absolute;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;text-align:center}.signature{padding-top:8px;border-top:1px solid #918994;min-height:45px}.footer{margin-top:15px;padding-top:8px;border-top:1px solid #ded8df;text-align:center;color:#675e6b;font-size:9px}.payment{display:flex;gap:8px}.payment span{flex:1;padding:7px;text-align:center;border:1px solid #d7d0d9;border-radius:7px}.payment .on{background:#2c2630;color:#fff}@media print{button{display:none!important}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`;
}

function header(profile: StudioProfile | null, title: string, project: OfficeProject) {
  return `<header class="brand"><div class="brand-main">${profile?.logo ? `<img class="logo" src="${profile.logo}" alt="لوگو">` : ''}<div><h1>${esc(profile?.name || 'استودیو عکاسی و فیلم‌برداری')}</h1><p>${esc(profile?.address || '')}</p></div></div><div class="doc-meta"><p>${title}</p><p>${esc(project.name)}</p></div></header>`;
}

export function generateContractHTML(project: OfficeProject, profile: StudioProfile | null, mode: 'contract' | 'invoice' | 'both' = 'both'): string {
  const c = project.customer || {};
  const ceremony = project.ceremony;
  const contractPage = `<section class="page">${header(profile, 'قرارداد خدمات', project)}<div class="title"><h2>قرارداد خدمات عکاسی و فیلم‌برداری</h2><p>این قرارداد بر اساس خدمات تأییدشده در فاکتور تنظیم شده است.</p></div><p class="lead">این قرارداد میان <b>${esc(profile?.name || 'استودیو')}</b> و آقای <b>${esc(c.groomName || '................')}</b> با کد ملی ${esc(c.groomNationalId || '................')} و خانم <b>${esc(c.brideName || '................')}</b> با کد ملی ${esc(c.brideNationalId || '................')} برای ارائه خدمات ${esc(project.eventType || 'مراسم')} منعقد می‌شود.</p><div class="facts"><p class="fact"><span>تاریخ مراسم:</span><b>${formatDate(ceremony?.date)}</b></p><p class="fact"><span>محل:</span><b>${esc(ceremony?.location || '................')}</b></p><p class="fact"><span>ساعت اجرا:</span><b>${esc(project.startTime || '....')} تا ${esc(project.endTime || '....')}</b></p><p class="fact"><span>تماس زوج:</span><b>${esc([c.bridePhone, c.groomPhone].filter(Boolean).join('، ') || '................')}</b></p><p class="fact" style="grid-column:1/-1"><span>نشانی:</span><b>${esc(c.address || '................')}</b></p></div><div class="section"><h3>موضوع و مبلغ قرارداد</h3>${invoiceTable(project)}</div><div class="section"><h3>شرایط قرارداد</h3><ol class="terms">${TERMS.map((term) => `<li>${term}</li>`).join('')}</ol></div><div class="section"><h3>توضیحات و توافق‌های ویژه</h3><div class="notes">${esc(project.contractNotes || 'موردی ثبت نشده است.')}</div></div><div class="section"><h3>شرایط پرداخت</h3><div class="payment">${(['نقد', 'سه ماهه', 'پنج ماهه'] as const).map((p) => `<span class="${project.paymentPlan === p ? 'on' : ''}">${p}</span>`).join('')}</div>${project.overtimeRate ? `<p>هر ساعت اضافه: <b>${fa(project.overtimeRate)} تومان</b></p>` : ''}</div><div class="signatures"><div class="signature">امضای داماد</div><div class="signature">امضای عروس</div><div class="signature">مهر و امضای استودیو</div></div></section>`;
  const invoicePage = `<section class="page">${header(profile, 'پیش‌فاکتور خدمات', project)}<div class="title"><h2>پیش‌فاکتور</h2><p>${formatDate(ceremony?.date)}، ${esc([c.brideName, c.groomName].filter(Boolean).join(' و ') || project.name)}</p></div>${invoiceTable(project)}<div class="section"><h3>توضیحات</h3><div class="notes">این فاکتور پیش از نهایی‌شدن قابل ویرایش است. خدمات نهایی قرارداد دقیقاً از ردیف‌های همین فاکتور گرفته می‌شود.</div></div><div class="footer">${esc(profile?.name)} ${profile?.phone ? ` | ${esc(profile.phone)}` : ''} ${profile?.craftCode ? ` | شماره صنفی: ${esc(profile.craftCode)}` : ''}</div></section>`;
  const body = mode === 'contract' ? contractPage : mode === 'invoice' ? invoicePage : contractPage + invoicePage;
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${mode === 'invoice' ? 'پیش‌فاکتور' : 'قرارداد'} ${esc(project.name)}</title><style>${baseStyles()}</style></head><body>${body}<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));</script></body></html>`;
}

export function openPrintableDocument(project: OfficeProject, profile: StudioProfile | null, mode: 'contract' | 'invoice' | 'both') {
  const html = generateContractHTML(project, profile, mode);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (!win) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode === 'invoice' ? 'فاکتور' : 'قرارداد'}-${project.name}.html`;
    link.click();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
