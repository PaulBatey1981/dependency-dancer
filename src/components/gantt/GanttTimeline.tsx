import { Task } from '@/types/scheduling';
import GanttTaskBar from './GanttTaskBar';
import {
  getTimeScale,
  calculateTaskPosition,
  calculateTaskWidth,
  getTaskLevel,
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
  const LINE_ITEM_SPACING = 500;

  const timeScale = getTimeScale(viewMode);
  const gridLines = getGridLines(viewMode);

  // Get all line items and sort them by ID
  const lineItems = tasks
    .filter(task => task.type === 'lineitem')
    .sort((a, b) => a.id.localeCompare(b.id));

  console.log('Sorted line items:', lineItems.map(item => item.id));

  // Create a map to store the base vertical position for each line item
  const lineItemPositions = new Map<string, number>();
  lineItems.forEach((lineItem, index) => {
    const position = index * LINE_ITEM_SPACING;
    lineItemPositions.set(lineItem.id, position);
    console.log(`Set offset ${position}px for line item ${lineItem.id}`);
  });

  // Helper function to get all tasks under a line item
  const getTasksUnderLineItem = (lineItemId: string): Task[] => {
    const result: Task[] = [];
    const lineItem = tasks.find(t => t.id === lineItemId);
    if (!lineItem) return result;

    // Add the line item itself
    result.push(lineItem);

    // Helper function for recursive traversal
    const traverse = (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Get all tasks that have this task as a dependency
      const children = tasks.filter(t => t.dependencies.includes(taskId));
      
      // Sort children by ID to maintain consistent order
      children.sort((a, b) => a.id.localeCompare(b.id));
      
      // Add each child and traverse their dependencies
      children.forEach(child => {
        result.push(child);
        traverse(child.id);
      });
    };

    // Start traversal from the line item
    traverse(lineItemId);
    return result;
  };

  // Build ordered task list following hierarchy
  const orderedTasks: Task[] = [];
  lineItems.forEach(lineItem => {
    const lineItemTasks = getTasksUnderLineItem(lineItem.id);
    orderedTasks.push(...lineItemTasks);
  });

  console.log('Final ordered tasks:', orderedTasks.map(task => task.id));

  // Calculate vertical position based on task's index in ordered list
  const getVerticalPosition = (task: Task): number => {
    const taskIndex = orderedTasks.findIndex(t => t.id === task.id);
    if (taskIndex === -1) return 0;

    // Find the line item this task belongs to
    const lineItem = lineItems.find(li => 
      getTasksUnderLineItem(li.id).some(t => t.id === task.id)
    );
    
    if (!lineItem) return taskIndex * ROW_HEIGHT;

    // Get base offset for this line item
    const lineItemOffset = lineItemPositions.get(lineItem.id) || 0;
    
    // Calculate level-based indentation
    const level = getTaskLevel(task, tasks);
    const levelOffset = level * (ROW_HEIGHT / 2);

    const position = lineItemOffset + levelOffset + VERTICAL_OFFSET;
    console.log(`Task ${task.id} positioned at ${position}px (level ${level})`);
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
            indentWidth={INDENT_WIDTH}
            taskHeight={TASK_HEIGHT}
          />
        );
      })}
    </div>
  );
};

export default GanttTimeline;