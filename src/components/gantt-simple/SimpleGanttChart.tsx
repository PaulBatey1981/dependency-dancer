import { useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import TaskBar from './TaskBar';
import Timeline from './Timeline';
import { SimpleTask } from './types';
import { HOUR_WIDTH, ROW_HEIGHT, MIN_HOURS_DISPLAY } from './constants';

const sampleTasks: SimpleTask[] = [
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
    startTime: new Date('2024-03-20T08:00:00'),
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
    return (hoursFromStart / totalHours) * 100;
  };

  const calculateTaskWidth = (duration: number) => {
    return (duration / totalHours) * 100;
  };

  const handleReschedule = () => {
    console.log('Reschedule button clicked');
    // ... keep existing code (rescheduling logic)
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
        <div className="h-8 border-b bg-gray-50 relative">
          {hourMarkers.map((marker, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 border-l border-gray-200 text-xs text-gray-500"
              style={{ left: `${marker.position}%` }}
            >
              {marker.time.getHours().toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        <ScrollArea className="h-[calc(100%-2rem)]">
          <div
            ref={timelineRef}
            style={{ 
              width: `max(${timelineWidth}px, 100%)`,
              minWidth: '100%',
              height: tasks.length * ROW_HEIGHT
            }}
          >
            <Timeline hourMarkers={hourMarkers}>
              {tasks.map((task, index) => (
                <TaskBar
                  key={task.id}
                  task={task}
                  position={calculateTaskPosition(task)}
                  width={calculateTaskWidth(task.duration)}
                  verticalPosition={index * ROW_HEIGHT}
                  level={task.type === 'task' ? 1 : 0}
                />
              ))}
            </Timeline>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SimpleGanttChart;
