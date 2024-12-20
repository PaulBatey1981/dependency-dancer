import { useRef, useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import GanttHeader from './GanttHeader';
import TaskHierarchy from './TaskHierarchy';
import Timeline from './Timeline';
import { SimpleTask } from './types';
import { HOUR_WIDTH, ROW_HEIGHT, MIN_HOURS_DISPLAY } from './constants';
import GanttViewControls from './GanttViewControls';
import { sampleTasks } from './sampleData';

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<SimpleTask[]>(sampleTasks);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  const earliestStart = new Date(Math.min(...tasks.map(t => t.startTime.getTime())));
  const latestEnd = new Date(Math.max(
    ...tasks.map(t => t.startTime.getTime() + t.duration * 3600000)
  ));

  const getHoursForViewMode = () => {
    const totalTaskHours = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60));
    
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
    const hoursFromStart = (task.startTime.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
    return (hoursFromStart / totalHours) * 100;
  };

  const calculateTaskWidth = (duration: number) => {
    return (duration / totalHours) * 100;
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

  const getRootTasks = () => tasks.filter(task => !task.parentId);
  const getChildTasks = (parentId: string) => tasks.filter(task => task.parentId === parentId);

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
    <div className="space-y-4 h-full">
      <div className="mb-4">
        <GanttViewControls viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>
      
      <div className="h-full border rounded-lg w-full">
        <GanttHeader hourMarkers={hourMarkers} />
        <div className="grid grid-cols-[300px,1fr] h-[calc(100%-2rem)]">
          <div className="min-w-[300px] h-full overflow-hidden border-r">
            <div ref={taskListRef} className="h-full" style={{ overflowY: 'hidden' }}>
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
          </div>

          <div className="relative overflow-hidden">
            <ScrollArea className="h-full w-full" orientation="horizontal">
              <div
                ref={timelineRef}
                style={{ 
                  width: `${timelineWidth}px`,
                  minWidth: '100%',
                  height: tasks.length * ROW_HEIGHT
                }}
              >
                <Timeline 
                  hourMarkers={hourMarkers}
                  tasks={tasks}
                  calculateTaskPosition={calculateTaskPosition}
                  calculateTaskWidth={calculateTaskWidth}
                />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGanttChart;