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

// Get tasks that this task depends on (parents)
const getParentTasks = (task: Task, tasks: Task[]): Task[] => {
  return tasks.filter(t => task.dependencies.includes(t.id));
};

// Get tasks that depend on this task (children)
const getChildTasks = (task: Task, tasks: Task[]): Task[] => {
  return tasks.filter(t => t.dependencies.includes(task.id));
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
  const parentTasks = getParentTasks(task, tasks);
  if (parentTasks.length === 0) return 0;
  return Math.max(...parentTasks.map(parent => getTaskLevel(parent, tasks))) + 1;
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
      
      // If this line item is expanded, add space for its children
      if (expandedItems.has(lineItem.id)) {
        const children = getChildTasks(lineItem, tasks);
        for (const child of children) {
          position += rowHeight; // Space for each child
          // If the child is expanded, add space for its children
          if (expandedItems.has(child.id)) {
            const grandchildren = getChildTasks(child, tasks);
            position += grandchildren.length * rowHeight;
          }
        }
      }
    }
    return position;
  }

  // For non-line items, find their parents
  const parents = getParentTasks(task, tasks);
  const expandedParent = parents.find(p => expandedItems.has(p.id));
  
  if (!expandedParent) {
    console.log(`Task ${task.id} is hidden (no expanded parent found)`);
    return -1;
  }

  // Get parent's position
  const parentPosition = getVerticalPosition(expandedParent, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition < 0) return -1;

  // Get all children of the parent to determine this task's position among siblings
  const siblings = getChildTasks(expandedParent, tasks);
  const siblingIndex = siblings.findIndex(s => s.id === task.id);
  
  // Calculate position based on parent position and sibling order
  const position = parentPosition + ((siblingIndex + 1) * rowHeight);

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