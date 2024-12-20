import { useState, useEffect } from 'react';
import { SimpleTask } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sampleTasks } from '../sampleData';

export const useGanttTasks = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          console.log('Sample tasks:', sampleTasks);
          
          // Verify task relationships before setting
          const taskMap = new Map(sampleTasks.map(task => [task.id, task]));
          sampleTasks.forEach(task => {
            if (task.parentId && !taskMap.has(task.parentId)) {
              console.warn(`Task ${task.id} references non-existent parent ${task.parentId}`);
            }
            task.dependencies.forEach(depId => {
              if (!taskMap.has(depId)) {
                console.warn(`Task ${task.id} references non-existent dependency ${depId}`);
              }
            });
          });
          
          setTasks(sampleTasks);
          return;
        }

        console.log('Tasks loaded from Supabase:', tasksData);
        const formattedTasks: SimpleTask[] = tasksData.map(task => ({
          id: task.id,
          name: task.name,
          type: task.type,
          startTime: task.start_time ? new Date(task.start_time) : new Date(),
          duration: Number(task.duration),
          dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || [],
          isExpanded: false,
          parentId: task.line_item_id || undefined,
          resource: task.resource_id,
          isFixed: task.is_fixed,
          children: []
        }));

        // Process tasks to set up parent-child relationships
        const taskMap = new Map(formattedTasks.map(task => [task.id, task]));
        formattedTasks.forEach(task => {
          if (task.parentId) {
            const parent = taskMap.get(task.parentId);
            if (parent) {
              if (!parent.children) parent.children = [];
              parent.children.push(task.id);
            }
          }
        });

        console.log('Formatted tasks:', formattedTasks);
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        console.log('Falling back to sample data');
        setTasks(sampleTasks);
        toast({
          title: "Error loading tasks",
          description: "Using sample data as fallback.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  return { tasks, setTasks, isLoading };
};