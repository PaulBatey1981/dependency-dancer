export type TaskType = 'lineitem' | 'component' | 'element';

export type TaskStatus = 'pending' | 'scheduled' | 'fixed';

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  resource: string;
  duration: number; // in hours
  deadline?: Date;
  priority?: number;
  status: TaskStatus;
  dependencies: string[]; // array of task IDs
  startTime?: Date;
  endTime?: Date;
}

export interface Resource {
  id: string;
  name: string;
  capacity: number;
}

export interface ScheduleState {
  tasks: Task[];
  resources: Resource[];
}