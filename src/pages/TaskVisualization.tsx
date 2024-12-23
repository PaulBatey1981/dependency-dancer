import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Task {
  id: string;
  name: string;
  type: string;
  dependencies: string[];
  children?: Task[];
}

const TaskVisualization = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      console.log('Loading tasks and dependencies...');
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          name,
          type,
          task_dependencies!task_dependencies_task_id_fkey(depends_on_id)
        `);

      if (tasksError) throw tasksError;

      // Transform the data to include dependencies array
      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        name: task.name,
        type: task.type,
        dependencies: task.task_dependencies?.map((dep: any) => dep.depends_on_id) || []
      }));

      console.log('Transformed tasks:', transformedTasks);

      // Build task hierarchy
      const taskMap = new Map<string, Task>();
      transformedTasks.forEach(task => taskMap.set(task.id, { ...task, children: [] }));

      // Populate children arrays
      transformedTasks.forEach(task => {
        task.dependencies.forEach(depId => {
          const parentTask = taskMap.get(depId);
          const childTask = taskMap.get(task.id);
          if (parentTask && childTask) {
            if (!parentTask.children) {
              parentTask.children = [];
            }
            parentTask.children.push(childTask);
          }
        });
      });

      // Get root level tasks (those that are not children of any other task)
      const rootTasks = Array.from(taskMap.values()).filter(task => {
        return !Array.from(taskMap.values()).some(t => 
          t.children?.some(child => child.id === task.id)
        );
      });

      console.log('Root tasks:', rootTasks);
      setTasks(rootTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "There was a problem loading the task data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'lineitem':
        return 'bg-purple-50 border-purple-200';
      case 'component':
        return 'bg-blue-50 border-blue-200';
      case 'element':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const renderTask = (task: Task, level: number = 0) => {
    return (
      <div key={task.id} className="mb-4" style={{ marginLeft: `${level * 24}px` }}>
        <Card className={`${getTypeStyle(task.type)} border`}>
          <CardHeader className="py-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base">{task.name}</CardTitle>
                <CardDescription className="text-sm">
                  Type: {task.type}
                </CardDescription>
              </div>
              {task.dependencies.length > 0 && (
                <span className="text-sm text-gray-500">
                  Dependencies: {task.dependencies.length}
                </span>
              )}
            </div>
          </CardHeader>
          {task.dependencies.length > 0 && (
            <CardContent className="py-2">
              <div className="text-sm text-gray-600">
                Depends on:{' '}
                {task.dependencies.map(depId => {
                  const depTask = tasks.find(t => t.id === depId);
                  return depTask ? depTask.name : depId;
                }).join(', ')}
              </div>
            </CardContent>
          )}
        </Card>
        {task.children && task.children.length > 0 && (
          <div className="ml-4 mt-2 pl-4 border-l border-gray-300">
            {task.children.map(childTask => renderTask(childTask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading tasks...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Hierarchy Visualization</h1>
        <Button onClick={loadTasks} className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          Refresh
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <ScrollArea className="h-[calc(100vh-12rem)] p-6">
          {tasks.map(task => renderTask(task))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default TaskVisualization;