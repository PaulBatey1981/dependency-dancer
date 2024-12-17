import React from 'react';
import { format } from 'date-fns';
import { SimpleTask } from './types';
import TaskBar from './TaskBar';
import { ViewMode, calculateTaskPosition } from './utils/viewModeUtils';

interface GanttTimelineProps {
  tasks: SimpleTask[];
  viewMode: ViewMode;
  viewStart: Date;
  timeMarkers: Array<{ date: Date; position: number }>;
}

const GanttTimeline: React.FC<GanttTimelineProps> = ({
  tasks,
  viewMode,
  viewStart,
  timeMarkers
}) => {
  return (
    <div className="relative">
      {/* Grid lines */}
      {timeMarkers.map((marker, index) => (
        <div
          key={index}
          className="absolute top-0 bottom-0 border-l border-gray-200"
          style={{ left: marker.position }}
        >
          <div className="text-xs text-gray-500 px-1">
            {format(marker.date, viewMode === 'day' ? 'HH:mm' : 'MMM d')}
          </div>
        </div>
      ))}

      {/* Task bars */}
      {tasks.map((task, index) => {
        const { left, width } = calculateTaskPosition(task, viewStart, viewMode);
        return (
          <TaskBar
            key={task.id}
            task={task}
            position={left}
            width={width}
            rowIndex={index}
            level={0}
            onToggleExpand={() => {}}
          />
        );
      })}
    </div>
  );
};

export default GanttTimeline;