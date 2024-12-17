const baseDate = new Date();
const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1); // Start of current month

export const ganttTestData = [
  {
    id: 'root',
    text: 'All Projects',
    type: 'project',
    start: startDate,
    end: new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0), // End of current month
    progress: 0,
    children: [
      {
        id: 'mwb1',
        text: 'MWB Project 1',
        type: 'project',
        start: startDate,
        end: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days duration
        progress: 60,
        children: [
          {
            id: 'mwb1_case',
            text: 'Case Production',
            type: 'project',
            start: startDate,
            end: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            progress: 100,
            children: [
              {
                id: 'mwb1_case_print',
                text: 'Print Case Wrap',
                type: 'task',
                start: startDate,
                end: new Date(startDate.getTime() + 3 * 60 * 60 * 1000), // 3 hours
                progress: 100,
                resource: 'konica',
                children: []
              },
              {
                id: 'mwb1_case_laminate',
                text: 'Laminate Case Wrap',
                type: 'task',
                start: new Date(startDate.getTime() + 4 * 60 * 60 * 1000),
                end: new Date(startDate.getTime() + 7 * 60 * 60 * 1000),
                progress: 100,
                resource: 'dk_europa',
                children: []
              }
            ]
          },
          {
            id: 'mwb1_tray',
            text: 'Base Tray Production',
            type: 'project',
            start: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            end: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000),
            progress: 20,
            children: [
              {
                id: 'mwb1_tray_cut',
                text: 'Cut Base Board',
                type: 'task',
                start: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
                end: new Date(startDate.getTime() + (2 * 24 + 5) * 60 * 60 * 1000),
                progress: 100,
                resource: 'zund_m800',
                children: []
              },
              {
                id: 'mwb1_tray_magnets',
                text: 'Install Magnets',
                type: 'task',
                start: new Date(startDate.getTime() + (3 * 24) * 60 * 60 * 1000),
                end: new Date(startDate.getTime() + (4 * 24) * 60 * 60 * 1000),
                progress: 0,
                resource: 'bench',
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
];