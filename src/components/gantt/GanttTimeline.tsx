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

  // Calculate time scale based on view mode
  const getTimeScale = () => {
    switch (viewMode) {
      case 'day':
        return 24; // 24 hours
      case 'week':
        return 24 * 7; // 168 hours
      case 'month':
        return 24 * 30; // ~720 hours
      default:
        return 24;
    }
  };

  const calculateTaskPosition = (startTime: Date) => {
    const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    const timeScale = getTimeScale();
    const position = (hoursFromStart / timeScale) * 100;
    console.log(`Task position calculation:`, {
      startTime: startTime.toISOString(),
      hoursFromStart,
      position,
      timeScale,
      viewMode
    });
    return position;
  };

  const calculateTaskWidth = (duration: number) => {
    const timeScale = getTimeScale();
    const width = (duration / timeScale) * 100;
    console.log(`Task width calculation:`, { 
      duration, 
      width, 
      timeScale,
      viewMode 
    });
    return width;
  };

  // Calculate the latest end time from all tasks
  const latestEnd = new Date(Math.max(...tasks
    .filter(t => t.startTime)
    .map(t => new Date(t.startTime!.getTime() + t.duration * 3600000).getTime())
  ));

  // Calculate total duration based on view mode
  const totalDurationHours = Math.ceil(
    (latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60)
  );

  console.log('Timeline dimensions:', {
    totalDurationHours,
    viewMode,
    timeScale: getTimeScale()
  });

  // Calculate grid lines based on view mode
  const getGridLines = () => {
    const timeScale = getTimeScale();
    const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
    return Array.from({ length: intervals }).map((_, i) => {
      const position = (i / intervals) * 100;
      return position;
    });
  };

  return (
    <div 
      className="relative bg-white min-h-full w-full"
    >
      {/* Grid lines */}
      {getGridLines().map((position, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gantt-grid"
          style={{ left: `${position}%` }}
        />
      ))}

      {/* Today marker */}
      <div
        className="absolute top-0 bottom-0 w-px bg-blue-500"
        style={{
          left: `${calculateTaskPosition(new Date())}%`,
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
                  left: `${position}%`,
                  width: `${width}%`,
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