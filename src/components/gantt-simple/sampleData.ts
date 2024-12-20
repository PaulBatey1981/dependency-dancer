import { SimpleTask } from './types';
import { baseTrayTasks } from './data/baseTrayTasks';
import { caseTasks } from './data/caseTasks';

const baseDate = new Date('2024-03-20T09:00:00');

const finalAssembly: SimpleTask = {
  id: 'MWB1_final_assembly',
  name: 'MWB1 - Final Assembly',
  startTime: new Date(baseDate),
  duration: 3,
  type: 'lineitem',
  children: ['MWB1_wrap_base_tray', 'MWB1_wrap_case'],
  isExpanded: true
};

export const sampleTasks: SimpleTask[] = [
  finalAssembly,
  ...baseTrayTasks,
  ...caseTasks
];