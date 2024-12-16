import { Task } from '@/types/scheduling';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface GanttTimelineProps {
  tasks: Task[];
  zoomLevel: number;
  viewMode: 'day' | 'week' | 'month';
  earliestStart: Date;
}

const GanttTimeline = ({ tasks, zoomLevel, viewMode, earliestStart }: GanttTimelineProps) => {
  console.log('Timeline render with zoom level:', zoomLevel);
  
  const getTaskColor = (type: Task['type']) => {
    switch (type) {
      case 'lineitem':
        return 'bg-task-lineitem';
      case 'component':
        return 'bg-task-component';
      case 'element':
        return 'bg-task-element';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateTaskPosition = (startTime: Date) => {
    const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    const position = hoursFromStart / zoomLevel;
    console.log(`Task position calculation:`, {
      startTime: startTime.toISOString(),
      hoursFromStart,
      position,
      zoomLevel
    });
    return position;
  };

  const calculateTaskWidth = (duration: number) => {
    const width = duration / zoomLevel;
    console.log(`Task width calculation:`, { duration, width, zoomLevel });
    return width;
  };

  // Calculate the latest end time from all tasks
  const latestEnd = new Date(Math.max(...tasks
    .filter(t => t.startTime)
    .map(t => new Date(t.startTime!.getTime() + t.duration * 3600000).getTime())
  ));

  // Calculate total duration in hours
  const totalDurationHours = Math.ceil(
    (latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60)
  );

  console.log('Timeline dimensions:', {
    totalDurationHours,
    zoomLevel,
    calculatedWidth: totalDurationHours / zoomLevel
  });

  // Ensure minimum width is at least the container width
  const timelineWidth = Math.max(
    totalDurationHours / zoomLevel,
    window.innerWidth - 256 // 256px is the width of the task list sidebar
  );

  return (
    <div 
      className="relative bg-white min-h-full"
      style={{ 
        width: `${timelineWidth}px`,
        minWidth: '100%'
      }}
    >
      {/* Grid lines */}
      {Array.from({ length: Math.ceil(totalDurationHours) }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gantt-grid"
          style={{ left: `${i / zoomLevel}px` }}
        />
      ))}

      {/* Today marker */}
      <div
        className="absolute top-0 bottom-0 w-px bg-blue-500"
        style={{
          left: `${calculateTaskPosition(new Date())}px`,
        }}
      />

      {/* Tasks */}
      {tasks.map(task => {
        if (!task.startTime) {
          console.log(`Task ${task.id} has no start time`);
          return null;
        }
        
        const position = calculateTaskPosition(task.startTime);
        const width = calculateTaskWidth(task.duration);
        
        console.log(`Rendering task ${task.id}:`, {
          name: task.name,
          position,
          width,
          startTime: task.startTime.toISOString(),
          duration: task.duration
        });

        return (
          <HoverCard key={task.id}>
            <HoverCardTrigger>
              <div
                className={`absolute h-8 rounded ${getTaskColor(task.type)} opacity-80 cursor-pointer animate-task-appear ${
                  task.isFixed ? 'border-2 border-task-fixed' : ''
                }`}
                style={{
                  left: `${position}px`,
                  width: `${width}px`,
                  top: '0.5rem',
                }}
              >
                <span className="text-xs text-white p-1 truncate block">
                  {task.name}
                </span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="font-semibold">{task.name}</h4>
                <div className="text-sm">
                  <p>Type: {task.type}</p>
                  <p>Duration: {task.duration}h</p>
                  <p>Status: {task.status}</p>
                  <p>Start: {task.startTime.toLocaleString()}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </div>
  );
};

export default GanttTimeline;