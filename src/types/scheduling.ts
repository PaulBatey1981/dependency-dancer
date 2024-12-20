export type TaskType = 'lineitem' | 'component' | 'element' | 'task';

export type TaskStatus = 'unscheduled' | 'scheduled' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  resource_id: string | null;
  duration: number;
  deadline?: Date;
  priority?: number;
  status: TaskStatus;
  is_fixed: boolean;
  dependencies: string[];
  startTime?: Date;
  endTime?: Date;
  line_item_id?: string | null;
  created_at?: string;
  updated_at?: string;
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