import React from 'react';
import { format } from 'date-fns';

interface GanttHeaderProps {
  hourMarkers: { position: number; time: Date }[];
}

const GanttHeader: React.FC<GanttHeaderProps> = ({ hourMarkers }) => {
  return (
    <div className="h-8 border-b bg-gray-50 relative">
      <div className="min-w-[300px] border-r absolute left-0 top-0 bottom-0 bg-gray-50" />
      <div className="absolute inset-0 ml-[300px]">
        {hourMarkers.map((marker, index) => (
          <div
            key={index}
            className="absolute top-0 bottom-0 border-l border-gray-200 text-xs text-gray-500"
            style={{ left: `${marker.position}%` }}
          >
            {format(marker.time, 'HH:mm')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttHeader;