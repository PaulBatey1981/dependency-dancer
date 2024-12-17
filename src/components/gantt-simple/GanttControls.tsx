import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ZoomControls from './ZoomControls';

interface GanttControlsProps {
  zoom: number;
  onZoomChange: (value: number) => void;
  onSnapToNow: () => void;
}

const GanttControls = ({ zoom, onZoomChange, onSnapToNow }: GanttControlsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <ZoomControls zoom={zoom} onZoomChange={onZoomChange} />
      <Button onClick={onSnapToNow} className="flex items-center gap-2">
        <ArrowRight size={16} />
        Snap to Now
      </Button>
    </div>
  );
};

export default GanttControls;