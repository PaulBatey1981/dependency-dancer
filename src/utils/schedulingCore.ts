import { Task } from '@/types/scheduling';
import { topologicalSort } from './topologicalSort';
import { scheduleTask } from './timeSlotUtils';
import { sortByPriority } from './priorityUtils';

export function rescheduleAll(tasks: Task[]): Task[] {
  console.log('Starting full reschedule');
  
  // First do topological sort to respect dependencies
  const sortedTasks = topologicalSort(tasks);
  
  // Then adjust order based on priorities (only for line items)
  const prioritizedTasks = sortByPriority(sortedTasks);
  
  const scheduledTasks: Task[] = [];
  
  // Schedule tasks in order
  for (const task of prioritizedTasks) {
    if (task.status === 'fixed') {
      scheduledTasks.push(task);
      continue;
    }
    
    const startTime = scheduleTask(task, scheduledTasks);
    const endTime = new Date(startTime.getTime() + task.duration * 3600000);
    
    scheduledTasks.push({
      ...task,
      startTime,
      endTime,
      status: 'scheduled'
    });
  }
  
  console.log('Reschedule complete');
  return scheduledTasks;
}