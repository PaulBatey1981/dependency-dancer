import React from 'react';
import { format } from 'date-fns';
import { ViewMode } from '../utils/viewModeUtils';

interface TimelineHeaderProps {
  viewStart: Date;
  viewMode: ViewMode;
  timelineWidth: number;
}

const TimelineHeader = ({ viewStart, viewMode, timelineWidth }: TimelineHeaderProps) => {
  const getTimeMarkers = () => {
    const markers = [];
    const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
    const format_string = viewMode === 'day' ? 'HH:mm' : viewMode === 'week' ? 'EEE' : 'MMM d';
    
    for (let i = 0; i <= intervals; i++) {
      markers.push({
        position: (i / intervals) * timelineWidth,
        label: format(
          new Date(viewStart.getTime() + (
            viewMode === 'day' ? i * 60 * 60 * 1000 :
            viewMode === 'week' ? i * 24 * 60 * 60 * 1000 :
            i * 7 * 24 * 60 * 60 * 1000
          )),
          format_string
        )
      });
    }
    return markers;
  };

  return (
    <div className="h-8 border-b bg-gray-50 relative">
      {getTimeMarkers().map((marker, index) => (
        <div
          key={index}
          className="absolute top-0 bottom-0 border-l border-gray-200 text-xs text-gray-500"
          style={{ left: marker.position }}
        >
          <span className="px-1">{marker.label}</span>
        </div>
      ))}
    </div>
  );
};

export default TimelineHeader;