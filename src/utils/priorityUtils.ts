import { Task } from '@/types/scheduling';

export function sortByPriority(tasks: Task[]): Task[] {
  console.log('Sorting tasks by priority');
  
  // Only consider priority for line items
  return tasks.sort((a, b) => {
    // If both are line items, sort by priority
    if (a.type === 'lineitem' && b.type === 'lineitem') {
      return (b.priority || 0) - (a.priority || 0);
    }
    // If only one is a line item, it goes after non-line items
    if (a.type === 'lineitem') return 1;
    if (b.type === 'lineitem') return -1;
    // For non-line items, maintain their relative order from topological sort
    return 0;
  });
}