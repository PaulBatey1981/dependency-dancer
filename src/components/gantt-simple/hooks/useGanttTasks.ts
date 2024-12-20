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

        console.log('Raw tasks data from Supabase:', tasksData);

        if (!tasksData?.length) {
          console.log('No tasks found in Supabase, using sample data');
          setTasks(sampleTasks);
          return;
        }

        // Simplified task formatting - accept any type
        const formattedTasks: SimpleTask[] = tasksData.map(task => {
          console.log(`Formatting task:`, task);
          return {
            id: task.id,
            name: task.name,
            // Cast any type to SimpleTask type, defaulting to 'task' if invalid
            type: (task.type?.toLowerCase() || 'task') as SimpleTask['type'],
            startTime: task.start_time ? new Date(task.start_time) : new Date(),
            duration: Number(task.duration),
            dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || [],
            isExpanded: false,
            parentId: task.line_item_id || undefined,
            resource: task.resource_id,
            isFixed: task.is_fixed,
            children: []
          };
        });

        // Process tasks to set up parent-child relationships
        const taskMap = new Map(formattedTasks.map(task => [task.id, task]));
        formattedTasks.forEach(task => {
          if (task.parentId) {
            const parent = taskMap.get(task.parentId);
            if (parent) {
              if (!parent.children) parent.children = [];
              parent.children.push(task.id);
              console.log(`Added task ${task.id} as child of ${task.parentId}`);
            } else {
              console.warn(`Parent task ${task.parentId} not found for task ${task.id}`);
            }
          }
        });

        console.log('Final formatted tasks:', formattedTasks);
        setTasks(formattedTasks);
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