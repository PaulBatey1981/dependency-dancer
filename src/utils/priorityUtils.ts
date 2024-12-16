import { Task } from '@/types/scheduling';

export function sortByPriority(tasks: Task[]): Task[] {
  console.log('Sorting tasks by priority');
  
  // Create a map of tasks for quick lookup
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  
  // Helper function to check if all dependencies are before current task
  const areDependenciesBeforeCurrent = (task: Task, currentIndex: number, sortedTasks: Task[]) => {
    return task.dependencies.every(depId => {
      const depIndex = sortedTasks.findIndex(t => t.id === depId);
      return depIndex !== -1 && depIndex < currentIndex;
    });
  };

  // First sort by priority (higher priority first)
  const sortedTasks = [...tasks].sort((a, b) => {
    // If both are line items, sort by priority
    if (a.type === 'lineitem' && b.type === 'lineitem') {
      return (b.priority || 0) - (a.priority || 0);
    }
    // If only one is a line item, it goes after non-line items
    if (a.type === 'lineitem') return 1;
    if (b.type === 'lineitem') return -1;
    return 0;
  });

  // Then ensure dependencies are respected
  let hasSwapped: boolean;
  do {
    hasSwapped = false;
    for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i];
      if (!areDependenciesBeforeCurrent(task, i, sortedTasks)) {
        // Find the latest dependency
        const latestDepIndex = Math.max(...task.dependencies.map(depId => 
          sortedTasks.findIndex(t => t.id === depId)
        ));
        // Move the task after its latest dependency
        if (latestDepIndex > i) {
          sortedTasks.splice(latestDepIndex + 1, 0, sortedTasks.splice(i, 1)[0]);
          hasSwapped = true;
        }
      }
    }
  } while (hasSwapped);

  console.log('Tasks after priority sort:', sortedTasks.map(t => t.id));
  return sortedTasks;
}