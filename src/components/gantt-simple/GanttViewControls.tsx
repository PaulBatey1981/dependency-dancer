import { Button } from "@/components/ui/button";

interface GanttViewControlsProps {
  viewMode: 'day' | 'week' | 'month';
  onViewModeChange: (mode: 'day' | 'week' | 'month') => void;
}

const GanttViewControls = ({ viewMode, onViewModeChange }: GanttViewControlsProps) => {
  return (
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
  );
};

export default GanttViewControls;