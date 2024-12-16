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

  const calculateTaskPosition = (startTime: Date) => {
    const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    return `${hoursFromStart / zoomLevel}px`;
  };

  const calculateTaskWidth = (duration: number) => {
    return `${duration / zoomLevel}px`;
  };

  const latestEnd = new Date(Math.max(...tasks.filter(t => t.startTime).map(t => 
    new Date(t.startTime!.getTime() + t.duration * 3600000).getTime()
  )));

  const totalHours = Math.max(
    (latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60),
    viewMode === 'day' ? 24 : viewMode === 'week' ? 168 : 720 // Minimum width based on view mode
  );
  
  const timelineWidth = Math.max(totalHours / zoomLevel, 1000); // Ensure minimum width

  return (
    <div 
      className="relative min-w-full h-full"
      style={{ width: `${timelineWidth}px` }}
    >
      {/* Grid lines */}
      {Array.from({ length: Math.ceil(totalHours) }).map((_, i) => (
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
          left: calculateTaskPosition(new Date()),
        }}
      />

      {/* Tasks */}
      {tasks.map(task => task.startTime && (
        <HoverCard key={task.id}>
          <HoverCardTrigger>
            <div
              className={`absolute h-8 rounded ${getTaskColor(task.type)} opacity-80 cursor-pointer animate-task-appear ${
                task.isFixed ? 'border-2 border-task-fixed' : ''
              }`}
              style={{
                left: calculateTaskPosition(task.startTime),
                width: calculateTaskWidth(task.duration),
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
                {task.startTime && (
                  <p>Start: {task.startTime.toLocaleString()}</p>
                )}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
};

export default GanttTimeline;