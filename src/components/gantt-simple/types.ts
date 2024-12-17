export interface SimpleTask {
  id: string;
  name: string;
  startTime: Date;
  duration: number;
  type: 'lineitem' | 'task';
  parentId?: string;
  dependencies?: string[];
  isFixed?: boolean;
}