import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";
import { useState } from "react";
import { ganttTestData } from "@/data/ganttTestData";
import { transformTasksToGantt } from "@/utils/ganttTransformer";
import { Button } from "./ui/button";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  const [useTestData, setUseTestData] = useState(true);
  
  console.log('Using test data:', useTestData);
  const finalTasks = useTestData ? ganttTestData : transformTasksToGantt(tasks);
  console.log('Final tasks structure:', JSON.stringify(finalTasks, null, 2));
  
  // Define columns for the grid area with improved styling
  const columns = [
    { 
      id: "text", 
      header: "Task name", 
      width: 280,
      resize: true,
      template: (task: any) => {
        // Add indentation based on task level
        const level = task.level || 0;
        const indent = level * 20;
        return (
          <div style={{ paddingLeft: `${indent}px` }}>
            {task.text}
          </div>
        );
      }
    },
    {
      id: "resource",
      header: "Resource",
      width: 140,
      align: "left",
      template: (task: any) => task.resource || ''
    }
  ];

  // Define multiple time scales for better visualization
  const scales = [
    { 
      unit: "hour", 
      step: 1, 
      format: "HH:mm",
    },
    { 
      unit: "day", 
      step: 1, 
      format: "d MMM", 
    },
    { 
      unit: "month", 
      step: 1, 
      format: "MMMM yyyy",
    }
  ];

  // Ensure we have valid tasks data
  if (!finalTasks || !Array.isArray(finalTasks) || finalTasks.length === 0) {
    console.warn('No valid tasks data available');
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setUseTestData(!useTestData)}
          variant="outline"
        >
          {useTestData ? "Show Real Data" : "Show Test Data"}
        </Button>
        <div className="h-[600px] w-full border rounded-lg flex items-center justify-center">
          No tasks data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setUseTestData(!useTestData)}
        variant="outline"
      >
        {useTestData ? "Show Real Data" : "Show Test Data"}
      </Button>
      
      <div className="h-[600px] w-full border rounded-lg">
        <Gantt 
          tasks={finalTasks}
          scales={scales}
          columns={columns}
          taskHeight={28}
          rowHeight={36}
          barFill={75}
          viewMode="day"
          resizing={false}
          moving={false}
          autoScheduling={false}
          cellWidth={60}
          columnWidth={280}
          treeExpanded={true}
          onTaskClick={(task) => console.log('Task clicked:', task)}
          onDoubleClick={(task) => console.log('Task double clicked:', task)}
          gridWidth={420}
          listWidth={420}
          rowPadding={4}
          dateFormat="MMM d, yyyy"
          timeFormat="HH:mm"
          locale="en-US"
          style={{
            '--gantt-bg-grid': '#f5f5f5',
            '--gantt-bg-progress': '#e2e8f0',
            '--gantt-border-grid': '#e2e8f0',
            '--gantt-text-color': '#1a1a1a',
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};

export default WxGanttChart;