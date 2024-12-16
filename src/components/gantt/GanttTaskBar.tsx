import { Task } from '@/types/scheduling';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface GanttTaskBarProps {
  task: Task;
  position: number;
  width: number;
  verticalPosition: number;
  level: number;
  indentWidth: number;
  taskHeight: number;
}

const GanttTaskBar = ({
  task,
  position,
  width,
  verticalPosition,
  level,
  indentWidth,
  taskHeight,
}: GanttTaskBarProps) => {
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

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="absolute" style={{
          left: `${position}%`,
          top: `${verticalPosition + 4}px`,
          marginLeft: `${level * indentWidth}px`,
        }}>
          <div
            className={`relative ${getTaskColor(task.type)} opacity-80 rounded ${
              task.isFixed ? 'border-2 border-task-fixed' : ''
            }`}
            style={{
              width: `${width}%`,
              height: `${taskHeight - 8}px`,
            }}
          />
          <span 
            className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-black whitespace-nowrap"
            style={{ zIndex: 10 }}
          >
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
            <p>Start: {task.startTime?.toLocaleString()}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default GanttTaskBar;