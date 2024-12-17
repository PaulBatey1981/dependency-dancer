import React from 'react';
import { format } from 'date-fns';

interface GanttHeaderProps {
  hourMarkers: { position: number; time: Date }[];
}

const GanttHeader: React.FC<GanttHeaderProps> = ({ hourMarkers }) => {
  return (
    <div className="h-8 border-b bg-gray-50 relative">
      {hourMarkers.map((marker, index) => (
        <div
          key={index}
          className="absolute top-0 bottom-0 border-l border-gray-200 text-xs text-gray-500"
          style={{ left: `${marker.position}%` }}
        >
          {marker.time.getHours().toString().padStart(2, '0')}:00
        </div>
      ))}
    </div>
  );
};

export default GanttHeader;