import { Task } from '@/types/scheduling';

export const getTimeScale = (viewMode: 'day' | 'week' | 'month') => {
  switch (viewMode) {
    case 'day':
      return 24;
    case 'week':
      return 24 * 7;
    case 'month':
      return 24 * 30;
    default:
      return 24;
  }
};

export const calculateTaskPosition = (startTime: Date, earliestStart: Date, timeScale: number) => {
  const hoursFromStart = (startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
  const position = (hoursFromStart / timeScale) * 100;
  return position;
};

export const calculateTaskWidth = (duration: number, timeScale: number) => {
  const width = (duration / timeScale) * 100;
  return width;
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
  if (task.dependencies.length === 0) return 0;
  const parentTasks = tasks.filter(t => task.dependencies.includes(t.id));
  if (parentTasks.length === 0) return 0;
  return Math.max(...parentTasks.map(parent => getTaskLevel(parent, tasks))) + 1;
};

const getChildTasks = (task: Task, tasks: Task[]): Task[] => {
  return tasks.filter(t => t.dependencies.includes(task.id));
};

const calculateTotalVisibleChildren = (task: Task, tasks: Task[], expandedItems: Set<string>): number => {
  if (!expandedItems.has(task.id)) return 0;
  
  const children = getChildTasks(task, tasks);
  let total = children.length;
  
  for (const child of children) {
    total += calculateTotalVisibleChildren(child, tasks, expandedItems);
  }
  
  return total;
};

export const getVerticalPosition = (
  task: Task,
  tasks: Task[],
  expandedItems: Set<string>,
  rowHeight: number,
  verticalOffset: number
): number => {
  console.log(`Calculating vertical position for task ${task.id}`);

  // Get all line items
  const lineItems = tasks.filter(t => t.type === 'lineitem');
  
  // For line items, calculate position including space for expanded children
  if (task.type === 'lineitem') {
    let position = verticalOffset;
    for (const lineItem of lineItems) {
      if (lineItem.id === task.id) {
        console.log(`Found position for line item ${task.id}: ${position}px`);
        return position;
      }
      position += rowHeight; // Space for the line item itself
      if (expandedItems.has(lineItem.id)) {
        position += calculateTotalVisibleChildren(lineItem, tasks, expandedItems) * rowHeight;
      }
    }
    return position;
  }

  // For child tasks, find their parent
  const parentTask = tasks.find(t => t.dependencies.includes(task.id));
  if (!parentTask || !expandedItems.has(parentTask.id)) {
    console.log(`Task ${task.id} is hidden (parent not expanded or not found)`);
    return -1;
  }

  // Calculate position based on parent's position and number of preceding siblings
  const parentPosition = getVerticalPosition(parentTask, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition < 0) return -1;

  const siblings = getChildTasks(parentTask, tasks);
  const siblingIndex = siblings.findIndex(s => s.id === task.id);
  
  let position = parentPosition + rowHeight; // Start after parent
  
  // Add space for expanded preceding siblings and their children
  for (let i = 0; i < siblingIndex; i++) {
    position += rowHeight; // Space for the sibling itself
    if (expandedItems.has(siblings[i].id)) {
      position += calculateTotalVisibleChildren(siblings[i], tasks, expandedItems) * rowHeight;
    }
  }

  console.log(`Calculated position for task ${task.id}: ${position}px`);
  return position;
};

export const getGridLines = (viewMode: 'day' | 'week' | 'month') => {
  const intervals = viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : 30;
  return Array.from({ length: intervals }).map((_, i) => {
    const position = (i / intervals) * 100;
    return position;
  });
};