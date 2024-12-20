import { useState } from 'react';
import { SimpleTask } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sampleTasks } from '../sampleData';

export const useGanttTasks = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildTaskHierarchy = (tasksData: any[]) => {
    console.log('Building task hierarchy from:', tasksData);
    
    // Create a map of tasks for easy lookup
    const taskMap = new Map();
    tasksData.forEach(task => {
      const dependencies = task.task_dependencies?.map((dep: any) => dep.depends_on_id) || [];
      taskMap.set(task.id, {
        id: task.id,
        name: task.name,
        type: task.type,
        startTime: task.start_time ? new Date(task.start_time) : new Date(),
        duration: Number(task.duration),
        dependencies: dependencies,
        isExpanded: false,
        children: [],
        resource: task.resource_id,
        isFixed: task.is_fixed,
      });
    });

    // Build parent-child relationships based on dependencies
    taskMap.forEach((task) => {
      task.dependencies.forEach(depId => {
        const dependentTask = taskMap.get(depId);
        if (dependentTask) {
          dependentTask.children.push(task.id);
        }
      });
    });

    console.log('Task hierarchy built:', Array.from(taskMap.values()));
    return Array.from(taskMap.values());
  };

  const loadTasks = async () => {
    try {
      console.log('Loading tasks from Supabase...');
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_dependencies!task_dependencies_task_id_fkey(depends_on_id)
        `)
        .order('type', { ascending: true });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      if (!tasksData?.length) {
        console.log('No tasks found in Supabase, using sample data');
        setTasks(sampleTasks);
        return;
      }

      console.log('Raw tasks data from Supabase:', tasksData);
      const hierarchicalTasks = buildTaskHierarchy(tasksData);
      setTasks(hierarchicalTasks);

    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Using sample data as fallback.",
        variant: "destructive",
      });
      setTasks(sampleTasks);
    } finally {
      setIsLoading(false);
    }
  };

  return { tasks, setTasks, isLoading, loadTasks };
};