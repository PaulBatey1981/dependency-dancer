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

// A task is a child if it depends on another task
const getParentTasks = (task: Task, tasks: Task[]): Task[] => {
  return task.dependencies.map(depId => tasks.find(t => t.id === depId)).filter((t): t is Task => t !== undefined);
};

// A task is a parent if other tasks depend on it
const getChildTasks = (task: Task, tasks: Task[]): Task[] => {
  return tasks.filter(t => t.dependencies.includes(task.id));
};

export const getTaskLevel = (task: Task, tasks: Task[]): number => {
  const parents = getParentTasks(task, tasks);
  if (parents.length === 0) return 0;
  return Math.max(...parents.map(parent => getTaskLevel(parent, tasks))) + 1;
};

const calculateTotalVisibleChildren = (task: Task, tasks: Task[], expandedItems: Set<string>): number => {
  if (!expandedItems.has(task.id)) return 0;
  
  const children = getChildTasks(task, tasks);
  let total = children.length;
  
  for (const child of children) {
    if (expandedItems.has(child.id)) {
      total += calculateTotalVisibleChildren(child, tasks, expandedItems);
    }
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

  // For line items (top-level tasks)
  if (task.type === 'lineitem') {
    // Get all line items
    const lineItems = tasks.filter(t => t.type === 'lineitem');
    let position = verticalOffset;
    
    for (const lineItem of lineItems) {
      if (lineItem.id === task.id) {
        console.log(`Found position for line item ${task.id}: ${position}px`);
        return position;
      }
      position += rowHeight; // Space for the line item itself
      
      // If this line item is expanded, add space for its children
      if (expandedItems.has(lineItem.id)) {
        const children = tasks.filter(t => t.dependencies.includes(lineItem.id));
        for (const child of children) {
          position += rowHeight; // Space for each child
          // If the child is expanded, add space for its children
          if (expandedItems.has(child.id)) {
            const grandchildren = tasks.filter(t => t.dependencies.includes(child.id));
            position += grandchildren.length * rowHeight;
          }
        }
      }
    }
    return position;
  }

  // For non-line items, find their parent
  const parents = getParentTasks(task, tasks);
  const expandedParent = parents.find(p => expandedItems.has(p.id));
  
  if (!expandedParent) {
    console.log(`Task ${task.id} is hidden (no expanded parent found)`);
    return -1;
  }

  // Get parent's position
  const parentPosition = getVerticalPosition(expandedParent, tasks, expandedItems, rowHeight, verticalOffset);
  if (parentPosition < 0) return -1;

  // Get all siblings (tasks that share the same parent)
  const siblings = tasks.filter(t => 
    t.dependencies.includes(expandedParent.id) && 
    t.type === task.type
  );
  
  // Find this task's position among its siblings
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