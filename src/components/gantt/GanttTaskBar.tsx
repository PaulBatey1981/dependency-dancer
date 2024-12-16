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
        <div
          className={`absolute rounded ${getTaskColor(task.type)} opacity-80 cursor-pointer animate-task-appear ${
            task.isFixed ? 'border-2 border-task-fixed' : ''
          }`}
          style={{
            left: `${position}%`,
            width: `${width}%`,
            top: `${verticalPosition}px`,
            marginLeft: `${level * indentWidth}px`,
            height: `${taskHeight}px`,
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
            <p>Start: {task.startTime?.toLocaleString()}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default GanttTaskBar;