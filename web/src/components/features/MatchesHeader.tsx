import { Chip } from '../ui/Chip';

type ViewMode = 'day' | 'group';

type MatchesHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  title?: string;
};

export const MatchesHeader = ({
  viewMode,
  onViewModeChange,
  title = 'Matches',
}: MatchesHeaderProps) => {
  return (
    <div className="sticky top-16 md:top-0 z-10 -mx-4 mb-6 bg-black/80 px-4 py-4 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold leading-none">{title}</h2>

        <div className="flex items-center gap-2">
          <Chip
            active={viewMode === 'day'}
            onClick={() => onViewModeChange('day')}
          >
            By Day
          </Chip>

          <Chip
            active={viewMode === 'group'}
            onClick={() => onViewModeChange('group')}
          >
            By Group
          </Chip>
        </div>
      </div>
    </div>
  );
};
