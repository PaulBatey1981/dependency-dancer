import { Task } from '@/types/scheduling';
import GanttTaskBar from './GanttTaskBar';
import {
  getTimeScale,
  calculateTaskPosition,
  calculateTaskWidth,
  getTaskLevel,
  getGridLines,
} from '@/utils/ganttUtils';
import { topologicalSort } from '@/utils/topologicalSort';

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
  const TASK_HEIGHT = 32;
  const VERTICAL_OFFSET = 4;
  const LINE_ITEM_SPACING = 500;

  const timeScale = getTimeScale(viewMode);
  const gridLines = getGridLines(viewMode);

  // Get all line items and sort them by ID
  const lineItems = tasks
    .filter(task => task.type === 'lineitem')
    .sort((a, b) => a.id.localeCompare(b.id));

  console.log('Sorted line items:', lineItems.map(item => item.id));

  // Helper function to get child tasks
  const getChildTasks = (parentId: string): Task[] => {
    const children = tasks.filter(task => task.dependencies.includes(parentId));
    return topologicalSort(children);
  };

  // Build ordered task list following hierarchy
  const buildOrderedTaskList = () => {
    const orderedTasks: Task[] = [];
    const processed = new Set<string>();

    const processTask = (task: Task) => {
      if (processed.has(task.id)) return;
      
      console.log(`Processing task ${task.id} for ordered list`);
      orderedTasks.push(task);
      processed.add(task.id);

      // Process children in sorted order
      const children = getChildTasks(task.id);
      children.forEach(child => processTask(child));
    };

    // Process line items in sorted order
    lineItems.forEach(lineItem => {
      console.log(`Processing line item ${lineItem.id}`);
      processTask(lineItem);
    });

    return orderedTasks;
  };

  const orderedTasks = buildOrderedTaskList();
  console.log('Final ordered tasks:', orderedTasks.map(task => task.id));

  // Calculate vertical position based on task's index in ordered list
  const getVerticalPosition = (task: Task): number => {
    const taskIndex = orderedTasks.findIndex(t => t.id === task.id);
    if (taskIndex === -1) return 0;

    // Find the line item this task belongs to
    const lineItem = lineItems.find(li => {
      const lineItemTasks = orderedTasks.filter(t => {
        const lineItemIndex = orderedTasks.findIndex(lt => lt.id === li.id);
        const taskIndex = orderedTasks.findIndex(ot => ot.id === t.id);
        return taskIndex >= lineItemIndex && 
               (taskIndex === lineItemIndex || t.dependencies.includes(li.id));
      });
      return lineItemTasks.some(t => t.id === task.id);
    });

    if (!lineItem) return taskIndex * ROW_HEIGHT;

    // Calculate line item offset
    const lineItemIndex = lineItems.findIndex(li => li.id === lineItem.id);
    const lineItemOffset = lineItemIndex * LINE_ITEM_SPACING;

    // Calculate level-based indentation
    const level = getTaskLevel(task, tasks);
    const levelOffset = level * (ROW_HEIGHT / 2);

    const position = lineItemOffset + (taskIndex * ROW_HEIGHT) + levelOffset + VERTICAL_OFFSET;
    console.log(`Task ${task.id} positioned at ${position}px (level ${level}, index ${taskIndex})`);
    return position;
  };

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

      {orderedTasks.map(task => {
        if (!task.startTime) return null;
        
        const position = calculateTaskPosition(task.startTime, earliestStart, timeScale);
        const width = calculateTaskWidth(task.duration, timeScale);
        const verticalPosition = getVerticalPosition(task);
        const level = getTaskLevel(task, tasks);

        console.log(`Rendering task ${task.id} at vertical position ${verticalPosition}px`);
        
        return (
          <GanttTaskBar
            key={task.id}
            task={task}
            position={position}
            width={width}
            verticalPosition={verticalPosition}
            level={level}
            indentWidth={ROW_HEIGHT / 2}
            taskHeight={TASK_HEIGHT}
          />
        );
      })}
    </div>
  );
};

export default GanttTimeline;