import React from 'react';
import { SimpleTask } from './types';
import GanttTask from './GanttTask';
import { COLORS, ROW_HEIGHT, TASK_HEIGHT } from './constants';

interface TimelineProps {
  hourMarkers: { position: number; time: Date }[];
  tasks: SimpleTask[];
  calculateTaskPosition: (task: SimpleTask) => number;
  calculateTaskWidth: (duration: number) => number;
}

const Timeline: React.FC<TimelineProps> = ({
  hourMarkers,
  tasks,
  calculateTaskPosition,
  calculateTaskWidth
}) => {
  const getTaskIndex = (task: SimpleTask): number => {
    return tasks.findIndex(t => t.id === task.id);
  };

  return (
    <div className="relative bg-white min-h-full w-full">
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
        className="absolute top-0 bottom-0 w-px bg-gantt-today"
        style={{ 
          left: `${(new Date().getHours() / 24) * 100}%`,
        }}
      />

      {tasks.map((task, index) => (
        <GanttTask
          key={task.id}
          task={task}
          index={getTaskIndex(task)}
          calculateTaskPosition={calculateTaskPosition}
          calculateTaskWidth={calculateTaskWidth}
          ROW_HEIGHT={ROW_HEIGHT}
          TASK_HEIGHT={TASK_HEIGHT}
          INDENT_WIDTH={20}
        />
      ))}
    </div>
  );
};

export default Timeline;