import { SimpleTask } from '../types';

const baseDate = new Date('2024-03-20T09:00:00');

export const baseTrayTasks: SimpleTask[] = [
  {
    id: 'MWB1_wrap_base_tray',
    name: 'MWB1 - Wrap Base Tray',
    startTime: new Date(baseDate),
    duration: 3,
    type: 'component',
    parentId: 'MWB1_final_assembly',
    children: [],
    dependencies: [],
    isExpanded: true,
    isFixed: false,
    resource: 'gluing_machine'
  },
  {
    id: 'MWB1_base_tray_wrap',
    name: 'MWB1 - Base Tray Wrap',
    startTime: new Date(baseDate),
    duration: 1.33,
    type: 'element',
    parentId: 'MWB1_wrap_base_tray',
    children: [],
    dependencies: [],
    isExpanded: true,
    isFixed: false,
    resource: 'bench'
  },
  {
    id: 'MWB1_base_tray_wrap_print',
    name: 'MWB1 - Base Tray Wrap Print',
    startTime: new Date(baseDate),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_base_tray_wrap',
    children: [],
    dependencies: [],
    isExpanded: false,
    isFixed: false,
    resource: 'konica'
  },
  {
    id: 'MWB1_base_tray_wrap_laminate',
    name: 'MWB1 - Base Tray Wrap Laminate',
    startTime: new Date(baseDate.getTime() + 0.33 * 3600000),
    duration: 0.25,
    type: 'task',
    parentId: 'MWB1_base_tray_wrap',
    children: [],
    dependencies: ['MWB1_base_tray_wrap_print'],
    isExpanded: false,
    isFixed: false,
    resource: 'dk_europa'
  },
  {
    id: 'MWB1_base_tray_wrap_cut',
    name: 'MWB1 - Base Tray Wrap Cut',
    startTime: new Date(baseDate.getTime() + 0.58 * 3600000),
    duration: 0.75,
    type: 'task',
    parentId: 'MWB1_base_tray_wrap',
    children: [],
    dependencies: ['MWB1_base_tray_wrap_laminate'],
    isExpanded: false,
    isFixed: false,
    resource: 'zund_m800'
  },
  {
    id: 'MWB1_base_tray_board',
    name: 'MWB1 - Base Tray Board',
    startTime: new Date(baseDate),
    duration: 3,
    type: 'element',
    parentId: 'MWB1_wrap_base_tray',
    children: [],
    dependencies: [],
    isExpanded: true,
    isFixed: false,
    resource: 'bench'
  },
  {
    id: 'MWB1_base_tray_board_cut',
    name: 'MWB1 - Base Tray Board Cut',
    startTime: new Date(baseDate),
    duration: 1,
    type: 'task',
    parentId: 'MWB1_base_tray_board',
    children: [],
    dependencies: [],
    isExpanded: false,
    isFixed: false,
    resource: 'zund_m800'
  },
  {
    id: 'MWB1_base_tray_board_drill',
    name: 'MWB1 - Base Tray Board Drill',
    startTime: new Date(baseDate.getTime() + 1 * 3600000),
    duration: 0.5,
    type: 'task',
    parentId: 'MWB1_base_tray_board',
    children: [],
    dependencies: ['MWB1_base_tray_board_cut'],
    isExpanded: false,
    isFixed: false,
    resource: 'magnet_drill'
  },
  {
    id: 'MWB1_base_tray_board_magnets',
    name: 'MWB1 - Base Tray Board Magnets',
    startTime: new Date(baseDate.getTime() + 1.5 * 3600000),
    duration: 1,
    type: 'task',
    parentId: 'MWB1_base_tray_board',
    children: [],
    dependencies: ['MWB1_base_tray_board_drill'],
    isExpanded: false,
    isFixed: false,
    resource: 'bench'
  },
  {
    id: 'MWB1_base_tray_board_corner',
    name: 'MWB1 - Base Tray Board Corner',
    startTime: new Date(baseDate.getTime() + 2.5 * 3600000),
    duration: 0.5,
    type: 'task',
    parentId: 'MWB1_base_tray_board',
    children: [],
    dependencies: ['MWB1_base_tray_board_magnets'],
    isExpanded: false,
    isFixed: false,
    resource: 'corner_taper'
  }
];
