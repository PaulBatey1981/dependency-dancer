import { useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface SimpleTask {
  id: string;
  name: string;
  startTime: Date;
  duration: number; // in hours
  type: 'lineitem' | 'task';
  parentId?: string;
  dependencies?: string[];
  isFixed?: boolean;
}

const HOUR_WIDTH = 50; // pixels per hour
const ROW_HEIGHT = 40;
const TASK_HEIGHT = 32;
const INDENT_WIDTH = 20; // pixels to indent child tasks
const MIN_HOURS_DISPLAY = 12; // Minimum hours to display

const sampleTasks: SimpleTask[] = [
  // MWB Production Line Item
  {
    id: 'lineitem1',
    name: 'MWB Production',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 9,
    type: 'lineitem'
  },
  {
    id: 'task1',
    name: 'Print Materials',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 2,
    type: 'task',
    parentId: 'lineitem1',
    isFixed: true // This task is fixed
  },
  {
    id: 'task2',
    name: 'Cut Boards',
    startTime: new Date('2024-03-20T11:00:00'),
    duration: 3,
    type: 'task',
    parentId: 'lineitem1',
    dependencies: ['task1'] // This task depends on task1
  },
  {
    id: 'task3',
    name: 'Assembly',
    startTime: new Date('2024-03-20T14:00:00'),
    duration: 4,
    type: 'task',
    parentId: 'lineitem1',
    dependencies: ['task2'] // This task depends on task2
  },
  // HWB Production Line Item
  {
    id: 'lineitem2',
    name: 'HWB Production',
    startTime: new Date('2024-03-20T10:00:00'),
    duration: 7,
    type: 'lineitem'
  },
  {
    id: 'task4',
    name: 'Material Preparation',
    startTime: new Date('2024-03-20T10:00:00'),
    duration: 3,
    type: 'task',
    parentId: 'lineitem2'
  },
  {
    id: 'task5',
    name: 'Production Process',
    startTime: new Date('2024-03-20T13:00:00'),
    duration: 4,
    type: 'task',
    parentId: 'lineitem2',
    dependencies: ['task4'] // This task depends on task4
  }
];

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<SimpleTask[]>(sampleTasks);

  // Find the earliest start time among all tasks
  const earliestStart = new Date(Math.min(...tasks.map(t => t.startTime.getTime())));
  
  // Find the latest end time
  const latestEnd = new Date(Math.max(
    ...tasks.map(t => t.startTime.getTime() + t.duration * 3600000)
  ));

  // Calculate total hours for timeline width, ensuring minimum display hours
  const totalTaskHours = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60));
  const totalHours = Math.max(totalTaskHours, MIN_HOURS_DISPLAY);
  
  // Calculate timeline width in pixels
  const timelineWidth = totalHours * HOUR_WIDTH;

  const calculateTaskPosition = (task: SimpleTask) => {
    const hoursFromStart = (task.startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    return hoursFromStart * HOUR_WIDTH;
  };

  const calculateTaskWidth = (duration: number) => {
    return duration * HOUR_WIDTH;
  };

  const handleReschedule = () => {
    const newTasks = [...tasks];
    
    // Sort tasks by dependencies
    const processedTasks = new Set<string>();
    
    const rescheduleTask = (taskId: string) => {
      if (processedTasks.has(taskId)) return;
      
      const task = newTasks.find(t => t.id === taskId);
      if (!task || task.isFixed) return;
      
      // Process dependencies first
      task.dependencies?.forEach(depId => {
        rescheduleTask(depId);
      });
      
      // Find the latest end time of dependencies
      const latestDependencyEnd = task.dependencies?.reduce((latest, depId) => {
        const dep = newTasks.find(t => t.id === depId);
        if (!dep) return latest;
        const endTime = new Date(dep.startTime.getTime() + dep.duration * 3600000);
        return endTime.getTime() > latest.getTime() ? endTime : latest;
      }, new Date(0));
      
      if (latestDependencyEnd && latestDependencyEnd.getTime() > 0) {
        task.startTime = new Date(latestDependencyEnd);
      }
      
      processedTasks.add(taskId);
    };
    
    // Process all tasks
    newTasks.forEach(task => {
      if (task.type === 'task') {
        rescheduleTask(task.id);
      }
    });
    
    setTasks(newTasks);
  };

  // Generate hour markers
  const hourMarkers = Array.from({ length: totalHours + 1 }).map((_, index) => {
    const markerTime = new Date(earliestStart.getTime() + index * 60 * 60 * 1000);
    const position = (index / totalHours) * 100;
    return (
      <div
        key={index}
        className="absolute top-0 bottom-0 border-l border-gray-200 text-xs text-gray-500"
        style={{ left: `${position}%` }}
      >
        {markerTime.getHours().toString().padStart(2, '0')}:00
      </div>
    );
  });

  const renderDependencyLines = (task: SimpleTask) => {
    if (!task.dependencies?.length) return null;

    return task.dependencies.map(depId => {
      const dependencyTask = tasks.find(t => t.id === depId);
      if (!dependencyTask) return null;

      const startX = calculateTaskPosition(dependencyTask) + calculateTaskWidth(dependencyTask.duration);
      const endX = calculateTaskPosition(task);
      const startY = tasks.indexOf(dependencyTask) * ROW_HEIGHT + TASK_HEIGHT / 2;
      const endY = tasks.indexOf(task) * ROW_HEIGHT + TASK_HEIGHT / 2;

      return (
        <svg
          key={`${depId}-${task.id}`}
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
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleReschedule} className="ml-4">
        Reschedule Tasks
      </Button>

      <div className="h-[400px] border rounded-lg w-full">
        {/* Timeline Header */}
        <div className="h-8 border-b bg-gray-50 relative">
          <div className="absolute inset-0">
            {hourMarkers}
          </div>
        </div>

        {/* Timeline Content */}
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div
            ref={timelineRef}
            className="relative"
            style={{ 
              width: `max(${timelineWidth}px, 100%)`,
              minWidth: '100%',
              height: tasks.length * ROW_HEIGHT
            }}
          >
            {/* Dependency Lines */}
            {tasks.map(task => task.type === 'task' && renderDependencyLines(task))}

            {/* Task Bars */}
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`absolute ${
                  task.type === 'lineitem' 
                    ? 'bg-blue-50 border border-blue-200 font-semibold' 
                    : 'bg-blue-500'
                } rounded-sm text-sm ${
                  task.type === 'lineitem' ? 'text-blue-800' : 'text-white'
                } flex items-center`}
                style={{
                  left: task.type === 'task' ? calculateTaskPosition(task) + INDENT_WIDTH : 0,
                  top: index * ROW_HEIGHT + (ROW_HEIGHT - TASK_HEIGHT) / 2,
                  width: task.type === 'task' 
                    ? calculateTaskWidth(task.duration)
                    : '100%',
                  height: TASK_HEIGHT,
                  paddingLeft: task.type === 'lineitem' ? '0.5rem' : '0.25rem',
                  paddingRight: task.type === 'lineitem' ? INDENT_WIDTH : 0,
                }}
              >
                <div className="px-2 py-1 truncate flex-1">
                  {task.name}
                </div>
                {task.isFixed && (
                  <Lock className="w-4 h-4 mr-2 text-yellow-500" />
                )}
              </div>
            ))}

            {/* Row Dividers */}
            {tasks.map((_, index) => (
              <div
                key={`divider-${index}`}
                className="absolute w-full border-b border-gray-100"
                style={{ top: (index + 1) * ROW_HEIGHT }}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SimpleGanttChart;