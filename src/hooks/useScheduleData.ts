import { useState } from 'react';
import { Task, Resource } from '@/types/scheduling';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { createProductTasks } from '@/utils/taskFactory';
import { saveTasks } from '@/services/taskService';

export const useScheduleData = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      if (!tasksData?.length) {
        console.log('No tasks found, creating initial tasks...');
        const deadline = new Date('2024-12-20T10:00:00');
        const initialTasks = [...createProductTasks('MWB1', deadline), ...createProductTasks('MWB2', deadline)];
        await saveTasks(initialTasks);
        console.log('Initial tasks created:', initialTasks);
        setTasks(initialTasks);
      } else {
        console.log('Raw tasks data from Supabase:', tasksData);
        
        const formattedTasks: Task[] = tasksData.map(task => {
          const formattedTask = {
            ...task,
            startTime: task.start_time ? new Date(task.start_time) : undefined,
            endTime: task.end_time ? new Date(task.end_time) : undefined,
            dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || []
          };
          console.log('Formatted task:', formattedTask);
          return formattedTask;
        });
        
        console.log('All formatted tasks:', formattedTasks);
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }
  };

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

  return {
    tasks,
    resources,
    isLoading,
    loadInitialData,
    setTasks
  };
};