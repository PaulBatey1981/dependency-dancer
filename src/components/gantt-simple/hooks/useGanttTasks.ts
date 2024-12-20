import { useState } from 'react';
import { SimpleTask } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sampleTasks } from '../sampleData';

export const useGanttTasks = () => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      // First, create a map of all tasks
      const taskMap = new Map<string, SimpleTask>();
      
      // First pass: Create all tasks without relationships
      tasksData.forEach(task => {
        const formattedTask: SimpleTask = {
          id: task.id,
          name: task.name,
          type: task.type,
          startTime: task.start_time ? new Date(task.start_time) : new Date(),
          duration: Number(task.duration),
          dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || [],
          isExpanded: false,
          children: [],
          resource: task.resource_id,
          isFixed: task.is_fixed,
        };
        
        taskMap.set(task.id, formattedTask);
        console.log(`Created task ${task.id} (${task.name}), type: ${task.type}`);
      });

      // Second pass: Set up parent-child relationships based on dependencies
      taskMap.forEach(task => {
        task.dependencies.forEach(depId => {
          const dependentTask = taskMap.get(depId);
          if (dependentTask) {
            if (!dependentTask.children) {
              dependentTask.children = [];
            }
            if (!dependentTask.children.includes(task.id)) {
              dependentTask.children.push(task.id);
              console.log(`Added task ${task.id} (${task.name}) as child of ${depId} (${dependentTask.name})`);
            }
          }
        });
      });

      // Get line items (root tasks)
      const lineItems = Array.from(taskMap.values()).filter(t => t.type === 'lineitem');
      console.log('Line items:', lineItems.map(item => ({
        id: item.id,
        name: item.name,
        childCount: item.children?.length || 0
      })));

      // Log the hierarchy for debugging
      const logTaskHierarchy = (task: SimpleTask, level = 0) => {
        const indent = '  '.repeat(level);
        console.log(`${indent}${task.name} (${task.id}) - Type: ${task.type}`);
        if (task.children) {
          task.children.forEach(childId => {
            const child = taskMap.get(childId);
            if (child) {
              logTaskHierarchy(child, level + 1);
            }
          });
        }
      };

      lineItems.forEach(item => {
        console.log('\nTask Hierarchy:');
        logTaskHierarchy(item);
      });

      const uniqueTasks = Array.from(taskMap.values());
      console.log('Final task count:', uniqueTasks.length);
      setTasks(uniqueTasks);

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