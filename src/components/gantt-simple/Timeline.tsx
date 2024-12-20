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
  const isTaskVisible = (task: SimpleTask): boolean => {
    if (!task.parentId) return true;
    
    const parent = tasks.find(t => t.id === task.parentId);
    if (!parent) return true;
    
    return parent.isExpanded ? isTaskVisible(parent) : false;
  };

  const getVisibleTasksInOrder = () => {
    const visibleItems: SimpleTask[] = [];
    
    const processTask = (task: SimpleTask) => {
      if (!isTaskVisible(task)) return;
      
      visibleItems.push(task);
      
      if (task.children && task.isExpanded) {
        task.children.forEach(childId => {
          const childTask = tasks.find(t => t.id === childId);
          if (childTask) {
            processTask(childTask);
          }
        });
      }
    };
    
    // Process root tasks (those without parents)
    tasks.filter(t => !t.parentId).forEach(processTask);
    
    return visibleItems;
  };

  const visibleTasks = getVisibleTasksInOrder();
  const totalHeight = Math.max(visibleTasks.length * ROW_HEIGHT, ROW_HEIGHT);

  return (
    <div 
      className="relative w-full" 
      style={{ height: totalHeight }}
    >
      {/* Grid lines */}
      {hourMarkers.map((marker, index) => (
        <div
          key={index}
          className="absolute top-0 bottom-0 border-l h-full"
          style={{ 
            left: `${marker.position}%`,
            borderColor: COLORS.gridLine
          }}
        />
      ))}

      {/* Today line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-gantt-today h-full"
        style={{ 
          left: `${(new Date().getHours() / 24) * 100}%`
        }}
      />

      {/* Task bars */}
      {visibleTasks.map((task, index) => (
        <GanttTask
          key={task.id}
          task={task}
          index={index}
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