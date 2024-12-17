import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";
import { useState } from "react";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  const [useMinimalExample, setUseMinimalExample] = useState(true);
  
  // Minimal working example based on library requirements
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
      resource: 'bench'
    }],
    open: true
  }];

  // Transform actual tasks
  const transformTasks = () => {
    console.log('Starting task transformation with tasks:', tasks);

    // First, ensure all tasks have valid dates
    const tasksWithDates = tasks.map(task => {
      const now = new Date();
      const startTime = task.startTime || now;
      const endTime = task.endTime || new Date(startTime.getTime() + task.duration * 3600000);
      return {
        ...task,
        startTime,
        endTime,
        dependencies: task.dependencies || []
      };
    });

    // Create a task map for quick lookups
    const taskMap = new Map(tasksWithDates.map(task => [task.id, task]));

    // Get line items (top-level tasks)
    const lineItems = tasksWithDates.filter(task => task.type === 'lineitem');
    console.log('Found line items:', lineItems.map(t => t.id));

    // Transform a single task and its dependencies
    const transformTask = (task: Task, processedTasks = new Set<string>()): any => {
      if (!task || processedTasks.has(task.id)) {
        console.log(`Skipping task ${task?.id} - already processed or null`);
        return null;
      }

      console.log(`Processing task: ${task.id}`);
      processedTasks.add(task.id);

      // Get dependent tasks that haven't been processed yet
      const dependentTasks = tasksWithDates
        .filter(t => t.dependencies?.includes(task.id) && !processedTasks.has(t.id));
      
      console.log(`Found ${dependentTasks.length} unprocessed dependents for ${task.id}`);

      // Transform children first
      const children = dependentTasks
        .map(child => transformTask(child, processedTasks))
        .filter(Boolean); // Remove any null results

      const transformedTask = {
        id: task.id,
        text: task.name,
        start: task.startTime!,
        end: task.endTime!,
        progress: task.status === 'completed' ? 100 : 0,
        type: task.type === 'lineitem' ? 'project' : 'task',
        children: children.length > 0 ? children : undefined,
        open: true,
        resource: task.resource
      };

      console.log(`Transformed task ${task.id}:`, transformedTask);
      return transformedTask;
    };

    // Process all line items first
    const processedTasks = new Set<string>();
    const transformedTasks = lineItems
      .map(task => transformTask(task, processedTasks))
      .filter(Boolean);

    console.log('Final transformed tasks:', JSON.stringify(transformedTasks, null, 2));
    return transformedTasks;
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