import { Task } from '@/types/scheduling';

export function findEarliestSlot(
  task: Task,
  scheduledTasks: Task[],
  startTime: Date
): Date {
  console.log(`Finding earliest slot for task ${task.id} on resource ${task.resource}`);
  
  // Get all tasks scheduled on the same resource
  const resourceTasks = scheduledTasks.filter(
    t => t.resource === task.resource && t.startTime && t.endTime
  );
  
  // Sort tasks by start time
  resourceTasks.sort((a, b) => 
    (a.startTime!.getTime()) - (b.startTime!.getTime())
  );
  
  let proposedStart = new Date(startTime.getTime());
  let proposedEnd = new Date(proposedStart.getTime() + task.duration * 3600000);
  
  let slotFound = false;
  while (!slotFound) {
    slotFound = true;
    
    for (const scheduledTask of resourceTasks) {
      // Check if there's an overlap
      if (proposedStart < scheduledTask.endTime! && 
          proposedEnd > scheduledTask.startTime!) {
        // Move to end of current task
        proposedStart = new Date(scheduledTask.endTime!.getTime());
        proposedEnd = new Date(proposedStart.getTime() + task.duration * 3600000);
        slotFound = false;
        break;
      }
    }
  }
  
  console.log(`Found slot for task ${task.id}: ${proposedStart.toISOString()}`);
  return proposedStart;
}

export function scheduleTask(
  task: Task,
  scheduledTasks: Task[],
  startTime: Date = new Date()
): Date {
  console.log(`Scheduling task: ${task.id}`);
  return findEarliestSlot(task, scheduledTasks, startTime);
}