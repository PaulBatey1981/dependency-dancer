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
  
  // Define columns for the grid area
  const columns = [
    { 
      id: "text", 
      header: "Task name", 
      width: 300,
      resize: true
    },
    {
      id: "resource",
      header: "Resource",
      width: 120,
      align: "center"
    }
  ];

  const scales = [
    { unit: "day", step: 1, format: "d" },
    { unit: "month", step: 1, format: "MMMM yyyy" }
  ];

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
          taskHeight={32}
          rowHeight={40}
          barFill={80}
          viewMode="month"
          resizing={false}
          moving={false}
          autoScheduling={false}
          cellWidth={40}
          columnWidth={300}
          treeExpanded={true}
          onTaskClick={(task) => console.log('Task clicked:', task)}
          onDoubleClick={(task) => console.log('Task double clicked:', task)}
        />
      </div>
    </div>
  );
};

export default WxGanttChart;