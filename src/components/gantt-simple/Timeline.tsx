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
  // Get all visible tasks in the correct order
  const getVisibleTasksInOrder = () => {
    // Create a Map to ensure unique tasks
    const taskMap = new Map<string, SimpleTask>();
    
    // Helper function to process a task and its children
    const processTask = (task: SimpleTask) => {
      if (!taskMap.has(task.id)) {
        console.log(`Processing task for timeline: ${task.name} (${task.id})`);
        taskMap.set(task.id, task);
        
        // If task has children and is expanded, process them
        if (task.children && task.children.length > 0 && task.isExpanded) {
          task.children.forEach(childId => {
            const childTask = tasks.find(t => t.id === childId);
            if (childTask) {
              processTask(childTask);
            }
          });
        }
      }
    };
    
    // Start with root tasks (line items)
    const rootTasks = tasks.filter(t => t.type === 'lineitem');
    rootTasks.forEach(processTask);
    
    return Array.from(taskMap.values());
  };

  const visibleTasks = getVisibleTasksInOrder();
  console.log('Visible tasks in timeline:', visibleTasks.map(t => ({ id: t.id, name: t.name })));
  
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