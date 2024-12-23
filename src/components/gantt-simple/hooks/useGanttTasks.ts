import { useState, useEffect } from 'react';
import { SimpleTask } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sampleTasks } from '../sampleData';

export const useGanttTasks = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildTaskHierarchy = (tasksData: any[]) => {
    console.log('Building task hierarchy from:', tasksData);
    
    // Create a map for quick task lookup
    const taskMap = new Map();
    
    // First pass: Create all task objects
    tasksData.forEach(task => {
      const startTime = task.start_time ? new Date(task.start_time) : new Date();
      const dependencies = task.task_dependencies?.map((dep: any) => dep.depends_on_id) || [];
      
      console.log(`Creating task object for ${task.id}:`, {
        name: task.name,
        type: task.type,
        startTime: startTime.toISOString(),
        dependencies
      });

      taskMap.set(task.id, {
        id: task.id,
        name: task.name,
        type: task.type,
        startTime,
        duration: Number(task.duration),
        dependencies,
        isExpanded: task.type === 'lineitem', // Line items start expanded
        children: [],
        resource: task.resource_id,
        isFixed: task.is_fixed
      });
    });
    
    // Second pass: Build parent-child relationships
    taskMap.forEach((task, taskId) => {
      task.dependencies.forEach(depId => {
        const parentTask = taskMap.get(depId);
        if (parentTask) {
          if (!parentTask.children.includes(taskId)) {
            parentTask.children.push(taskId);
            console.log(`Added ${taskId} as child of ${depId}`);
          }
        }
      });
    });

    const finalTasks = Array.from(taskMap.values());
    console.log('Final task hierarchy:', finalTasks.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      children: t.children,
      dependencies: t.dependencies
    })));
    
    return finalTasks;
  };

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

    loadTasks();
  }, []);

  return { tasks, setTasks, isLoading };
};