import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";
import { useState } from "react";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  const [useMinimalExample, setUseMinimalExample] = useState(true);
  
  // Minimal working example that follows the exact structure required by wx-react-gantt
  const minimalExample = [{
    id: 'root',
    text: 'MWB Project',
    type: 'project',
    start: new Date(),
    end: new Date(new Date().getTime() + 24 * 3600000),
    progress: 0,
    children: [{
      id: 'task1',
      text: 'Assembly Task',
      type: 'task',
      start: new Date(),
      end: new Date(new Date().getTime() + 3 * 3600000),
      progress: 0,
      resource: 'bench',
      children: []
    }],
    open: true
  }];

  // Transform tasks
  const transformTasks = () => {
    console.log('Starting task transformation with tasks:', tasks);

    // Get line items (top-level tasks)
    const lineItems = tasks.filter(task => task.type === 'lineitem');
    console.log('Found line items:', lineItems);

    // Transform a single task into the format expected by wx-react-gantt
    const transformTask = (task: Task): any => {
      console.log(`Processing task: ${task.id}`);

      // Find child tasks (tasks that have this task as their dependency)
      const childTasks = tasks.filter(t => {
        const deps = t.dependencies || [];
        return deps.includes(task.id);
      });
      
      console.log(`Found ${childTasks.length} children for task ${task.id}:`, childTasks.map(t => t.id));

      // Transform children first
      const children = childTasks.map(child => transformTask(child));

      // Ensure we have valid dates
      const now = new Date();
      const startTime = task.startTime || now;
      const endTime = task.endTime || new Date(startTime.getTime() + (task.duration || 1) * 3600000);

      // Create a valid task object that matches wx-react-gantt's requirements
      return {
        id: task.id,
        text: task.name,
        type: task.type === 'lineitem' ? 'project' : 'task',
        start: startTime,
        end: endTime,
        progress: task.status === 'completed' ? 100 : 0,
        resource: task.resource || '',
        children: children || [], // Ensure children is always an array
        open: true
      };
    };

    // Transform all line items and create root node
    const transformedTasks = lineItems.map(lineItem => transformTask(lineItem));
    
    // Create a root node to contain all line items
    const rootNode = {
      id: 'root',
      text: 'All Projects',
      type: 'project',
      start: new Date(),
      end: new Date(new Date().getTime() + 24 * 3600000),
      progress: 0,
      children: transformedTasks,
      open: true
    };

    console.log('Final transformed tasks:', [rootNode]);
    return [rootNode];
  };

  const finalTasks = useMinimalExample ? minimalExample : transformTasks();
  
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
      <button
        onClick={() => setUseMinimalExample(!useMinimalExample)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {useMinimalExample ? "Show Real Data" : "Show Minimal Example"}
      </button>
      
      <div className="h-[600px] w-full">
        <Gantt 
          tasks={finalTasks}
          scales={scales}
          columns={columns}
          taskHeight={40}
          rowHeight={40}
          barFill={80}
          viewMode="month"
          resizing={false}
          moving={false}
          autoScheduling={false}
          cellWidth={40}
          columnWidth={300}
          treeExpanded={true}
        />
      </div>
    </div>
  );
};

export default WxGanttChart;