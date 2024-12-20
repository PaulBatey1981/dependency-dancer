import React from 'react';
import { SimpleTask } from './types';
import TaskBar from './TaskBar';
import { COLORS, ROW_HEIGHT } from './constants';

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
    const taskMap = new Map<string, SimpleTask>();
    
    const processTask = (task: SimpleTask) => {
      if (!taskMap.has(task.id)) {
        console.log(`Processing task for timeline: ${task.name} (${task.id})`);
        taskMap.set(task.id, task);
        
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
    
    // Start with line items only
    const lineItems = tasks.filter(t => t.type === 'lineitem');
    lineItems.forEach(processTask);
    
    const visibleTasks = Array.from(taskMap.values());
    console.log('Visible tasks in timeline:', visibleTasks.map(t => ({ id: t.id, name: t.name })));
    return visibleTasks;
  };

  const visibleTasks = getVisibleTasksInOrder();
  const totalHeight = Math.max(visibleTasks.length * ROW_HEIGHT, ROW_HEIGHT);

  return (
    <div 
      className="relative w-full" 
      style={{ height: totalHeight }}
    >
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

      <div
        className="absolute top-0 bottom-0 w-px bg-gantt-today h-full"
        style={{ 
          left: `${(new Date().getHours() / 24) * 100}%`
        }}
      />

      {visibleTasks.map((task, index) => {
        const position = calculateTaskPosition(task);
        const width = calculateTaskWidth(task.duration);
        
        console.log(`Rendering task ${task.id} at position ${position}`);
        console.log(`Task ${task.id} position: ${position}`);
        console.log(`Task ${task.id} width: ${width}%`);
        
        return (
          <TaskBar
            key={task.id}
            task={task}
            position={position}
            width={width}
            rowIndex={index}
            level={0}
            onToggleExpand={(taskId) => {
              const taskToToggle = tasks.find(t => t.id === taskId);
              if (taskToToggle) {
                taskToToggle.isExpanded = !taskToToggle.isExpanded;
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default Timeline;