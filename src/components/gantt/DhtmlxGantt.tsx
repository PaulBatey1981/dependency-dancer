import React, { useEffect, useRef } from 'react';
import { Gantt } from '@dhtmlx/trial-react-gantt';
import { Task } from '@/types/scheduling';
// Import CSS in a way that Vite can handle
import '@dhtmlx/trial-react-gantt/codebase/dhtmlxgantt.css';

interface DhtmlxGanttProps {
  tasks: Task[];
}

const DhtmlxGantt = ({ tasks }: DhtmlxGanttProps) => {
  // Transform our tasks into DHTMLX format
  const ganttTasks = {
    data: tasks.map(task => ({
      id: task.id,
      text: task.name,
      start_date: task.startTime,
      duration: task.duration,
      parent: task.dependencies[0], // First dependency is treated as parent
      progress: task.status === 'completed' ? 1 : 0,
      type: task.type,
      open: true
    })),
    links: tasks.flatMap(task => 
      task.dependencies.map(depId => ({
        id: `${task.id}_${depId}`,
        source: depId,
        target: task.id,
        type: '0'
      }))
    )
  };

  console.log('Transformed Gantt tasks:', ganttTasks);

  return (
    <div className="w-full h-[600px]">
      <Gantt
        tasks={ganttTasks}
        zoom="Days"
        columns={[
          { name: "text", label: "Task name", width: 250 },
          { name: "start_date", label: "Start time", width: 130 },
          { name: "duration", label: "Duration", width: 130 },
        ]}
        onTaskDrag={(id, mode, task) => {
          console.log('Task dragged:', id, mode, task);
        }}
        onLinkCreated={(id, link) => {
          console.log('Link created:', id, link);
        }}
      />
    </div>
  );
};

export default DhtmlxGantt;