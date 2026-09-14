import React, { useEffect, useState } from 'react';
import { ArrowLeft, Lightbulb, X } from 'lucide-react';

const KEY = 'pd_section_guides_v1';
function read(): Record<string, boolean> { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function write(v: Record<string, boolean>) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} }

export const SectionGuide: React.FC<{ section: string; title: string; text: string; onDone?: () => void }> = ({ section, title, text, onDone }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const seen = read(); if (!seen[section]) setVisible(true); }, [section]);
  const close = () => { const all = read(); all[section] = true; write(all); setVisible(false); onDone?.(); };
  if (!visible) return null;
  return <div className="card p-4 relative overflow-hidden a-fade-up" style={{ borderColor: 'color-mix(in srgb, var(--color-gold) 55%, var(--color-line))', background: 'color-mix(in srgb, var(--color-gold) 8%, var(--color-surface))' }}>
    <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full blur-2xl" style={{ background: 'color-mix(in srgb, var(--color-gold) 22%, transparent)' }} />
    <button onClick={close} className="absolute top-3 left-3 p-1.5 rounded-full text-muted" aria-label="بستن راهنما"><X className="w-4 h-4" /></button>
    <div className="relative flex items-start gap-3"><span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-gold)', color: '#241B0C' }}><Lightbulb className="w-4 h-4" /></span><div className="pl-5"><span className="text-[10px] font-extrabold text-gold">راهنمای این بخش</span><h3 className="font-extrabold text-[14px] mt-1">{title}</h3><p className="text-[11px] text-muted leading-relaxed mt-1.5">{text}</p><button onClick={close} className="flex items-center gap-1 text-[11px] font-bold text-gold mt-2.5">فهمیدم <ArrowLeft className="w-3.5 h-3.5" /></button></div></div>
  </div>;
};
