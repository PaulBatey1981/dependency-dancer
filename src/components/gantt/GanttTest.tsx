import React from 'react';
import Timeline from 'react-gantt-timeline';
import { Card } from '@/components/ui/card';
import { Task } from '@/types/scheduling';

interface GanttTestProps {
  tasks: Task[];
}

const GanttTest = ({ tasks }: GanttTestProps) => {
  // Transform our tasks into the format expected by react-gantt-timeline
  const transformedData = {
    data: tasks
      .filter(task => task.startTime && task.status === 'scheduled') // Only include scheduled tasks
      .map(task => {
        const startTime = new Date(task.startTime!);
        const endTime = new Date(startTime.getTime() + task.duration * 3600000); // Convert hours to milliseconds
        
        console.log(`Transforming task ${task.id}:`, {
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          name: task.name
        });
        
        return {
          id: task.id,
          start: startTime,
          end: endTime,
          name: task.name,
          style: { // Provide styles directly in the data
            backgroundColor: '#4a90e2',
            borderRadius: '4px',
            color: '#fff',
          }
        };
      }),
    links: []
  };

  const config = {
    header: {
      month: {
        display: true,
        style: {
          backgroundColor: '#f4f5f7',
          fontSize: '16px',
        }
      },
      dayOfWeek: {
        display: true,
        style: {
          backgroundColor: '#f4f5f7'
        }
      },
      dayTime: {
        display: true,
        style: {
          background: '#f4f5f7'
        }
      }
    },
    taskList: {
      display: true,
      width: 200,
      style: {
        backgroundColor: '#f4f5f7',
        borderRight: '1px solid #e0e0e0'
      }
    },
    dataViewPort: {
      rows: {
        height: 40,
        style: {
          backgroundColor: '#fff'
        }
      }
    },
    links: {
      display: true
    },
    selectedTask: null,
    mode: 'month',
    onSelectItem: () => {},
  };

  console.log('Rendering GanttTest with transformed data:', JSON.stringify(transformedData, null, 2));

  return (
    <Card className="w-full p-4">
      <div className="h-[600px]">
        <Timeline data={transformedData} config={config} />
      </div>
    </Card>
  );
};

export default GanttTest;