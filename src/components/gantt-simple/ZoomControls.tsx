import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { MIN_ZOOM, MAX_ZOOM } from './constants';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (value: number) => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomChange }) => {
  const handleSliderChange = (value: number[]) => {
    onZoomChange(value[0]);
  };

  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));
    onZoomChange(newZoom);
  };

  return (
    <div className="flex items-center gap-4 w-96">
      <Button
        variant="outline"
        size="icon"
        onClick={() => adjustZoom(-0.1)}
        disabled={zoom <= MIN_ZOOM}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Slider
        value={[zoom]}
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.1}
        onValueChange={handleSliderChange}
        className="flex-1"
      />
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => adjustZoom(0.1)}
        disabled={zoom >= MAX_ZOOM}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ZoomControls;