import { Task } from '@/types/scheduling';
import GanttTaskBar from './GanttTaskBar';
import { topologicalSort } from '@/utils/topologicalSort';
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
  const VERTICAL_OFFSET = 4;

  const timeScale = getTimeScale(viewMode);
  const gridLines = getGridLines(viewMode);

  // Get line items in reverse order to match the task list
  const lineItems = tasks
    .filter(task => task.type === 'lineitem')
    .reverse();

  // Create a map to store the base vertical position for each line item
  const lineItemPositions = new Map<string, number>();
  lineItems.forEach((lineItem, index) => {
    lineItemPositions.set(lineItem.id, index * 500); // 500px spacing between line items
  });

  // Sort tasks to match the task list order
  const sortedTasks = tasks.slice().sort((a, b) => {
    const aLineItem = getLineItem(a, tasks);
    const bLineItem = getLineItem(b, tasks);
    
    if (aLineItem && bLineItem) {
      const aIndex = lineItems.findIndex(item => item.id === aLineItem.id);
      const bIndex = lineItems.findIndex(item => item.id === bLineItem.id);
      if (aIndex !== bIndex) return aIndex - bIndex;
    }
    
    return 0;
  });

  // Helper function to find the line item for a task
  function getLineItem(task: Task, allTasks: Task[]): Task | null {
    if (task.type === 'lineitem') return task;
    
    const parent = allTasks.find(t => t.dependencies.includes(task.id));
    if (!parent) return null;
    
    return getLineItem(parent, allTasks);
  }

  return (
    <div 
      className="relative bg-white min-h-full w-full"
      style={{ paddingTop: '2rem' }}
    >
      {gridLines.map((position, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gantt-grid"
          style={{ left: `${position}%` }}
        />
      ))}

      <div
        className="absolute top-0 bottom-0 w-px bg-blue-500"
        style={{
          left: `${calculateTaskPosition(new Date(), earliestStart, timeScale)}%`,
        }}
      />

      {sortedTasks.map(task => {
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