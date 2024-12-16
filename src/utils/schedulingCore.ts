import { Task } from '@/types/scheduling';
import { topologicalSort } from './topologicalSort';
import { scheduleTask } from './timeSlotUtils';
import { sortByPriority } from './priorityUtils';

export function rescheduleAll(tasks: Task[]): Task[] {
  console.log('Starting full reschedule');
  
  const sortedTasks = topologicalSort(tasks);
  const prioritizedTasks = sortByPriority(sortedTasks);
  const scheduledTasks: Task[] = [];
  
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