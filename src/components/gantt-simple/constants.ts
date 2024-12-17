export const HOUR_WIDTH = 50;
export const ROW_HEIGHT = 40;
export const TASK_HEIGHT = 32; // Ensuring it's smaller than ROW_HEIGHT
export const INDENT_WIDTH = 20;
export const MIN_HOURS_DISPLAY = 12;

export const COLORS = {
  fixedTaskBg: '#e0f2ff',
  fixedTaskBorder: '#2196f3',
  lineItemBg: '#f8fafc',
  lineItemText: '#1e293b',
  taskBg: '#3b82f6',
  taskText: '#ffffff',
  gridLine: '#f1f5f9',
  todayLine: '#fef3c7',
  taskDots: {
    lineitem: '#3b82f6',
    component: '#0d9488',
    element: '#4f46e5',
  }
} as const;