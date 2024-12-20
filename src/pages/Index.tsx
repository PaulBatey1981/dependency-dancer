import { useState, useEffect } from 'react';
import { Task, Resource } from '@/types/scheduling';
import { rescheduleAll } from '@/utils/scheduling';
import { createProductTasks } from '@/utils/taskFactory';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ScheduleHeader from '@/components/schedule/ScheduleHeader';
import ScheduleContent from '@/components/schedule/ScheduleContent';

const Index = () => {
  const [view, setView] = useState<'list' | 'resource' | 'gantt' | 'simple-gantt'>('list');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseDate = new Date('2024-12-20T10:00:00');
  const deadline = new Date(baseDate);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([loadTasks(), loadResources()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: "Error loading data",
        description: "There was an error loading the schedule data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      console.log('Loading resources from Supabase...');
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .order('name');

      if (resourcesError) throw resourcesError;

      console.log('Resources loaded:', resourcesData);
      setResources(resourcesData);
    } catch (error) {
      console.error('Error loading resources:', error);
      throw error;
    }
  };

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
        console.log('No tasks found, creating initial tasks...');
        const initialTasks = [...createProductTasks('MWB1', deadline), ...createProductTasks('MWB2', deadline)];
        await saveTasks(initialTasks);
        setTasks(initialTasks);
      } else {
        console.log('Tasks loaded from Supabase:', tasksData);
        const formattedTasks: Task[] = tasksData.map(task => ({
          ...task,
          startTime: task.start_time ? new Date(task.start_time) : undefined,
          endTime: task.end_time ? new Date(task.end_time) : undefined,
          dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || []
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }
  };

  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      console.log('Saving tasks to Supabase:', tasksToSave);
      for (const task of tasksToSave) {
        const taskData = {
          id: task.id,
          name: task.name,
          type: task.type,
          status: task.status,
          duration: task.duration,
          resource_id: task.resource_id,
          start_time: task.startTime?.toISOString(),
          end_time: task.endTime?.toISOString(),
          is_fixed: task.is_fixed,
          line_item_id: task.line_item_id
        };

        const { error: taskError } = await supabase
          .from('tasks')
          .upsert(taskData);

        if (taskError) throw taskError;

        if (task.dependencies.length > 0) {
          const { error: deleteError } = await supabase
            .from('task_dependencies')
            .delete()
            .eq('task_id', task.id);

          if (deleteError) throw deleteError;

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
      toast({
        title: "Success",
        description: "Tasks saved successfully.",
      });
    } catch (error) {
      console.error('Error saving tasks:', error);
      toast({
        title: "Error saving tasks",
        description: "There was an error saving the tasks. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

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
          ? { ...task, is_fixed: !task.is_fixed }
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
      <ScheduleHeader 
        view={view}
        setView={setView}
        onReschedule={handleReschedule}
      />
      <ScheduleContent 
        view={view}
        tasks={tasks}
        resources={resources}
        onToggleFixed={toggleFixTask}
      />
    </div>
  );
};

export default Index;