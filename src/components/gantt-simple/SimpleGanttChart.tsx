import { useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SimpleTask {
  id: string;
  name: string;
  startTime: Date;
  duration: number; // in hours
}

const HOUR_WIDTH = 50; // pixels per hour
const ROW_HEIGHT = 40;
const TASK_HEIGHT = 32;

// Hardcoded tasks for initial testing
const sampleTasks: SimpleTask[] = [
  {
    id: '1',
    name: 'Print Materials',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 2, // 2 hours
  },
  {
    id: '2',
    name: 'Cut Boards',
    startTime: new Date('2024-03-20T11:00:00'),
    duration: 3, // 3 hours
  },
  {
    id: '3',
    name: 'Assembly',
    startTime: new Date('2024-03-20T14:00:00'),
    duration: 4, // 4 hours
  },
];

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Find the earliest start time among all tasks
  const earliestStart = new Date(Math.min(...sampleTasks.map(t => t.startTime.getTime())));
  
  // Find the latest end time
  const latestEnd = new Date(Math.max(
    ...sampleTasks.map(t => t.startTime.getTime() + t.duration * 3600000)
  ));

  // Calculate total hours for timeline width
  const totalHours = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60));
  
  // Calculate timeline width
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
    return (
      <div
        key={index}
        className="absolute top-0 bottom-0 border-l border-gray-200 text-xs text-gray-500"
        style={{ left: index * HOUR_WIDTH }}
      >
        {markerTime.getHours().toString().padStart(2, '0')}:00
      </div>
    );
  });

  return (
    <div className="h-[400px] border rounded-lg">
      {/* Timeline Header */}
      <div className="h-8 border-b bg-gray-50 relative overflow-hidden">
        <div style={{ width: timelineWidth }} className="relative">
          {hourMarkers}
        </div>
      </div>

      {/* Timeline Content */}
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div
          ref={timelineRef}
          className="relative"
          style={{ width: timelineWidth, height: sampleTasks.length * ROW_HEIGHT }}
        >
          {/* Task Bars */}
          {sampleTasks.map((task, index) => (
            <div
              key={task.id}
              className="absolute bg-blue-500 rounded-sm text-white text-sm"
              style={{
                left: calculateTaskPosition(task),
                top: index * ROW_HEIGHT + (ROW_HEIGHT - TASK_HEIGHT) / 2,
                width: calculateTaskWidth(task.duration),
                height: TASK_HEIGHT,
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