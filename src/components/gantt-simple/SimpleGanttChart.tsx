import { useRef, useState, useEffect } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import GanttHeader from './GanttHeader';
import TaskHierarchy from './TaskHierarchy';
import Timeline from './Timeline';
import { SimpleTask } from './types';
import { HOUR_WIDTH, ROW_HEIGHT, MIN_HOURS_DISPLAY } from './constants';
import GanttViewControls from './GanttViewControls';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log('Loading tasks from Supabase...');
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            task_dependencies!task_dependencies_task_id_fkey(depends_on_id)
          `);

        if (tasksError) throw tasksError;

        if (!tasksData?.length) {
          console.log('No tasks found in database');
          setTasks([]);
          return;
        }

        console.log('Tasks loaded from Supabase:', tasksData);
        const formattedTasks: SimpleTask[] = tasksData.map(task => ({
          id: task.id,
          name: task.name,
          type: task.type,
          startTime: task.start_time ? new Date(task.start_time) : new Date(),
          duration: Number(task.duration),
          dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || [],
          isExpanded: false,
          parentId: task.line_item_id || undefined,
          resource: task.resource_id,
          isFixed: task.is_fixed
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast({
          title: "Error loading tasks",
          description: "There was an error loading the tasks. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (isLoading || !tasks.length) {
    return <div className="flex items-center justify-center h-full">Loading tasks...</div>;
  }

  console.log('All tasks:', tasks);

  const earliestStart = new Date(Math.min(
    ...tasks
      .filter(t => t.startTime)
      .map(t => t.startTime.getTime())
  ));

  const latestEnd = new Date(Math.max(
    ...tasks
      .filter(t => t.startTime)
      .map(t => t.startTime.getTime() + t.duration * 3600000)
  ));

  console.log('Timeline range:', { earliestStart, latestEnd });

  const getHoursForViewMode = () => {
    const totalTaskHours = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60));
    console.log('Total task hours:', totalTaskHours);
    
    switch (viewMode) {
      case 'week':
        return Math.max(totalTaskHours, 24 * 7);
      case 'month':
        return Math.max(totalTaskHours, 24 * 30);
      case 'day':
      default:
        return Math.max(totalTaskHours, MIN_HOURS_DISPLAY);
    }
  };

  const totalHours = getHoursForViewMode();
  const timelineWidth = totalHours * HOUR_WIDTH;

  const calculateTaskPosition = (task: SimpleTask) => {
    if (!task.startTime) return 0;
    const hoursFromStart = (task.startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    const position = (hoursFromStart / totalHours) * 100;
    console.log(`Task ${task.id} position:`, position);
    return position;
  };

  const calculateTaskWidth = (duration: number) => {
    const width = (duration / totalHours) * 100;
    return width;
  };

  const toggleExpand = (taskId: string) => {
    console.log('Toggling expansion for task:', taskId);
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, isExpanded: !task.isExpanded }
          : task
      )
    );
  };

  const getRootTasks = () => {
    const rootTasks = tasks.filter(task => !task.parentId);
    console.log('Root tasks:', rootTasks);
    return rootTasks;
  };

  const getChildTasks = (parentId: string) => {
    const childTasks = tasks.filter(task => task.parentId === parentId);
    console.log(`Child tasks for ${parentId}:`, childTasks);
    return childTasks;
  };

  const generateHourMarkers = () => {
    const markers = [];
    const intervalHours = viewMode === 'month' ? 24 : viewMode === 'week' ? 12 : 1;
    
    for (let i = 0; i <= totalHours; i += intervalHours) {
      const markerTime = new Date(earliestStart.getTime() + i * 60 * 60 * 1000);
      const position = (i / totalHours) * 100;
      markers.push({ position, time: markerTime });
    }
    
    return markers;
  };

  const hourMarkers = generateHourMarkers();

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 mb-4">
        <GanttViewControls viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>
      
      <div className="flex-1 border rounded-lg w-full flex flex-col min-h-0">
        <div className="shrink-0">
          <GanttHeader hourMarkers={hourMarkers} />
        </div>
        <div className="grid grid-cols-[300px,1fr] flex-1 min-h-0">
          <div className="min-w-[300px] overflow-hidden border-r">
            <ScrollArea className="h-full">
              <div ref={taskListRef}>
                {getRootTasks().map(task => (
                  <TaskHierarchy
                    key={task.id}
                    task={task}
                    level={0}
                    onToggleExpand={toggleExpand}
                    getChildTasks={getChildTasks}
                  />
                ))}
              </div>
              <ScrollBar />
            </ScrollArea>
          </div>

          <div className="relative overflow-hidden min-h-0">
            <ScrollArea className="h-full">
              <div
                ref={timelineRef}
                className="h-full"
                style={{ 
                  width: `${timelineWidth}px`,
                  minWidth: '100%',
                }}
              >
                <Timeline 
                  hourMarkers={hourMarkers}
                  tasks={tasks}
                  calculateTaskPosition={calculateTaskPosition}
                  calculateTaskWidth={calculateTaskWidth}
                />
              </div>
              <ScrollBar />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGanttChart;