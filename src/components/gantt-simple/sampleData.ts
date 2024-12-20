import { SimpleTask } from './types';
import { baseTrayTasks } from './data/baseTrayTasks';
import { caseTasks } from './data/caseTasks';

const baseDate = new Date('2024-03-20T09:00:00');

const finalAssembly: SimpleTask = {
  id: 'MWB1_final_assembly',
  name: 'MWB1 - Final Assembly',
  startTime: new Date(baseDate.getTime() + 8 * 3600000),
  duration: 1,
  type: 'lineitem',
  children: [
    'MWB1_wrap_base_tray',
    'MWB1_wrap_case',
    'MWB1_line_case',
    'MWB1_assemble_base_tray_to_case'
  ],
  dependencies: ['MWB1_assemble_base_tray_to_case'],
  isExpanded: true,
  isFixed: false
};

const assembleBaseTrayToCase: SimpleTask = {
  id: 'MWB1_assemble_base_tray_to_case',
  name: 'MWB1 - Assemble Base Tray to Case',
  startTime: new Date(baseDate.getTime() + 7 * 3600000),
  duration: 1,
  type: 'task',
  parentId: 'MWB1_final_assembly',
  dependencies: ['MWB1_line_case'],
  isExpanded: false,
  isFixed: false
};

export const sampleTasks: SimpleTask[] = [
  finalAssembly,
  assembleBaseTrayToCase,
  ...baseTrayTasks,
  ...caseTasks
];