import React from 'react';
import { Heart, Sparkles, Trash2, Plus } from 'lucide-react';
import { Pose } from '../types/pose';
import { PoseVisual } from './PoseVisual';

interface Props {
  pose: Pose;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (pose: Pose) => void;
  onDelete: (pose: Pose) => void;
  onAddToProject: (pose: Pose) => void;
  compact?: boolean;
}

const PoseCardBase: React.FC<Props> = ({
  pose,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onDelete,
  onAddToProject,
  compact,
}) => (
  <div
    onClick={() => onSelect(pose)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(pose); }}
    role="button"
    tabIndex={0}
    className="card card-hover text-right overflow-hidden flex flex-col w-full cursor-pointer"
    style={{ borderColor: 'var(--color-line)' }}
  >
    <div className={`relative w-full overflow-hidden ${compact ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
      <PoseVisual pose={pose} />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, color-mix(in srgb, var(--color-bg) 92%, transparent), transparent 58%)',
        }}
      />

      {/* سه اکشن عمودی در بالا‑راست: قلب، افزودن به پروژه، حذف */}
      <div className="absolute top-2.5 right-2.5 flex flex-col items-center gap-1.5">
        <span
          onClick={(e) => onToggleFavorite(pose.id, e)}
          className="p-2 rounded-full active:scale-90 transition-transform"
          style={{
            background: isFavorite ? 'var(--color-rose)' : 'rgba(8,6,14,.6)',
            backdropFilter: 'blur(6px)',
          }}
          role="button"
          aria-label="نشان کردن"
        >
          <Heart className="w-3.5 h-3.5" style={{ color: '#fff' }} fill={isFavorite ? '#fff' : 'none'} />
        </span>
        <span
          onClick={(e) => { e.stopPropagation(); onAddToProject(pose); }}
          className="p-2 rounded-full"
          style={{ background: 'rgba(8,6,14,.6)', backdropFilter: 'blur(6px)' }}
          role="button"
          aria-label="افزودن به پروژه"
        >
          <Plus className="w-3.5 h-3.5" style={{ color: 'var(--color-teal)' }} />
        </span>
        <span
          onClick={(e) => { e.stopPropagation(); onDelete(pose); }}
          className="p-2 rounded-full"
          style={{ background: 'rgba(8,6,14,.6)', backdropFilter: 'blur(6px)' }}
          role="button"
          aria-label="حذف ژست"
        >
          <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--color-rose)' }} />
        </span>
      </div>

      {/* نشان‌ک زیردسته باغ عمارت، اگر ژست برای آن تعیین شده باشد */}
      {pose.locations.includes('باغ عمارت') && pose.gardenSubCategory && (
        <span
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(8,6,14,.6)', backdropFilter: 'blur(6px)', color: '#EBD6A8' }}
        >
          {pose.gardenSubCategory}
        </span>
      )}

      {/* فقط نشان‌ک «ژست من» اگر ژست ساخته‌ی کاربر باشد */}
      {pose.isCustom && (
        <span
          className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--color-gold)', color: '#241B0C' }}
        >
          <Sparkles className="w-2.5 h-2.5" />
          ژست من
        </span>
      )}
    </div>

    <div className="p-3 flex-1 flex flex-col justify-between gap-2">
      <div>
        <h3 className="font-bold text-[13px] leading-snug line-clamp-2">{pose.title}</h3>
        <p className="text-[11px] text-muted mt-1 line-clamp-2 leading-relaxed">
          {pose.photographerScript[0] || pose.steps[0]}
        </p>
      </div>

    </div>
  </div>
);

export const PoseCard = React.memo(PoseCardBase);
