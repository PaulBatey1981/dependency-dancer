import { SimpleTask } from '../types';

const baseDate = new Date('2024-03-20T09:00:00');

export const caseTasks: SimpleTask[] = [
  {
    id: 'MWB1_wrap_case',
    name: 'MWB1 - Wrap Case',
    startTime: new Date(baseDate.getTime() + 3 * 3600000),
    duration: 2,
    type: 'component',
    parentId: 'MWB1_final_assembly',
    children: [
      'MWB1_case_wrap',
      'MWB1_case_board',
      'MWB1_case_liner'
    ],
    dependencies: ['MWB1_wrap_base_tray'],
    isExpanded: true
  },
  {
    id: 'MWB1_case_wrap',
    name: 'MWB1 - Case Wrap',
    startTime: new Date(baseDate.getTime() + 3 * 3600000),
    duration: 1.08,
    type: 'element',
    parentId: 'MWB1_wrap_case',
    children: [
      'MWB1_case_wrap_print',
      'MWB1_case_wrap_laminate',
      'MWB1_case_wrap_cut'
    ],
    isExpanded: true
  },
  {
    id: 'MWB1_case_wrap_print',
    name: 'MWB1 - Case Wrap Print',
    startTime: new Date(baseDate.getTime() + 3 * 3600000),
    duration: 0.42,
    type: 'task',
    parentId: 'MWB1_case_wrap'
  },
  {
    id: 'MWB1_case_wrap_laminate',
    name: 'MWB1 - Case Wrap Laminate',
    startTime: new Date(baseDate.getTime() + 3.42 * 3600000),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_case_wrap',
    dependencies: ['MWB1_case_wrap_print']
  },
  {
    id: 'MWB1_case_wrap_cut',
    name: 'MWB1 - Case Wrap Cut',
    startTime: new Date(baseDate.getTime() + 3.75 * 3600000),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_case_wrap',
    dependencies: ['MWB1_case_wrap_laminate']
  },
  {
    id: 'MWB1_case_board',
    name: 'MWB1 - Case Board',
    startTime: new Date(baseDate.getTime() + 3 * 3600000),
    duration: 1,
    type: 'element',
    parentId: 'MWB1_wrap_case',
    children: [
      'MWB1_case_board_cut',
      'MWB1_case_board_insert'
    ],
    isExpanded: true
  },
  {
    id: 'MWB1_case_board_cut',
    name: 'MWB1 - Case Board Cut',
    startTime: new Date(baseDate.getTime() + 3 * 3600000),
    duration: 0.5,
    type: 'task',
    parentId: 'MWB1_case_board'
  },
  {
    id: 'MWB1_case_board_insert',
    name: 'MWB1 - Case Board Insert',
    startTime: new Date(baseDate.getTime() + 3.5 * 3600000),
    duration: 0.5,
    type: 'task',
    parentId: 'MWB1_case_board',
    dependencies: ['MWB1_case_board_cut']
  },
  {
    id: 'MWB1_case_liner',
    name: 'MWB1 - Case Liner',
    startTime: new Date(baseDate.getTime() + 3 * 3600000),
    duration: 0.66,
    type: 'element',
    parentId: 'MWB1_wrap_case',
    children: [
      'MWB1_case_liner_laminate',
      'MWB1_case_liner_cut'
    ],
    isExpanded: true
  },
  {
    id: 'MWB1_case_liner_laminate',
    name: 'MWB1 - Case Liner Laminate',
    startTime: new Date(baseDate.getTime() + 3 * 3600000),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_case_liner'
  },
  {
    id: 'MWB1_case_liner_cut',
    name: 'MWB1 - Case Liner Cut',
    startTime: new Date(baseDate.getTime() + 3.33 * 3600000),
    duration: 0.33,
    type: 'task',
    parentId: 'MWB1_case_liner',
    dependencies: ['MWB1_case_liner_laminate']
  },
  {
    id: 'MWB1_line_case',
    name: 'MWB1 - Line Case',
    startTime: new Date(baseDate.getTime() + 5 * 3600000),
    duration: 2,
    type: 'component',
    parentId: 'MWB1_final_assembly',
    dependencies: ['MWB1_wrap_case'],
    isExpanded: true
  }
];