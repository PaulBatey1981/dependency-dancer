import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  // First, ensure all tasks have valid dates
  const tasksWithDates = tasks.map(task => {
    const now = new Date();
    return {
      ...task,
      startTime: task.startTime || now,
      endTime: task.endTime || new Date((task.startTime || now).getTime() + task.duration * 3600000)
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
      const parentLineItem = lineItems.find(li => 
        task.dependencies.some(depId => depId === li.id)
      );
      parentId = parentLineItem?.id || null;
    }

    return {
      id: task.id,
      text: task.name,
      start: task.startTime!,
      end: task.endTime!,
      duration: task.duration,
      progress: task.status === 'completed' ? 100 : 0,
      type: task.type === 'lineitem' ? 'project' : 'task',
      parent: parentId,
      open: true,
    };
  };

  // Transform all tasks and ensure they have required properties
  const wxTasks = tasksWithDates.map(transformTask);
  console.log('Transformed tasks:', wxTasks);

  // Create links only between tasks at the same level and with valid dependencies
  const links = tasksWithDates.flatMap(task => 
    task.dependencies
      .filter(depId => {
        const depTask = tasksWithDates.find(t => t.id === depId);
        // Only create links between tasks of the same type
        return depTask && depTask.type === task.type;
      })
      .map((depId, index) => ({
        id: `${depId}_${task.id}_${index}`,
        source: depId,
        target: task.id,
        type: "finish_to_start"
      }))
  );

  console.log('Generated links:', links);

  // Define columns for the grid area
  const columns = [
    { 
      id: "text", 
      header: "Task name", 
      flexGrow: 2 
    },
    {
      id: "start",
      header: "Start date",
      flexGrow: 1,
      align: "center",
    },
    {
      id: "duration",
      header: "Duration (hours)",
      align: "center",
      flexGrow: 1,
    },
    {
      id: "resource",
      header: "Resource",
      align: "center",
      flexGrow: 1,
      template: (task: any) => {
        const originalTask = tasksWithDates.find(t => t.id === task.id);
        return originalTask?.resource || '';
      }
    }
  ];

  const scales = [
    { unit: "month", step: 1, format: "MMMM yyy" },
    { unit: "day", step: 1, format: "d" },
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
        />
      </div>
    );
  } catch (error) {
    console.error('Error rendering Gantt chart:', error);
    return <div>Error loading Gantt chart</div>;
  }
};

export default WxGanttChart;