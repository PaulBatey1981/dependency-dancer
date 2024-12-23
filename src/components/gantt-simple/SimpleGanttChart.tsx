import { useRef, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import GanttHeader from './GanttHeader';
import TaskHierarchy from './TaskHierarchy';
import Timeline from './Timeline';
import { HOUR_WIDTH, ROW_HEIGHT, MIN_HOURS_DISPLAY } from './constants';
import { useGanttTasks } from './hooks/useGanttTasks';
import { getTimeRange, getHoursForViewMode, generateHourMarkers } from './utils/ganttCalculations';
import GanttViewControls from './GanttViewControls';

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const { tasks, setTasks, isLoading } = useGanttTasks();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading tasks...</div>;
  }

  console.log('All tasks loaded:', tasks);

  const { earliestStart, latestEnd } = getTimeRange(tasks);
  console.log('Timeline range:', { earliestStart, latestEnd });

  const totalHours = getHoursForViewMode(earliestStart, latestEnd, viewMode, MIN_HOURS_DISPLAY);
  const timelineWidth = totalHours * HOUR_WIDTH;

  // Get all line items (top-level tasks)
  const lineItems = tasks.filter(task => task.type === 'lineitem');
  console.log('Line items:', lineItems.map(t => ({ id: t.id, name: t.name })));

  // Get child tasks for a given parent ID
  const getChildTasks = (parentId: string) => {
    console.log(`Getting children for task ${parentId}`);
    const childTasks = tasks.filter(task => task.dependencies.includes(parentId));
    console.log(`Found ${childTasks.length} children for task ${parentId}:`, childTasks.map(t => t.id));
    return childTasks;
  };

  const hourMarkers = generateHourMarkers(earliestStart, totalHours, viewMode);

  // Calculate task positions
  const calculateTaskPosition = (task: any) => {
    if (!task.startTime) return 0;
    const hoursFromStart = (task.startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    const position = (hoursFromStart / totalHours) * 100;
    console.log(`Task ${task.id} position: ${position}`);
    return position;
  };

  const calculateTaskWidth = (duration: number) => {
    const width = (duration / totalHours) * 100;
    console.log(`Task width: ${width}%`);
    return width;
  };

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
                {lineItems.map(task => (
                  <TaskHierarchy
                    key={task.id}
                    task={task}
                    level={0}
                    onToggleExpand={(taskId) => {
                      setTasks(prevTasks =>
                        prevTasks.map(t =>
                          t.id === taskId
                            ? { ...t, isExpanded: !t.isExpanded }
                            : t
                        )
                      );
                    }}
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