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
    return position;
  };

  const calculateTaskWidth = (duration: number) => {
    const timeScale = getTimeScale();
    const width = (duration / timeScale) * 100;
    return width;
  };

  // Get child tasks for a given parent ID
  const getChildTasks = (parentId: string): Task[] => {
    const parentTask = tasks.find(t => t.id === parentId);
    if (!parentTask) return [];
    return tasks.filter(task => parentTask.dependencies.includes(task.id));
  };

  // Calculate vertical position for tasks
  const getVerticalPosition = (task: Task): number => {
    const baseHeight = 40; // Height of each task row in pixels
    const padding = 8; // Padding for each task row
    let position = padding;
    
    // Find all line items
    const lineItems = tasks.filter(t => t.type === 'lineitem');
    
    // If this is a line item
    if (task.type === 'lineitem') {
      const index = lineItems.findIndex(t => t.id === task.id);
      return (index * baseHeight) + padding;
    }
    
    // For non-line items, find their parent
    const parentTask = tasks.find(t => t.dependencies.includes(task.id));
    if (!parentTask) return padding;
    
    // If parent is not expanded, don't show child
    if (!expandedItems.has(parentTask.id)) return -1;
    
    // Get parent's position
    const parentPosition = getVerticalPosition(parentTask);
    
    // Get all siblings (tasks with same parent)
    const siblings = tasks.filter(t => parentTask.dependencies.includes(t.id));
    const index = siblings.findIndex(t => t.id === task.id);
    
    // Calculate position based on parent's position and sibling index
    position = parentPosition + ((index + 1) * baseHeight);
    
    console.log(`Task ${task.id} position: ${position}px (Parent: ${parentTask.id}, Index: ${index})`);
    return position;
  };

  // Calculate the latest end time from all tasks
  const latestEnd = new Date(Math.max(...tasks
    .filter(t => t.startTime)
    .map(t => new Date(t.startTime!.getTime() + t.duration * 3600000).getTime())
  ));

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
      style={{ paddingTop: '2rem' }} // Added padding to align with task list
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
        
        // Don't render if task should be hidden (parent not expanded)
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