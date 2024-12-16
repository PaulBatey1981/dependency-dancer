import React, { useEffect } from 'react';
import { Gantt as DhtmlxGanttComponent } from '@dhtmlx/trial-react-gantt';
import { Task } from '@/types/scheduling';

// Import CSS from CDN as fallback since local import is failing
const DHTMLX_CSS_URL = 'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css';

interface DhtmlxGanttProps {
  tasks: Task[];
}

const DhtmlxGantt = ({ tasks }: DhtmlxGanttProps) => {
  useEffect(() => {
    // Dynamically add CSS to ensure it's loaded
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = DHTMLX_CSS_URL;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Transform our tasks into DHTMLX format with null checks
  const ganttTasks = {
    data: tasks.map(task => ({
      id: task.id,
      text: task.name,
      start_date: task.startTime || new Date(),
      duration: task.duration || 1,
      parent: task.dependencies && task.dependencies.length > 0 ? task.dependencies[0] : null,
      progress: task.status === 'completed' ? 1 : 0,
      type: task.type,
      open: true
    })),
    links: tasks.reduce((acc, task) => {
      if (!task.dependencies || !Array.isArray(task.dependencies)) {
        return acc;
      }
      
      const taskLinks = task.dependencies.map(depId => ({
        id: `${task.id}_${depId}`,
        source: depId,
        target: task.id,
        type: '0'
      }));
      
      return [...acc, ...taskLinks];
    }, [] as Array<{id: string; source: string; target: string; type: string}>)
  };

  console.log('Transformed Gantt tasks:', ganttTasks);

  return (
    <div className="w-full h-[600px]">
      <DhtmlxGanttComponent
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