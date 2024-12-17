export const ganttTestData = [{
  id: 'project1',
  text: 'MWB Project 1',
  type: 'project',
  start: new Date('2024-01-01T09:00:00'),
  end: new Date('2024-01-10T17:00:00'),
  progress: 60,
  children: [
    {
      id: 'phase1',
      text: 'Phase 1 - Case Production',
      type: 'project',
      start: new Date('2024-01-01T09:00:00'),
      end: new Date('2024-01-05T17:00:00'),
      progress: 100,
      children: [
        {
          id: 'task1',
          text: 'Print Case Wrap',
          type: 'task',
          start: new Date('2024-01-01T09:00:00'),
          end: new Date('2024-01-01T12:00:00'),
          progress: 100,
          resource: 'konica',
          children: []
        },
        {
          id: 'task2',
          text: 'Laminate Case Wrap',
          type: 'task',
          start: new Date('2024-01-01T13:00:00'),
          end: new Date('2024-01-01T16:00:00'),
          progress: 100,
          resource: 'dk_europa',
          children: []
        },
        {
          id: 'task3',
          text: 'Cut Case Wrap',
          type: 'task',
          start: new Date('2024-01-02T09:00:00'),
          end: new Date('2024-01-02T12:00:00'),
          progress: 100,
          resource: 'zund_m800',
          children: []
        }
      ],
      open: true
    },
    {
      id: 'phase2',
      text: 'Phase 2 - Base Tray Production',
      type: 'project',
      start: new Date('2024-01-06T09:00:00'),
      end: new Date('2024-01-10T17:00:00'),
      progress: 20,
      children: [
        {
          id: 'task4',
          text: 'Cut Base Board',
          type: 'task',
          start: new Date('2024-01-06T09:00:00'),
          end: new Date('2024-01-06T14:00:00'),
          progress: 100,
          resource: 'zund_m800',
          children: []
        },
        {
          id: 'task5',
          text: 'Install Magnets',
          type: 'task',
          start: new Date('2024-01-07T09:00:00'),
          end: new Date('2024-01-07T17:00:00'),
          progress: 0,
          resource: 'bench',
          children: []
        },
        {
          id: 'task6',
          text: 'Final Assembly',
          type: 'task',
          start: new Date('2024-01-08T09:00:00'),
          end: new Date('2024-01-10T17:00:00'),
          progress: 0,
          resource: 'bench',
          children: []
        }
      ],
      open: true
    }
  ],
  open: true
}];