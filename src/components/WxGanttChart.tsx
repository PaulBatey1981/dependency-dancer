import { Gantt } from "wx-react-gantt";
import { Task } from "@/types/scheduling";

interface WxGanttChartProps {
  tasks: Task[];
}

const WxGanttChart = ({ tasks }: WxGanttChartProps) => {
  // First, get all line items as they will be our root tasks
  const lineItems = tasks.filter(task => task.type === 'lineitem');
  console.log('Line items:', lineItems.map(item => item.id));

  // Helper function to get all child tasks for a given task
  const getChildTasks = (parentId: string): Task[] => {
    return tasks.filter(task => task.dependencies.includes(parentId));
  };

  // Transform tasks to wx-react-gantt format with proper hierarchy
  const transformTask = (task: Task, parentId?: string) => {
    const now = new Date();
    const startTime = task.startTime || now;
    const endTime = task.endTime || new Date(startTime.getTime() + task.duration * 3600000);

    return {
      id: task.id,
      text: task.name,
      start: startTime,
      end: endTime,
      duration: task.duration,
      progress: 0,
      type: task.type === 'lineitem' ? 'project' : 'task',
      parent: parentId,
      open: true,
    };
  };

  // Build the task hierarchy
  const buildTaskHierarchy = () => {
    const wxTasks: any[] = [];

    // Process each line item and its subtasks
    lineItems.forEach(lineItem => {
      // Add the line item itself
      wxTasks.push(transformTask(lineItem));
      console.log(`Processing line item: ${lineItem.id}`);

      // Process immediate children
      const children = getChildTasks(lineItem.id);
      children.forEach(child => {
        wxTasks.push(transformTask(child, lineItem.id));
        console.log(`Added child ${child.id} to line item ${lineItem.id}`);
      });
    });

    return wxTasks;
  };

  const wxTasks = buildTaskHierarchy();
  console.log('Final transformed tasks:', wxTasks);

  // Create links from dependencies
  const links = tasks.flatMap(task => 
    task.dependencies.map((depId, index) => ({
      id: `${task.id}_${depId}_${index}`,
      source: depId,
      target: task.id,
      type: "e2e"
    }))
  );

  // Define columns for the grid area
  const columns = [
    { id: "text", header: "Task name", flexGrow: 2 },
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
        const originalTask = tasks.find(t => t.id === task.id);
        return originalTask?.resource || '';
      }
    }
  ];

  const scales = [
    { unit: "month", step: 1, format: "MMMM yyy" },
    { unit: "day", step: 1, format: "d" },
  ];

  console.log('WxGantt tasks:', wxTasks);
  console.log('WxGantt links:', links);
  console.log('WxGantt columns:', columns);

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
};

export default WxGanttChart;