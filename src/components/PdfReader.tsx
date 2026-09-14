import React from 'react';
import { ArrowRight, Download, Share2, FileText } from 'lucide-react';
import { PdfDocument } from '../services/pdfGenerator';

export const PdfReader: React.FC<{ document: PdfDocument; onClose: () => void }> = ({ document, onClose }) => {
  const share = async () => {
    const file = new File([document.blob], document.fileName, { type: 'application/pdf' });
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) await navigator.share({ title: document.fileName, files: [file] });
    else { const a = window.document.createElement('a'); a.href = document.url; a.download = document.fileName; a.click(); }
  };
  return <section className="card overflow-hidden" aria-label="نمایش PDF">
    <header className="flex items-center gap-2 p-3 border-b border-line bg-surface sticky top-0 z-10">
      <button type="button" onClick={onClose} className="icon-button" aria-label="بازگشت"><ArrowRight className="w-5 h-5" /></button>
      <span className="w-9 h-9 rounded-xl grid place-items-center bg-surface2 text-gold"><FileText className="w-4 h-4" /></span>
      <div className="flex-1 min-w-0"><b className="block text-[13px] truncate">{document.fileName}</b><small className="text-muted">{document.pages.length.toLocaleString('fa-IR')} صفحه، داخل برنامه</small></div>
      <a href={document.url} download={document.fileName} className="icon-button" aria-label="دانلود PDF"><Download className="w-4 h-4" /></a>
      <button type="button" onClick={() => share().catch(() => {})} className="btn btn-primary px-4"><Share2 className="w-4 h-4" />ارسال</button>
    </header>
    <div className="max-h-[68vh] overflow-y-auto bg-[var(--color-surface2)] p-2 sm:p-4 space-y-3">
      {document.pages.map((page, index) => <figure key={index} className="m-0"><img src={page} alt={`صفحه ${index + 1}`} className="block w-full h-auto shadow-sm" /><figcaption className="text-center text-[10px] text-muted mt-1">صفحه {(index + 1).toLocaleString('fa-IR')}</figcaption></figure>)}
    </div>
  </section>;
};
