import { Task } from '@/types/scheduling';

export function findEarliestSlot(
  task: Task,
  scheduledTasks: Task[],
  startTime: Date
): Date {
  console.log(`Finding earliest slot for task ${task.id} on resource ${task.resource}`);
  
  const resourceTasks = scheduledTasks.filter(
    t => t.resource === task.resource && t.startTime && t.endTime
  );
  
  resourceTasks.sort((a, b) => 
    (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0)
  );
  
  let proposedStart = startTime;
  let proposedEnd = new Date(proposedStart.getTime() + task.duration * 3600000);
  
  for (const scheduledTask of resourceTasks) {
    if (!scheduledTask.startTime || !scheduledTask.endTime) continue;
    
    if (proposedStart < scheduledTask.endTime && 
        proposedEnd > scheduledTask.startTime) {
      proposedStart = new Date(scheduledTask.endTime.getTime());
      proposedEnd = new Date(proposedStart.getTime() + task.duration * 3600000);
    }
  }
  
  if (task.deadline && proposedEnd > task.deadline) {
    console.warn(`Warning: Task ${task.id} cannot meet deadline`);
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
  
  const depEndTime = task.dependencies
    .map(depId => {
      const depTask = scheduledTasks.find(t => t.id === depId);
      return depTask?.endTime || startTime;
    })
    .reduce((latest, current) => 
      current > latest ? current : latest, 
      startTime
    );

  return findEarliestSlot(task, scheduledTasks, depEndTime);
}