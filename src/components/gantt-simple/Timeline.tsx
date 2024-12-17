import React from 'react';
import { COLORS } from './constants';

interface TimelineProps {
  hourMarkers: { position: number; time: Date }[];
  children: React.ReactNode;
}

const Timeline: React.FC<TimelineProps> = ({ hourMarkers, children }) => {
  return (
    <div className="relative bg-white min-h-full w-full pt-8">
      {/* Grid lines */}
      {hourMarkers.map((marker, index) => (
        <div
          key={index}
          className="absolute top-0 bottom-0 border-l"
          style={{ 
            left: `${marker.position}%`,
            borderColor: COLORS.gridLine
          }}
        />
      ))}

      {/* Today line */}
      <div
        className="absolute top-0 bottom-0 w-px"
        style={{ 
          left: `${(new Date().getHours() / 24) * 100}%`,
          backgroundColor: COLORS.todayLine
        }}
      />

      {children}
    </div>
  );
};

export default Timeline;