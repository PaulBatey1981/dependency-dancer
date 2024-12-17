import { useState } from 'react';
import { Task, Resource } from '@/types/scheduling';
import { rescheduleAll } from '@/utils/scheduling';
import { createProductTasks } from '@/utils/taskFactory';
import TaskList from '@/components/TaskList';
import ResourceTimeline from '@/components/ResourceTimeline';
import GanttChart from '@/components/GanttChart';
import SimpleGanttChart from '@/components/gantt-simple/SimpleGanttChart';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Settings, LayoutGrid, GanttChart as GanttIcon } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'resource' | 'gantt' | 'simple-gantt'>('list');
  const baseDate = new Date('2024-12-20T10:00:00');
  const deadline = new Date(baseDate);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('schedulingTasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      return parsedTasks.map((task: any) => ({
        ...task,
        startTime: task.startTime ? new Date(task.startTime) : undefined,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
        endTime: task.endTime ? new Date(task.endTime) : undefined,
        status: task.status || 'unscheduled',
        isFixed: task.isFixed || false
      }));
    }
    return [...createProductTasks('MWB1', deadline), ...createProductTasks('MWB2', deadline)];
  });

  const resources: Resource[] = [
    { id: 'bench', name: 'Bench Work', capacity: 1 },
    { id: 'konica', name: 'Konica Printer', capacity: 1 },
    { id: 'dk_europa', name: 'D&K Europa', capacity: 1 },
    { id: 'zund_m800', name: 'Zund M800', capacity: 1 },
    { id: 'gluing_machine', name: 'Gluing Machine', capacity: 1 },
    { id: 'magnet_drill', name: 'Magnet Drill', capacity: 1 },
    { id: 'corner_taper', name: 'Corner Taper', capacity: 1 }
  ];

  const handleReschedule = () => {
    try {
      const scheduledTasks = rescheduleAll(tasks);
      setTasks(scheduledTasks);
      localStorage.setItem('schedulingTasks', JSON.stringify(scheduledTasks));
      toast({
        title: "Schedule updated",
        description: "All tasks have been rescheduled successfully.",
      });
    } catch (error) {
      console.error('Scheduling error:', error);
      toast({
        title: "Scheduling error",
        description: "Failed to update schedule. Please check task dependencies.",
        variant: "destructive",
      });
    }
  };

  const toggleFixTask = (taskId: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => 
        task.id === taskId
          ? { ...task, isFixed: !task.isFixed }
          : task
      );
      localStorage.setItem('schedulingTasks', JSON.stringify(updatedTasks));
      return updatedTasks;
    });
  };

  return (
    <div className="container mx-auto py-8 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Magnetic Wrap Box Production Schedule</h1>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              onClick={() => setView('list')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={view === 'resource' ? 'default' : 'outline'}
              onClick={() => setView('resource')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Resources
            </Button>
            <Button
              variant={view === 'gantt' ? 'default' : 'outline'}
              onClick={() => setView('gantt')}
            >
              <GanttIcon className="w-4 h-4 mr-2" />
              Gantt
            </Button>
            <Button
              variant={view === 'simple-gantt' ? 'default' : 'outline'}
              onClick={() => setView('simple-gantt')}
            >
              <GanttIcon className="w-4 h-4 mr-2" />
              Simple Gantt
            </Button>
          </div>
          <Button onClick={() => navigate('/settings')} variant="outline">
            <Settings className="mr-2" />
            Line Item Settings
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <Button onClick={handleReschedule} className="mr-4">
          Reschedule Tasks
        </Button>
      </div>

      <div className="flex-1">
        {view === 'list' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tasks</h2>
            <TaskList tasks={tasks} onToggleFixed={toggleFixTask} />
          </div>
        )}

        {view === 'resource' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Resource Timeline</h2>
            <ResourceTimeline tasks={tasks} resources={resources} />
          </div>
        )}

        {view === 'gantt' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
            <GanttChart tasks={tasks} resources={resources} />
          </div>
        )}

        {view === 'simple-gantt' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Simple Gantt Chart</h2>
            <SimpleGanttChart />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;