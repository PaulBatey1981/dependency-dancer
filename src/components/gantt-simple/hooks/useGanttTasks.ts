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

        // Log each task as it's being processed
        const formattedTasks: SimpleTask[] = tasksData.map(task => {
          console.log('Processing task:', task);
          console.log('Dependencies for task:', task.task_dependencies);
          
          const formattedTask: SimpleTask = {
            id: task.id,
            name: task.name,
            type: (task.type || 'task') as SimpleTask['type'],
            startTime: task.start_time ? new Date(task.start_time) : new Date(),
            duration: Number(task.duration),
            dependencies: task.task_dependencies?.map((dep: any) => {
              console.log(`Adding dependency ${dep.depends_on_id} to task ${task.id}`);
              return dep.depends_on_id;
            }) || [],
            isExpanded: false,
            parentId: task.line_item_id || undefined,
            resource: task.resource_id,
            isFixed: task.is_fixed,
            children: []
          };
          
          console.log('Formatted task:', formattedTask);
          return formattedTask;
        });

        console.log('All formatted tasks:', formattedTasks);

        // Process tasks to set up parent-child relationships
        const taskMap = new Map(formattedTasks.map(task => [task.id, task]));
        formattedTasks.forEach(task => {
          if (task.dependencies.length > 0) {
            console.log(`Processing dependencies for task ${task.id}:`, task.dependencies);
            task.dependencies.forEach(depId => {
              const parent = taskMap.get(depId);
              if (parent) {
                if (!parent.children) parent.children = [];
                parent.children.push(task.id);
                console.log(`Added task ${task.id} as child of ${depId}`);
              } else {
                console.warn(`Dependency ${depId} not found for task ${task.id}`);
              }
            });
          } else {
            console.log(`Task ${task.id} has no dependencies - it might be a root task`);
          }

          if (task.parentId) {
            console.log(`Task ${task.id} has line item parent: ${task.parentId}`);
          }
        });

        // Log all tasks that could be root tasks
        const rootTasks = formattedTasks.filter(task => !task.dependencies.length && !task.parentId);
        console.log('Potential root tasks:', rootTasks.map(t => ({ id: t.id, name: t.name })));

        console.log('Final formatted tasks with relationships:', formattedTasks);
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