import { useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import GanttTimelineHeader from './GanttTimelineHeader';
import GanttTask from './GanttTask';
import GanttDependencyLine from './GanttDependencyLine';
import { SimpleTask } from './types';

const HOUR_WIDTH = 50;
const ROW_HEIGHT = 40;
const TASK_HEIGHT = 32;
const INDENT_WIDTH = 20;
const MIN_HOURS_DISPLAY = 12;

const sampleTasks: SimpleTask[] = [
  // MWB Production Line Item (intentionally misaligned for testing)
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
    isFixed: true
  },
  {
    id: 'task2',
    name: 'Cut Boards',
    startTime: new Date('2024-03-20T08:00:00'), // Intentionally starts before Print Materials
    duration: 3,
    type: 'task',
    parentId: 'lineitem1',
    dependencies: ['task1']
  },
  {
    id: 'task3',
    name: 'Assembly',
    startTime: new Date('2024-03-20T14:00:00'),
    duration: 4,
    type: 'task',
    parentId: 'lineitem1',
    dependencies: ['task2']
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
    dependencies: ['task4']
  }
];

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<SimpleTask[]>(sampleTasks);

  const earliestStart = new Date(Math.min(...tasks.map(t => t.startTime.getTime())));
  const latestEnd = new Date(Math.max(
    ...tasks.map(t => t.startTime.getTime() + t.duration * 3600000)
  ));

  const totalTaskHours = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60));
  const totalHours = Math.max(totalTaskHours, MIN_HOURS_DISPLAY);
  const timelineWidth = totalHours * HOUR_WIDTH;

  const calculateTaskPosition = (task: SimpleTask) => {
    const hoursFromStart = (task.startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    return hoursFromStart * HOUR_WIDTH;
  };

  const calculateTaskWidth = (duration: number) => {
    return duration * HOUR_WIDTH;
  };

  const handleReschedule = () => {
    console.log('Reschedule button clicked');
    const newTasks = [...tasks];
    const processedTasks = new Set<string>();
    
    const rescheduleTask = (taskId: string) => {
      console.log(`Processing task ${taskId} for rescheduling`);
      if (processedTasks.has(taskId)) return;
      
      const task = newTasks.find(t => t.id === taskId);
      if (!task || task.isFixed) {
        console.log(`Task ${taskId} is either fixed or not found - skipping`);
        return;
      }
      
      // Process dependencies first
      task.dependencies?.forEach(depId => {
        console.log(`Processing dependency ${depId} for task ${taskId}`);
        rescheduleTask(depId);
      });
      
      // Find the latest end time of dependencies
      const latestDependencyEnd = task.dependencies?.reduce((latest, depId) => {
        const dep = newTasks.find(t => t.id === depId);
        if (!dep) return latest;
        const endTime = new Date(dep.startTime.getTime() + dep.duration * 3600000);
        console.log(`Dependency ${depId} ends at ${endTime}`);
        return endTime.getTime() > latest.getTime() ? endTime : latest;
      }, new Date(0));
      
      if (latestDependencyEnd && latestDependencyEnd.getTime() > 0) {
        const oldStartTime = task.startTime;
        task.startTime = new Date(latestDependencyEnd);
        console.log(`Moved task ${taskId} from ${oldStartTime} to ${task.startTime}`);
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
    toast({
      title: "Tasks Rescheduled",
      description: "All tasks have been rescheduled according to their dependencies.",
    });
  };

  // Generate hour markers
  const hourMarkers = Array.from({ length: totalHours + 1 }).map((_, index) => {
    const markerTime = new Date(earliestStart.getTime() + index * 60 * 60 * 1000);
    const position = (index / totalHours) * 100;
    return { position, time: markerTime };
  });

  return (
    <div className="space-y-4">
      <Button onClick={handleReschedule} className="ml-4">
        Reschedule Tasks
      </Button>

      <div className="h-[400px] border rounded-lg w-full">
        <GanttTimelineHeader hourMarkers={hourMarkers} />

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
            {tasks.map(task => 
              task.type === 'task' && task.dependencies?.map(depId => {
                const dependencyTask = tasks.find(t => t.id === depId);
                if (!dependencyTask) return null;
                
                return (
                  <GanttDependencyLine
                    key={`${depId}-${task.id}`}
                    dependencyTask={dependencyTask}
                    currentTask={task}
                    calculateTaskPosition={calculateTaskPosition}
                    calculateTaskWidth={calculateTaskWidth}
                    tasks={tasks}
                    TASK_HEIGHT={TASK_HEIGHT}
                    ROW_HEIGHT={ROW_HEIGHT}
                    INDENT_WIDTH={INDENT_WIDTH}
                  />
                );
              })
            )}

            {/* Task Bars */}
            {tasks.map((task, index) => (
              <GanttTask
                key={task.id}
                task={task}
                index={index}
                calculateTaskPosition={calculateTaskPosition}
                calculateTaskWidth={calculateTaskWidth}
                ROW_HEIGHT={ROW_HEIGHT}
                TASK_HEIGHT={TASK_HEIGHT}
                INDENT_WIDTH={INDENT_WIDTH}
              />
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