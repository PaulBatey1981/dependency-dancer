import { Task } from '@/types/scheduling';
import { topologicalSort } from './topologicalSort';
import { scheduleTask } from './timeSlotUtils';
import { sortByPriority } from './priorityUtils';

export function rescheduleAll(tasks: Task[]): Task[] {
  console.log('Starting full reschedule');
  
  // First do topological sort to respect dependencies
  const sortedTasks = topologicalSort(tasks);
  console.log('Tasks after topological sort:', sortedTasks.map(t => t.id));
  
  // Then adjust order based on priorities (only for line items)
  const prioritizedTasks = sortByPriority(sortedTasks);
  console.log('Tasks after priority sort:', prioritizedTasks.map(t => t.id));
  
  const scheduledTasks: Task[] = [];
  const baseDate = new Date(); // Use current time as base
  
  // Schedule tasks in order, ensuring all dependencies are met
  for (const task of prioritizedTasks) {
    if (task.status === 'fixed') {
      scheduledTasks.push(task);
      continue;
    }
    
    // Wait for all dependencies to be scheduled
    const dependencyEndTimes = task.dependencies
      .map(depId => {
        const depTask = scheduledTasks.find(t => t.id === depId);
        if (!depTask?.endTime) {
          console.warn(`Warning: Dependency ${depId} for task ${task.id} not yet scheduled`);
          return baseDate;
        }
        return depTask.endTime;
      })
      .filter(date => date !== null) as Date[];
    
    // Use the latest dependency end time as the earliest possible start
    // If no dependencies or all are unscheduled, use baseDate
    const earliestStart = dependencyEndTimes.length > 0
      ? new Date(Math.max(...dependencyEndTimes.map(d => d.getTime())))
      : baseDate;
      
    console.log(`Earliest possible start for ${task.id}: ${earliestStart.toISOString()}`);
    
    const startTime = scheduleTask(task, scheduledTasks, earliestStart);
    const endTime = new Date(startTime.getTime() + task.duration * 3600000);
    
    scheduledTasks.push({
      ...task,
      startTime,
      endTime,
      status: 'scheduled'
    });
    
    console.log(`Scheduled ${task.id} from ${startTime.toISOString()} to ${endTime.toISOString()}`);
  }
  
  console.log('Reschedule complete');
  return scheduledTasks;
}