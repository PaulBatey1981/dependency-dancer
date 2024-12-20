import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'resource' | 'gantt' | 'simple-gantt'>('list');
  const baseDate = new Date('2024-12-20T10:00:00');
  const deadline = new Date(baseDate);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('line_items')
        .select('*');

      if (lineItemsError) throw lineItemsError;

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_dependencies!task_dependencies_task_id_fkey(depends_on_id)
        `);

      if (tasksError) throw tasksError;

      if (!tasksData?.length) {
        console.log('No tasks found, creating initial tasks...');
        const initialTasks = [...createProductTasks('MWB1', deadline), ...createProductTasks('MWB2', deadline)];
        await saveTasks(initialTasks);
        setTasks(initialTasks);
      } else {
        console.log('Tasks loaded from Supabase:', tasksData);
        const formattedTasks = tasksData.map(task => ({
          ...task,
          startTime: task.start_time ? new Date(task.start_time) : undefined,
          endTime: task.end_time ? new Date(task.end_time) : undefined,
          dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || []
        }));
        setTasks(formattedTasks);
      }
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

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      // First, ensure all line items exist
      const lineItems = tasksToSave.filter(task => task.type === 'lineitem');
      for (const lineItem of lineItems) {
        const { error } = await supabase
          .from('line_items')
          .upsert({ 
            id: lineItem.id,
            name: lineItem.name
          });
        if (error) throw error;
      }

      // Then save all tasks
      for (const task of tasksToSave) {
        const { error: taskError } = await supabase
          .from('tasks')
          .upsert({
            id: task.id,
            name: task.name,
            type: task.type,
            status: task.status,
            duration: task.duration,
            resource_id: task.resource,
            start_time: task.startTime?.toISOString(),
            end_time: task.endTime?.toISOString(),
            is_fixed: task.isFixed,
            line_item_id: task.type === 'lineitem' ? task.id : undefined
          });
        if (taskError) throw taskError;

        // Update dependencies
        if (task.dependencies.length > 0) {
          // First delete existing dependencies
          const { error: deleteError } = await supabase
            .from('task_dependencies')
            .delete()
            .eq('task_id', task.id);
          if (deleteError) throw deleteError;

          // Then insert new ones
          const dependencyRecords = task.dependencies.map(depId => ({
            task_id: task.id,
            depends_on_id: depId
          }));

          const { error: depsError } = await supabase
            .from('task_dependencies')
            .insert(dependencyRecords);
          if (depsError) throw depsError;
        }
      }

      console.log('Tasks saved successfully');
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  };

  const resources: Resource[] = [
    { id: 'bench', name: 'Bench Work', capacity: 1 },
    { id: 'konica', name: 'Konica Printer', capacity: 1 },
    { id: 'dk_europa', name: 'D&K Europa', capacity: 1 },
    { id: 'zund_m800', name: 'Zund M800', capacity: 1 },
    { id: 'gluing_machine', name: 'Gluing Machine', capacity: 1 },
    { id: 'magnet_drill', name: 'Magnet Drill', capacity: 1 },
    { id: 'corner_taper', name: 'Corner Taper', capacity: 1 }
  ];

  const handleReschedule = async () => {
    try {
      const scheduledTasks = rescheduleAll(tasks);
      await saveTasks(scheduledTasks);
      setTasks(scheduledTasks);
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

  const toggleFixTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId
          ? { ...task, isFixed: !task.isFixed }
          : task
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task fix status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

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