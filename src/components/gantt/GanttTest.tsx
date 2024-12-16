import React from 'react';
import Timeline from 'react-gantt-timeline';
import { Card } from '@/components/ui/card';

const GanttTest = () => {
  // Sample data structure for react-gantt-timeline
  const data = {
    data: [
      {
        id: 1,
        start: new Date(2024, 0, 1),
        end: new Date(2024, 0, 5),
        name: 'Task 1',
      },
      {
        id: 2,
        start: new Date(2024, 0, 3),
        end: new Date(2024, 0, 8),
        name: 'Task 2',
      },
      {
        id: 3,
        start: new Date(2024, 0, 6),
        end: new Date(2024, 0, 10),
        name: 'Task 3',
      },
    ],
    links: []
  };

  const config = {
    header: {
      month: {
        display: true,
      },
      dayOfWeek: {
        display: true,
      },
      dayTime: {
        display: true,
      },
    },
    zoom: {
      level: 0,
    },
    taskList: {
      display: true,
      width: 200,
    },
  };

  console.log('Rendering GanttTest with data:', data);

  return (
    <Card className="w-full p-4">
      <div className="h-[600px]">
        <Timeline data={data} config={config} />
      </div>
    </Card>
  );
};

export default GanttTest;