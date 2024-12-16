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
  expandedItems: Set<string>;
}

const GanttTimeline = ({ tasks, zoomLevel, viewMode, earliestStart, expandedItems }: GanttTimelineProps) => {
  const ROW_HEIGHT = 40; // Match the height of task rows in the list
  const INDENT_WIDTH = 24; // Matches the indent of the task list

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

  const getTimeScale = () => {
    switch (viewMode) {
      case 'day':
        return 24;
      case 'week':
        return 24 * 7;
      case 'month':
        return 24 * 30;
      default:
        return 24;
    }
  };

  const calculateTaskPosition = (startTime: Date) => {
    const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    const timeScale = getTimeScale();
    const position = (hoursFromStart / timeScale) * 100;
    return position;
  };

  const calculateTaskWidth = (duration: number) => {
    const timeScale = getTimeScale();
    const width = (duration / timeScale) * 100;
    return width;
  };

  // Get the level of nesting for a task
  const getTaskLevel = (task: Task): number => {
    const parentTask = tasks.find(t => t.dependencies.includes(task.id));
    if (!parentTask) return 0;
    return getTaskLevel(parentTask) + 1;
  };

  // Calculate vertical position based on task order and hierarchy
  const getVerticalPosition = (task: Task): number => {
    let position = 0;
    const lineItems = tasks.filter(t => t.type === 'lineitem');
    
    if (task.type === 'lineitem') {
      const index = lineItems.findIndex(t => t.id === task.id);
      return index * ROW_HEIGHT;
    }

    // Find the parent task
    const parentTask = tasks.find(t => t.dependencies.includes(task.id));
    if (!parentTask || !expandedItems.has(parentTask.id)) return -1;

    // Get parent's position
    const parentPosition = getVerticalPosition(parentTask);
    if (parentPosition < 0) return -1;

    // Get siblings (tasks with same parent)
    const siblings = tasks.filter(t => parentTask.dependencies.includes(t.id));
    const index = siblings.findIndex(t => t.id === task.id);

    position = parentPosition + ((index + 1) * ROW_HEIGHT);

    return position;
  };

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
      style={{ paddingTop: '2rem' }}
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
        if (!task.startTime) return null;
        
        const position = calculateTaskPosition(task.startTime);
        const width = calculateTaskWidth(task.duration);
        const verticalPosition = getVerticalPosition(task);
        const level = getTaskLevel(task);
        
        // Don't render if task should be hidden
        if (verticalPosition < 0) return null;

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
                  top: `${verticalPosition}px`,
                  marginLeft: `${level * INDENT_WIDTH}px`,
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