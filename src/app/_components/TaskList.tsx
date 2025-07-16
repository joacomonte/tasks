'use client';
import React, { useEffect, useState, useRef } from 'react';
import mockApiService from '@/lib/mockApi';
import TaskItem from './TaskItem';
import TaskCreator from './TaskCreator';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [taskValue, setTaskValue] = useState('');

  const loadTriggerRef = useRef<HTMLDivElement>(null);
  const newerTasksClickedRef = useRef<boolean>(false);

  const loadTasks = async (direction: 'newer' | 'older') => {
    if (isLoading) return;
    setIsLoading(true);
    let page;
    if (direction === 'older') {
      page = newerTasksClickedRef.current ? currentPage + 2 : currentPage + 1;
      newerTasksClickedRef.current = false;
    } else {
      page = currentPage === 2 ? 1 : currentPage - 2;
      newerTasksClickedRef.current = true;
    }

    if (page <= 0) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await mockApiService.fetchTasks({ page, limit: 10 });
      const newTasks = result.tasks as Task[];

      setTasks(prevTasks => {
        let updatedTasks;

        if (direction === 'older') {
          const filteredNewTasks = newTasks.filter(newTask => !prevTasks.some(existingTask => existingTask.id === newTask.id));
          updatedTasks = [...prevTasks, ...filteredNewTasks];
          if (updatedTasks.length > 20) {
            updatedTasks = updatedTasks.slice(-20);
          }
        } else {
          const filteredNewTasks = newTasks.filter(newTask => !prevTasks.some(existingTask => existingTask.id === newTask.id));
          updatedTasks = [...filteredNewTasks, ...prevTasks];
          if (updatedTasks.length > 20) {
            updatedTasks = updatedTasks.slice(0, 20);
          }
        }
        return updatedTasks;
      });

      setCurrentPage(page);
      setHasMore(result.hasNextPage);
    } catch (err) {
      toast.error('Failed to load tasks, try again');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadTasks('older');
        }
      },
      { threshold: 1 }
    );

    if (loadTriggerRef.current) {
      observer.observe(loadTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  useEffect(() => {
    const loadInitialTasks = async (retryCount = 0) => {
      setIsLoading(true);
      try {
        const result = await mockApiService.fetchTasks({ page: 1, limit: 10 });
        setTasks(result.tasks as Task[]);
        setHasMore(result.hasNextPage);
      } catch (err) {
        if (retryCount < 4) {
          toast.error(`Failed to load tasks, retrying... (${retryCount + 1}/4)`);
          // Wait for a short delay before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return loadInitialTasks(retryCount + 1);
        }
        toast.error('Failed to load tasks after multiple attempts');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialTasks();
  }, []);

  const handleToggleComplete = (id: string) => {
    setTasks(prevTasks => prevTasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const handleEdit = (id: string, newText: string) => {
    setTasks(prevTasks => prevTasks.map(task => (task.id === id ? { ...task, text: newText } : task)));
  };

  const newTask = (text: string) => {
    const newTask = {
      id: '1',
      text: text,
      completed: false,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    toast.success('Task created successfully');
  };

  const handleSave = () => {
    if (taskValue.trim()) {
      console.log('New task:', taskValue);
      setTaskValue('');
      setIsEditing(false);
      newTask(taskValue);
    }
  };

  const handleCancel = () => {
    setTaskValue('');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="task-list-container max-h-[300px] overflow-y-auto">
      <div className="flex w-full justify-between items-center">
        <h3 className="text-lg font-bold">Task Manager</h3>
        <TaskCreator isEditing={isEditing} taskValue={taskValue} onStartEditing={() => setIsEditing(true)} onTaskValueChange={setTaskValue} onSave={handleSave} onCancel={handleCancel} onKeyDown={handleKeyPress} />
      </div>

      {tasks.length > 0 ? (
        <>
          {currentPage > 1 && (
            <div className="load-button-container">
              <button onClick={() => loadTasks('newer')} disabled={currentPage <= 1 || isLoading} className="text-sm text-gray-500 cursor-pointer hover:font-medium">
                {isLoading ? 'Loading...' : 'Click to load newer tasks'}
              </button>
            </div>
          )}

          <div className="space-y-3">
            {tasks.map(task => (
              <TaskItem key={task.id} task={task} onToggleComplete={handleToggleComplete} onEdit={handleEdit} />
            ))}
          </div>
          <div className="text-center text-gray-400 py-8">{isLoading ? 'Loading tasks...' : 'Keep scrolling to load more tasks'}</div>
          <div className="text-center text-gray-400 mt-40" ref={loadTriggerRef} style={{ height: '1px' }} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium mb-2">No tasks yet</p>
          <p className="text-sm">Create your first task to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
