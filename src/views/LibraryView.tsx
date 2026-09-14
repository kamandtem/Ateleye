import React from 'react';
import { EMPTY_FILTERS, FilterState, Pose } from '../types/pose';
import { Filters } from '../components/Filters';
import { PoseCard } from '../components/PoseCard';
import { EmptyState } from '../components/EmptyState';
import { SearchX } from 'lucide-react';
import { SectionGuide } from '../components/SectionGuide';

interface Props {
  poses: Pose[];
  filters: FilterState;
  onFilters: (f: FilterState) => void;
  favoriteIds: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (p: Pose) => void;
  onDelete: (p: Pose) => void;
  onAddToProject: (p: Pose) => void;
}

export const LibraryView: React.FC<Props> = ({
  poses,
  filters,
  onFilters,
  favoriteIds,
  onToggleFavorite,
  onSelect,
  onDelete,
  onAddToProject,
}) => (
  <div className="space-y-4">
    <SectionGuide section="library" title="کتابخانه ژست‌ها" text="با جستجو، مترادف‌ها، غلط‌های تایپی، لوکیشن، نوع و سختی، سریع به ژست مناسب برس." />
    <Filters filters={filters} onChange={onFilters} total={poses.length} />

    {poses.length === 0 ? (
      <EmptyState
        icon={SearchX}
        title="ژستی با این فیلترها پیدا نشد"
        text="فیلترها را ساده‌تر کنید یا عبارت جستجو را کوتاه‌تر بنویسید."
        action={{ label: 'پاک کردن فیلترها', onClick: () => onFilters({ ...EMPTY_FILTERS }) }}
      />
    ) : (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {poses.map((p) => (
          <PoseCard
            key={p.id}
            pose={p}
            isFavorite={favoriteIds.includes(p.id)}
            onToggleFavorite={onToggleFavorite}
            onSelect={onSelect}
            onDelete={onDelete}
            onAddToProject={onAddToProject}
          />
        ))}
      </div>
    )}
  </div>
);
