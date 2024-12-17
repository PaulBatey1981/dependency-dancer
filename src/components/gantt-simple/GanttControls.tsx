import { Button } from '@/components/ui/button';
import { ViewMode } from './utils/viewModeUtils';

interface GanttControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSnapToNow: () => void;
}

const GanttControls = ({ viewMode, onViewModeChange, onSnapToNow }: GanttControlsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="space-x-2">
        <Button
          variant={viewMode === 'day' ? 'default' : 'outline'}
          onClick={() => onViewModeChange('day')}
        >
          Daily View
        </Button>
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          onClick={() => onViewModeChange('week')}
        >
          Weekly View
        </Button>
        <Button
          variant={viewMode === 'month' ? 'default' : 'outline'}
          onClick={() => onViewModeChange('month')}
        >
          Monthly View
        </Button>
      </div>
      <Button onClick={onSnapToNow}>
        Snap to Now
      </Button>
    </div>
  );
};

export default GanttControls;