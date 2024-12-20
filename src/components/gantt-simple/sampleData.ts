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
  children: [],  // We'll populate this based on dependencies
  dependencies: [],
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

// Log sample data for debugging
console.log('Sample tasks being loaded:', [finalAssembly, assembleBaseTrayToCase, ...baseTrayTasks, ...caseTasks]);

// Create a Set of unique task IDs to check for duplicates
const taskIds = new Set();
const tasks = [finalAssembly, assembleBaseTrayToCase, ...baseTrayTasks, ...caseTasks];

// Check for duplicates and build parent-child relationships
tasks.forEach(task => {
  if (taskIds.has(task.id)) {
    console.warn(`Duplicate task ID found: ${task.id}`);
  }
  taskIds.add(task.id);
  
  // If task has a parent, add it to parent's children array
  if (task.parentId) {
    const parent = tasks.find(t => t.id === task.parentId);
    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(task.id);
    }
  }
});

console.log('Final tasks structure:', tasks);

export const sampleTasks: SimpleTask[] = tasks;