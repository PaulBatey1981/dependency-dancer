import React from 'react';
import { SimpleTask } from './types';

interface GanttDependencyLineProps {
  dependencyTask: SimpleTask;
  currentTask: SimpleTask;
  calculateTaskPosition: (task: SimpleTask) => number;
  calculateTaskWidth: (duration: number) => number;
  tasks: SimpleTask[];
  TASK_HEIGHT: number;
  ROW_HEIGHT: number;
  INDENT_WIDTH: number;
}

const GanttDependencyLine: React.FC<GanttDependencyLineProps> = ({
  dependencyTask,
  currentTask,
  calculateTaskPosition,
  calculateTaskWidth,
  tasks,
  TASK_HEIGHT,
  ROW_HEIGHT,
  INDENT_WIDTH,
}) => {
  const startX = calculateTaskPosition(dependencyTask) + calculateTaskWidth(dependencyTask.duration);
  const endX = calculateTaskPosition(currentTask);
  const startY = tasks.indexOf(dependencyTask) * ROW_HEIGHT + TASK_HEIGHT / 2;
  const endY = tasks.indexOf(currentTask) * ROW_HEIGHT + TASK_HEIGHT / 2;

  console.log(`Drawing dependency line from ${dependencyTask.id} to ${currentTask.id}`);
  console.log(`Start: (${startX}, ${startY}), End: (${endX}, ${endY})`);

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    >
      <line
        x1={startX + INDENT_WIDTH}
        y1={startY}
        x2={endX + INDENT_WIDTH}
        y2={endY}
        stroke="#9CA3AF"
        strokeWidth="1"
        strokeDasharray="4"
      />
    </svg>
  );
};

export default GanttDependencyLine;