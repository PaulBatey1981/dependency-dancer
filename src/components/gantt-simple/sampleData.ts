import { SimpleTask } from './types';

const baseDate = new Date('2024-03-20T09:00:00');

export const sampleTasks: SimpleTask[] = [
  {
    id: 'MWB1_final_assembly',
    name: 'MWB1 - Final Assembly',
    startTime: new Date(baseDate),
    duration: 3,
    type: 'lineitem',
    children: ['MWB1_wrap_case', 'MWB1_wrap_base_tray', 'MWB1_line_case'],
    isExpanded: true
  },
  {
    id: 'MWB1_wrap_case',
    name: 'MWB1 - Wrap Case',
    startTime: new Date(baseDate),
    duration: 1.17,
    type: 'task',
    parentId: 'MWB1_final_assembly',
    children: [
      'MWB1_case_wrap_print',
      'MWB1_case_wrap_laminate',
      'MWB1_case_wrap_cut',
      'MWB1_case_board_cut',
      'MWB1_case_board_insert',
      'MWB1_case_liner_laminate',
      'MWB1_case_liner_cut'
    ],
    isExpanded: true
  },
  {
    id: 'MWB1_case_wrap_print',
    name: 'MWB1 - Case Wrap Print',
    startTime: new Date(baseDate),
    duration: 0.42,
    type: 'task',
    parentId: 'MWB1_wrap_case'
  },
  {
    id: 'MWB1_case_wrap_laminate',
    name: 'MWB1 - Case Wrap Laminate',
    startTime: new Date(baseDate.getTime() + 0.42 * 3600000),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_wrap_case'
  },
  {
    id: 'MWB1_case_wrap_cut',
    name: 'MWB1 - Case Wrap Cut',
    startTime: new Date(baseDate.getTime() + 0.75 * 3600000),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_wrap_case'
  },
  {
    id: 'MWB1_case_board_cut',
    name: 'MWB1 - Case Board Cut',
    startTime: new Date(baseDate),
    duration: 0.5,
    type: 'task',
    parentId: 'MWB1_wrap_case'
  },
  {
    id: 'MWB1_case_board_insert',
    name: 'MWB1 - Case Board Insert',
    startTime: new Date(baseDate.getTime() + 0.5 * 3600000),
    duration: 0.5,
    type: 'task',
    parentId: 'MWB1_wrap_case'
  },
  {
    id: 'MWB1_case_liner_laminate',
    name: 'MWB1 - Case Liner Laminate',
    startTime: new Date(baseDate),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_wrap_case'
  },
  {
    id: 'MWB1_case_liner_cut',
    name: 'MWB1 - Case Liner Cut',
    startTime: new Date(baseDate.getTime() + 0.33 * 3600000),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_wrap_case'
  },
  {
    id: 'MWB1_wrap_base_tray',
    name: 'MWB1 - Wrap Base Tray',
    startTime: new Date(baseDate.getTime() + 2 * 3600000),
    duration: 2,
    type: 'task',
    parentId: 'MWB1_final_assembly',
    children: [
      'MWB1_base_tray_board_cut',
      'MWB1_base_tray_board_drill',
      'MWB1_base_tray_board_magnets',
      'MWB1_base_tray_board_corner',
      'MWB1_base_tray_wrap_print',
      'MWB1_base_tray_wrap_laminate',
      'MWB1_base_tray_wrap_cut'
    ],
    isExpanded: true
  },
  {
    id: 'MWB1_base_tray_board_cut',
    name: 'MWB1 - Base Tray Board Cut',
    startTime: new Date(baseDate),
    duration: 1,
    type: 'task',
    parentId: 'MWB1_wrap_base_tray'
  },
  {
    id: 'MWB1_base_tray_board_drill',
    name: 'MWB1 - Base Tray Board Drill',
    startTime: new Date(baseDate.getTime() + 1 * 3600000),
    duration: 0.5,
    type: 'task',
    parentId: 'MWB1_wrap_base_tray'
  },
  {
    id: 'MWB1_base_tray_board_magnets',
    name: 'MWB1 - Base Tray Board Magnets',
    startTime: new Date(baseDate.getTime() + 1.5 * 3600000),
    duration: 1,
    type: 'task',
    parentId: 'MWB1_wrap_base_tray'
  },
  {
    id: 'MWB1_base_tray_board_corner',
    name: 'MWB1 - Base Tray Board Corner',
    startTime: new Date(baseDate.getTime() + 2.5 * 3600000),
    duration: 0.5,
    type: 'task',
    parentId: 'MWB1_wrap_base_tray'
  },
  {
    id: 'MWB1_base_tray_wrap_print',
    name: 'MWB1 - Base Tray Wrap Print',
    startTime: new Date(baseDate),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_wrap_base_tray'
  },
  {
    id: 'MWB1_base_tray_wrap_laminate',
    name: 'MWB1 - Base Tray Wrap Laminate',
    startTime: new Date(baseDate.getTime() + 0.33 * 3600000),
    duration: 0.25,
    type: 'task',
    parentId: 'MWB1_wrap_base_tray'
  },
  {
    id: 'MWB1_base_tray_wrap_cut',
    name: 'MWB1 - Base Tray Wrap Cut',
    startTime: new Date(baseDate.getTime() + 0.58 * 3600000),
    duration: 0.75,
    type: 'task',
    parentId: 'MWB1_wrap_base_tray'
  },
  {
    id: 'MWB1_line_case',
    name: 'MWB1 - Line Case',
    startTime: new Date(baseDate.getTime() + 1.17 * 3600000),
    duration: 0.67,
    type: 'task',
    parentId: 'MWB1_final_assembly'
  }
];