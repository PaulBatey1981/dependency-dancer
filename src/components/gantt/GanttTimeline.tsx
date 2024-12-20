import { Task } from '@/types/scheduling';
import GanttTaskBar from './GanttTaskBar';
import { getTimeScale } from '@/utils/ganttUtils';

interface GanttTimelineProps {
  tasks: Task[];
  zoomLevel: number;
  viewMode: 'day' | 'week' | 'month';
  earliestStart: Date;
  expandedItems: Set<string>;
}

const GanttTimeline = ({
  tasks,
  zoomLevel,
  viewMode,
  earliestStart,
  expandedItems,
}: GanttTimelineProps) => {
  const timeScale = getTimeScale(viewMode);
  const taskHeight = 40;
  const indentWidth = 20;

  const calculateTaskPosition = (startTime: Date) => {
    const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    return (hoursFromStart / timeScale) * 100 * zoomLevel;
  };

  const calculateTaskWidth = (duration: number) => {
    return (duration / timeScale) * 100 * zoomLevel;
  };

  const getTaskVerticalPosition = (task: Task, index: number) => {
    return index * (taskHeight + 8);
  };

  const getTaskLevel = (task: Task): number => {
    let level = 0;
    let currentTask = task;
    
    while (true) {
      const parent = tasks.find(t => t.dependencies.includes(currentTask.id));
      if (!parent) break;
      level++;
      currentTask = parent;
    }
    
    return level;
  };

  return (
    <div 
      className="relative"
      style={{
        height: `${tasks.length * (taskHeight + 8)}px`,
        minWidth: '100%',
      }}
    >
      {tasks.map((task, index) => {
        if (!task.startTime) return null;

        const x = calculateTaskPosition(task.startTime);
        const width = calculateTaskWidth(task.duration);
        const y = getTaskVerticalPosition(task, index);
        const level = getTaskLevel(task);
        const xWithIndent = x + (level * indentWidth);

        return (
          <GanttTaskBar
            key={task.id}
            task={task}
            x={xWithIndent}
            y={y}
            width={width}
            height={taskHeight}
          />
        );
      })}
    </div>
  );
};

export default GanttTimeline;