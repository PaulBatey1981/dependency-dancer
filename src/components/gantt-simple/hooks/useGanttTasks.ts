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
        .select('*')
        .order('created_at');

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

      // Create a Map to store unique tasks by ID
      const taskMap = new Map<string, SimpleTask>();

      // First pass: Create all tasks
      tasksData.forEach(task => {
        if (!taskMap.has(task.id)) {
          const formattedTask: SimpleTask = {
            id: task.id,
            name: task.name,
            type: task.type,
            startTime: task.start_time ? new Date(task.start_time) : new Date(),
            duration: Number(task.duration),
            dependencies: [],
            isExpanded: false,
            parentId: task.line_item_id || undefined,
            resource: task.resource_id,
            isFixed: task.is_fixed,
            children: []
          };
          
          taskMap.set(task.id, formattedTask);
          console.log(`Created task: ${formattedTask.name} (${formattedTask.id}), type: ${formattedTask.type}, parent: ${formattedTask.parentId}`);
        }
      });

      // Second pass: Set up parent-child relationships
      taskMap.forEach(task => {
        if (task.parentId) {
          const parent = taskMap.get(task.parentId);
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            if (!parent.children.includes(task.id)) {
              parent.children.push(task.id);
              console.log(`Added task ${task.id} (${task.name}) as child of ${task.parentId} (${parent.name})`);
            }
          } else {
            console.warn(`Parent ${task.parentId} not found for task ${task.id}`);
          }
        }
      });

      // Get line items (root tasks)
      const lineItems = Array.from(taskMap.values()).filter(t => t.type === 'lineitem');
      console.log('Line items:', lineItems.map(item => ({
        id: item.id,
        name: item.name,
        childCount: item.children?.length || 0
      })));

      // Convert Map to array and set tasks
      const uniqueTasks = Array.from(taskMap.values());
      console.log('Final task count:', uniqueTasks.length);
      
      // Log the hierarchy for debugging
      const logTaskHierarchy = (task: SimpleTask, level = 0) => {
        const indent = '  '.repeat(level);
        console.log(`${indent}${task.name} (${task.id}) - Type: ${task.type}`);
        task.children?.forEach(childId => {
          const child = taskMap.get(childId);
          if (child) {
            logTaskHierarchy(child, level + 1);
          }
        });
      };

      lineItems.forEach(item => logTaskHierarchy(item));
      
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