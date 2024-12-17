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

  // Get visible tasks and maintain hierarchy order
  const getVisibleTasksInOrder = () => {
    const visibleTasks: SimpleTask[] = [];
    
    // Helper function to add tasks recursively
    const addTaskAndChildren = (taskId: string, tasks: SimpleTask[]) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !isTaskVisible(task)) return;
      
      visibleTasks.push(task);
      
      // If task has children and is expanded, add them
      if (task.children && task.isExpanded) {
        task.children.forEach(childId => {
          addTaskAndChildren(childId, tasks);
        });
      }
    };
    
    // Start with root level tasks (those without parents)
    const rootTasks = tasks.filter(t => !t.parentId);
    rootTasks.forEach(task => addTaskAndChildren(task.id, tasks));
    
    return visibleTasks;
  };

  const visibleTasks = getVisibleTasksInOrder();

  const getTaskIndex = (task: SimpleTask): number => {
    return visibleTasks.findIndex(t => t.id === task.id);
  };

  // Calculate the total height needed based on visible tasks
  const totalHeight = visibleTasks.length * ROW_HEIGHT;

  return (
    <div 
      className="relative bg-white w-full"
      style={{ 
        minHeight: '100%',
        height: `${Math.max(totalHeight, 400)}px` // Ensure minimum height of 400px or total task height
      }}
    >
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