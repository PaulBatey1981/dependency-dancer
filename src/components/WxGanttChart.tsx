import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  console.log('Initial tasks:', tasks);

  // First, ensure all tasks have valid dates
  const tasksWithDates = tasks.map(task => {
    const now = new Date();
    const startTime = task.startTime || now;
    const endTime = task.endTime || new Date(startTime.getTime() + task.duration * 3600000);
    return {
      ...task,
      startTime,
      endTime
    };
  });

  // Get all line items as they will be our root tasks
  const lineItems = tasksWithDates.filter(task => task.type === 'lineitem');
  console.log('Line items:', lineItems.map(item => item.id));

  // Transform tasks to wx-react-gantt format
  const transformTask = (task: Task) => {
    // For non-lineitem tasks, find their direct parent lineitem
    let parentId = null;
    if (task.type !== 'lineitem') {
      // Find the first line item in the task's dependencies
      const parentLineItem = lineItems.find(li => task.dependencies.includes(li.id));
      if (parentLineItem) {
        parentId = parentLineItem.id;
      }
    }

    const transformedTask = {
      id: task.id,
      text: task.name,
      start: task.startTime!,
      end: task.endTime!,
      duration: task.duration,
      progress: task.status === 'completed' ? 100 : 0,
      type: task.type === 'lineitem' ? 'project' : 'task',
      parent: parentId,
      open: true,
      children: [], // Initialize empty children array
      resource: task.resource
    };

    console.log(`Transformed task ${task.id}:`, transformedTask);
    return transformedTask;
  };

  // Transform all tasks and ensure they have required properties
  const wxTasks = tasksWithDates.map(transformTask);
  console.log('All transformed tasks:', wxTasks);

  // Create links between tasks
  const links = tasksWithDates.flatMap(task => 
    task.dependencies
      .filter(depId => tasksWithDates.some(t => t.id === depId))
      .map((depId, index) => {
        const link = {
          id: `${depId}_${task.id}_${index}`,
          source: depId,
          target: task.id,
          type: "finish_to_start"
        };
        console.log(`Created link:`, link);
        return link;
      })
  );

  console.log('Generated links:', links);

  // Define columns for the grid area
  const columns = [
    { 
      id: "text", 
      header: "Task name", 
      width: 200,
      resize: true
    },
    {
      id: "start",
      header: "Start date",
      width: 150,
      align: "center",
    },
    {
      id: "duration",
      header: "Duration (hours)",
      width: 120,
      align: "center",
    },
    {
      id: "resource",
      header: "Resource",
      width: 120,
      align: "center"
    }
  ];

  const scales = [
    { unit: "day", step: 1, format: "D" },
    { unit: "month", step: 1, format: "MMMM YYYY" }
  ];

  // Add error boundary to catch and log any errors
  try {
    return (
      <div className="h-[600px] w-full">
        <Gantt 
          tasks={wxTasks} 
          links={links} 
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
          columnWidth={200}
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering Gantt chart:', error);
    return <div>Error loading Gantt chart</div>;
  }
};

export default WxGanttChart;