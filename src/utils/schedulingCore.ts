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
    console.log(`Processing task: ${task.id}`);
    
    if (task.status === 'fixed') {
      console.log(`Task ${task.id} is fixed, keeping existing schedule`);
      scheduledTasks.push(task);
      continue;
    }
    
    // Get all dependencies for this task
    const dependencies = task.dependencies.map(depId => {
      const depTask = scheduledTasks.find(t => t.id === depId);
      if (!depTask?.endTime) {
        console.warn(`Warning: Dependency ${depId} for task ${task.id} not yet scheduled`);
        return null;
      }
      console.log(`Dependency ${depId} ends at ${depTask.endTime.toISOString()}`);
      return depTask;
    }).filter(Boolean) as Task[];
    
    // Find the latest end time among dependencies
    const latestDependencyEnd = dependencies.length > 0
      ? new Date(Math.max(...dependencies.map(d => d.endTime!.getTime())))
      : baseDate;
    
    console.log(`Latest dependency end time for ${task.id}: ${latestDependencyEnd.toISOString()}`);
    
    // For tasks on the same resource, ensure they're scheduled after any previous tasks
    const previousResourceTasks = scheduledTasks
      .filter(t => t.resource === task.resource)
      .sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0));
    
    const latestResourceEnd = previousResourceTasks.length > 0
      ? previousResourceTasks[0].endTime!
      : baseDate;
    
    // Use the later of dependency end time or resource availability
    const earliestStart = new Date(Math.max(
      latestDependencyEnd.getTime(),
      latestResourceEnd.getTime()
    ));
    
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