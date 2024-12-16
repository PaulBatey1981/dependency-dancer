import { Task } from '@/types/scheduling';
import GanttTaskBar from './GanttTaskBar';
import {
  getTimeScale,
  calculateTaskPosition,
  calculateTaskWidth,
  getTaskLevel,
  getVerticalPosition,
  getGridLines,
} from '@/utils/ganttUtils';

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
  const ROW_HEIGHT = 40;
  const INDENT_WIDTH = 24;
  const TASK_HEIGHT = 32;
  const VERTICAL_OFFSET = 4; // Re-add this constant

  const timeScale = getTimeScale(viewMode);
  const gridLines = getGridLines(viewMode);

  return (
    <div 
      className="relative bg-white min-h-full w-full"
      style={{ paddingTop: '2rem' }}
    >
      {/* Grid lines */}
      {gridLines.map((position, i) => (
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
          left: `${calculateTaskPosition(new Date(), earliestStart, timeScale)}%`,
        }}
      />

      {/* Tasks */}
      {tasks.map(task => {
        if (!task.startTime) return null;
        
        const position = calculateTaskPosition(task.startTime, earliestStart, timeScale);
        const width = calculateTaskWidth(task.duration, timeScale);
        const verticalPosition = getVerticalPosition(task, tasks, expandedItems, ROW_HEIGHT, VERTICAL_OFFSET);
        const level = getTaskLevel(task, tasks);
        
        if (verticalPosition < 0) return null;

        console.log(`Rendering task ${task.id} at vertical position ${verticalPosition}px`);

        return (
          <GanttTaskBar
            key={task.id}
            task={task}
            position={position}
            width={width}
            verticalPosition={verticalPosition}
            level={level}
            indentWidth={INDENT_WIDTH}
            taskHeight={TASK_HEIGHT}
          />
        );
      })}
    </div>
  );
};

export default GanttTimeline;