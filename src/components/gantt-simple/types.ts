export interface SimpleTask {
  id: string;
  name: string;
  type: 'lineitem' | 'component' | 'element' | 'task';
  startTime: Date;
  duration: number;
  dependencies: string[];
  isExpanded: boolean;
  parentId?: string;
  children?: string[];
  resource?: string | null;
  isFixed: boolean;
  rowIndex?: number; // Added this optional property
}