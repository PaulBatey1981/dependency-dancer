import { useRef, useState, useEffect } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import GanttHeader from './GanttHeader';
import TaskHierarchy from './TaskHierarchy';
import Timeline from './Timeline';
import { HOUR_WIDTH, ROW_HEIGHT, MIN_HOURS_DISPLAY } from './constants';
import GanttViewControls from './GanttViewControls';
import { useGanttTasks } from './hooks/useGanttTasks';
import { getTimeRange, getHoursForViewMode, generateHourMarkers } from './utils/ganttCalculations';
import { SimpleTask } from './types';

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const { tasks, setTasks, isLoading, loadTasks } = useGanttTasks();

  useEffect(() => {
    loadTasks();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading tasks...</div>;
  }

  console.log('All tasks loaded:', tasks);

  const { earliestStart, latestEnd } = getTimeRange(tasks);
  console.log('Timeline range:', { earliestStart, latestEnd });

  const totalHours = getHoursForViewMode(earliestStart, latestEnd, viewMode, MIN_HOURS_DISPLAY);
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

  // Get only the root tasks (tasks with type 'lineitem')
  const getRootTasks = () => {
    const rootTasks = tasks.filter(task => task.type === 'lineitem');
    console.log('Root tasks:', rootTasks.map(t => ({ id: t.id, name: t.name })));
    return rootTasks;
  };

  // Get child tasks for a given parent ID
  const getChildTasks = (parentId: string): SimpleTask[] => {
    const parent = tasks.find(t => t.id === parentId);
    if (!parent?.children) return [];
    
    return parent.children
      .map(childId => tasks.find(t => t.id === childId))
      .filter((t): t is SimpleTask => t !== undefined);
  };

  const hourMarkers = generateHourMarkers(earliestStart, totalHours, viewMode);

  const rootTasks = getRootTasks();
  console.log('Number of root tasks to render:', rootTasks.length);

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
                {rootTasks.map(task => (
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