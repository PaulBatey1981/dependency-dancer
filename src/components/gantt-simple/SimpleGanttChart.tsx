import { useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import GanttHeader from './GanttHeader';
import TaskHierarchy from './TaskHierarchy';
import Timeline from './Timeline';
import GanttControls from './GanttControls';
import { SimpleTask } from './types';
import { 
  HOUR_WIDTH, 
  ROW_HEIGHT, 
  MIN_HOURS_DISPLAY,
  MIN_ZOOM,
  MAX_ZOOM 
} from './constants';
import {
  calculateTimelineWidth,
  calculateTaskPosition,
  calculateTaskWidth,
  getTimeRange
} from './utils/timelineUtils';

const sampleTasks: SimpleTask[] = [
  {
    id: 'lineitem1',
    name: 'MWB Production',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 9,
    type: 'lineitem',
    children: ['task1', 'task2', 'task3'],
    isExpanded: true
  },
  {
    id: 'task1',
    name: 'Print Materials',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 2,
    type: 'task',
    parentId: 'lineitem1',
    isFixed: true,
    children: ['element1', 'element2'],
    isExpanded: true
  },
  {
    id: 'element1',
    name: 'Setup Printer',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 0.5,
    type: 'task',
    parentId: 'task1'
  },
  {
    id: 'element2',
    name: 'Print Run',
    startTime: new Date('2024-03-20T09:30:00'),
    duration: 1.5,
    type: 'task',
    parentId: 'task1',
    dependencies: ['element1']
  },
  {
    id: 'task2',
    name: 'Cut Boards',
    startTime: new Date('2024-03-20T08:00:00'),
    duration: 3,
    type: 'task',
    parentId: 'lineitem1',
    dependencies: ['task1'],
    children: ['element3', 'element4'],
    isExpanded: true
  },
  {
    id: 'element3',
    name: 'Machine Setup',
    startTime: new Date('2024-03-20T08:00:00'),
    duration: 1,
    type: 'task',
    parentId: 'task2'
  },
  {
    id: 'element4',
    name: 'Cutting Process',
    startTime: new Date('2024-03-20T09:00:00'),
    duration: 2,
    type: 'task',
    parentId: 'task2',
    dependencies: ['element3']
  },
  {
    id: 'task3',
    name: 'Assembly',
    startTime: new Date('2024-03-20T14:00:00'),
    duration: 4,
    type: 'task',
    parentId: 'lineitem1',
    dependencies: ['task2'],
    children: ['element5', 'element6'],
    isExpanded: true
  },
  {
    id: 'element5',
    name: 'Component Prep',
    startTime: new Date('2024-03-20T14:00:00'),
    duration: 1.5,
    type: 'task',
    parentId: 'task3'
  },
  {
    id: 'element6',
    name: 'Final Assembly',
    startTime: new Date('2024-03-20T15:30:00'),
    duration: 2.5,
    type: 'task',
    parentId: 'task3',
    dependencies: ['element5']
  },
  {
    id: 'lineitem2',
    name: 'HWB Production',
    startTime: new Date('2024-03-20T10:00:00'),
    duration: 7,
    type: 'lineitem',
    children: ['task4', 'task5'],
    isExpanded: true
  },
  {
    id: 'task4',
    name: 'Material Preparation',
    startTime: new Date('2024-03-20T10:00:00'),
    duration: 3,
    type: 'task',
    parentId: 'lineitem2',
    children: ['element7', 'element8'],
    isExpanded: true
  },
  {
    id: 'element7',
    name: 'Material Selection',
    startTime: new Date('2024-03-20T10:00:00'),
    duration: 1,
    type: 'task',
    parentId: 'task4'
  },
  {
    id: 'element8',
    name: 'Material Processing',
    startTime: new Date('2024-03-20T11:00:00'),
    duration: 2,
    type: 'task',
    parentId: 'task4',
    dependencies: ['element7']
  },
  {
    id: 'task5',
    name: 'Production Process',
    startTime: new Date('2024-03-20T13:00:00'),
    duration: 4,
    type: 'task',
    parentId: 'lineitem2',
    dependencies: ['task4'],
    children: ['element9', 'element10'],
    isExpanded: true
  },
  {
    id: 'element9',
    name: 'Initial Production',
    startTime: new Date('2024-03-20T13:00:00'),
    duration: 2,
    type: 'task',
    parentId: 'task5',
    children: ['subelement1', 'subelement2'],
    isExpanded: true
  },
  {
    id: 'subelement1',
    name: 'Setup Production Line',
    startTime: new Date('2024-03-20T13:00:00'),
    duration: 1,
    type: 'task',
    parentId: 'element9'
  },
  {
    id: 'subelement2',
    name: 'Run Production',
    startTime: new Date('2024-03-20T14:00:00'),
    duration: 1,
    type: 'task',
    parentId: 'element9',
    dependencies: ['subelement1']
  },
  {
    id: 'element10',
    name: 'Quality Check',
    startTime: new Date('2024-03-20T15:00:00'),
    duration: 2,
    type: 'task',
    parentId: 'task5',
    dependencies: ['element9'],
    children: ['subelement3', 'subelement4'],
    isExpanded: true
  },
  {
    id: 'subelement3',
    name: 'Visual Inspection',
    startTime: new Date('2024-03-20T15:00:00'),
    duration: 1,
    type: 'task',
    parentId: 'element10'
  },
  {
    id: 'subelement4',
    name: 'Quality Testing',
    startTime: new Date('2024-03-20T16:00:00'),
    duration: 1,
    type: 'task',
    parentId: 'element10',
    dependencies: ['subelement3']
  }
];

const SimpleGanttChart = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<SimpleTask[]>(sampleTasks);
  const [zoom, setZoom] = useState(1);

  const { earliestStart, latestEnd } = getTimeRange(tasks);
  const totalTaskHours = Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60));
  const totalHours = Math.max(totalTaskHours, MIN_HOURS_DISPLAY);
  const timelineWidth = calculateTimelineWidth(totalHours, HOUR_WIDTH, zoom);

  const handleZoomChange = (newZoom: number) => {
    console.log('Zoom changed to:', newZoom);
    setZoom(newZoom);
  };

  const snapToNow = () => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const hoursFromStart = (now.getTime() - earliestStart.getTime()) / (1000 * 60 * 60);
      const scrollPosition = (hoursFromStart * HOUR_WIDTH * zoom);
      console.log('Scrolling to position:', scrollPosition);
      scrollContainerRef.current.scrollTo({
        left: scrollPosition - scrollContainerRef.current.clientWidth / 2,
        behavior: 'smooth'
      });
    }
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

  const hourMarkers = Array.from({ length: Math.ceil(totalHours * zoom) + 1 }).map((_, index) => {
    const markerTime = new Date(earliestStart.getTime() + (index / zoom) * 60 * 60 * 1000);
    const position = (index / (totalHours * zoom)) * 100;
    return { position, time: markerTime };
  });

  return (
    <div className="space-y-4 h-full">
      <GanttControls 
        zoom={zoom} 
        onZoomChange={handleZoomChange}
        onSnapToNow={snapToNow}
      />
      
      <div className="h-full border rounded-lg w-full">
        <GanttHeader hourMarkers={hourMarkers} />
        <div className="grid grid-cols-[300px,1fr] h-[calc(100%-2rem)]">
          <div className="min-w-[300px] h-full overflow-hidden border-r">
            <div 
              ref={taskListRef}
              className="h-full overflow-y-auto"
            >
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

          <div 
            ref={scrollContainerRef}
            className="overflow-auto"
            onScroll={(e) => {
              if (taskListRef.current) {
                taskListRef.current.scrollTop = e.currentTarget.scrollTop;
              }
            }}
          >
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
                calculateTaskPosition={(task) => calculateTaskPosition(task, earliestStart, totalHours)}
                calculateTaskWidth={(duration) => calculateTaskWidth(duration, totalHours)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleGanttChart;
