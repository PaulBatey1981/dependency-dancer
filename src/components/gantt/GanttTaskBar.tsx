import { Task } from '@/types/scheduling';
import { getTaskColor } from '@/utils/taskColors';

interface GanttTaskBarProps {
  task: Task;
  x: number;
  y: number;
  width: number;
  height: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const GanttTaskBar = ({ task, x, y, width, height, onMouseEnter, onMouseLeave }: GanttTaskBarProps) => {
  return (
    <div
      className={`absolute h-8 rounded ${getTaskColor(task.type)} ${
        task.is_fixed ? 'border-2 border-task-fixed' : ''
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="px-2 py-1 text-xs text-white truncate">
        {task.name}
      </div>
    </div>
  );
};

export default GanttTaskBar;