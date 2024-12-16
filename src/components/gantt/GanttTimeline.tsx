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

  // Get line items sorted by ID in ascending order (MWB1 before MWB2)
  const lineItems = tasks
    .filter(task => task.type === 'lineitem')
    .sort((a, b) => a.id.localeCompare(b.id));

  console.log('Sorted line items:', lineItems.map(item => item.id));

  // Create a map to store the base vertical position for each line item
  const lineItemPositions = new Map<string, number>();
  lineItems.forEach((lineItem, index) => {
    lineItemPositions.set(lineItem.id, index * 500); // 500px spacing between line items
  });

  // Helper function to find the line item for a task
  function getLineItem(task: Task, allTasks: Task[]): Task | null {
    if (task.type === 'lineitem') return task;
    
    const parent = allTasks.find(t => t.dependencies.includes(task.id));
    if (!parent) return null;
    
    return getLineItem(parent, allTasks);
  }

  // Sort tasks to match the task list order
  const sortedTasks = tasks.slice().sort((a, b) => {
    const aLineItem = getLineItem(a, tasks);
    const bLineItem = getLineItem(b, tasks);
    
    if (aLineItem && bLineItem) {
      // Sort by line item ID first
      const lineItemComparison = aLineItem.id.localeCompare(bLineItem.id);
      if (lineItemComparison !== 0) return lineItemComparison;
      
      // If tasks belong to the same line item, maintain their dependency order
      if (aLineItem.id === bLineItem.id) {
        const aIndex = tasks.findIndex(t => t.id === a.id);
        const bIndex = tasks.findIndex(t => t.id === b.id);
        return aIndex - bIndex;
      }
    }
    
    return 0;
  });

  console.log('Sorted tasks order:', sortedTasks.map(task => task.id));

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