import React from 'react';
import { Lock } from 'lucide-react';
import { SimpleTask } from './types';

interface GanttTaskProps {
  task: SimpleTask;
  index: number;
  calculateTaskPosition: (task: SimpleTask) => number;
  calculateTaskWidth: (duration: number) => number;
  ROW_HEIGHT: number;
  TASK_HEIGHT: number;
  INDENT_WIDTH: number;
}

const GanttTask: React.FC<GanttTaskProps> = ({
  task,
  index,
  calculateTaskPosition,
  calculateTaskWidth,
  ROW_HEIGHT,
  TASK_HEIGHT,
  INDENT_WIDTH,
}) => {
  console.log(`Rendering task ${task.id} at position ${calculateTaskPosition(task)}`);
  
  const taskPosition = calculateTaskPosition(task);
  const taskWidth = calculateTaskWidth(task.duration);
  
  console.log(`Task ${task.id} width: ${taskWidth}%`);
  
  return (
    <div
      className={`absolute ${
        task.type === 'lineitem' 
          ? 'bg-blue-50 border border-blue-200 font-semibold' 
          : 'bg-blue-500'
      } rounded-sm text-sm ${
        task.type === 'lineitem' ? 'text-blue-800' : 'text-white'
      } flex items-center`}
      style={{
        left: task.type === 'lineitem' ? 0 : `${taskPosition}%`,
        top: index * ROW_HEIGHT + ((ROW_HEIGHT - TASK_HEIGHT) / 2),
        width: task.type === 'lineitem' 
          ? '100%'
          : `${taskWidth}%`,
        height: TASK_HEIGHT,
        paddingLeft: task.type === 'lineitem' ? '0.5rem' : '0.25rem',
        paddingRight: task.type === 'lineitem' ? INDENT_WIDTH : 0,
      }}
    >
      <div className="px-1.5 py-0.5 truncate flex-1">
        {task.name}
      </div>
      {task.isFixed && (
        <Lock className="w-4 h-4 mr-2 text-yellow-500" />
      )}
    </div>
  );
};

export default GanttTask;