import { useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SimpleTask {
  id: string;
  name: string;
  startTime: Date;
  duration: number; // in hours
  type: 'lineitem' | 'task';
  parentId?: string;
}

const HOUR_WIDTH = 50; // pixels per hour
const ROW_HEIGHT = 40;
const TASK_HEIGHT = 32;
const INDENT_WIDTH = 20; // pixels to indent child tasks
const MIN_HOURS_DISPLAY = 12; // Minimum hours to display

const sampleTasks: SimpleTask[] = [
  {
    id: 'lineitem1',
    name: 'MWB Production',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 9, // spans the entire duration of child tasks
    type: 'lineitem'
  },
  {
    id: 'task1',
    name: 'Print Materials',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 2,
    type: 'task',
    parentId: 'lineitem1'
  },
  {
    id: 'task2',
    name: 'Cut Boards',
    startTime: new Date('2024-03-20T11:00:00'),
    duration: 3,
    type: 'task',
    parentId: 'lineitem1'
  },
  {
    id: 'task3',
    name: 'Assembly',
    startTime: new Date('2024-03-20T14:00:00'),
    duration: 4,
    type: 'task',
    parentId: 'lineitem1'
  }
];

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Find the earliest start time among all tasks
  const earliestStart = new Date(Math.min(...sampleTasks.map(t => t.startTime.getTime())));
  
  // Find the latest end time
  const latestEnd = new Date(Math.max(
    ...sampleTasks.map(t => t.startTime.getTime() + t.duration * 3600000)
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

  return (
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
            height: sampleTasks.length * ROW_HEIGHT
          }}
        >
          {/* Task Bars */}
          {sampleTasks.map((task, index) => (
            <div
              key={task.id}
              className={`absolute ${
                task.type === 'lineitem' 
                  ? 'bg-blue-50 border border-blue-200 font-semibold' 
                  : 'bg-blue-500'
              } rounded-sm text-sm ${
                task.type === 'lineitem' ? 'text-blue-800' : 'text-white'
              }`}
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
              <div className="px-2 py-1 truncate">
                {task.name}
              </div>
            </div>
          ))}

          {/* Row Dividers */}
          {sampleTasks.map((_, index) => (
            <div
              key={`divider-${index}`}
              className="absolute w-full border-b border-gray-100"
              style={{ top: (index + 1) * ROW_HEIGHT }}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SimpleGanttChart;
