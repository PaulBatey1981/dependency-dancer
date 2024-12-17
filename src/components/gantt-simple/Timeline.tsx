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
  // Helper function to check if a task should be visible based on parent's expanded state
  const isTaskVisible = (task: SimpleTask): boolean => {
    if (!task.parentId) return true;
    
    const parent = tasks.find(t => t.id === task.parentId);
    if (!parent) return true;
    
    return parent.isExpanded ? isTaskVisible(parent) : false;
  };

  // Get visible tasks based on hierarchy
  const visibleTasks = tasks.filter(isTaskVisible);

  const getTaskIndex = (task: SimpleTask): number => {
    return visibleTasks.findIndex(t => t.id === task.id);
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

      {visibleTasks.map((task, index) => (
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