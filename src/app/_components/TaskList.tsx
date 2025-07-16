"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import mockApiService from "@/lib/mockApi";
import TaskItem from "./TaskItem";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskResponse {
  tasks: Task[];
  hasNextPage: boolean;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingTop, setIsLoadingTop] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);


  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
  
    if (node && hasNextPage && !isLoadingMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsLoadingMore(true);
            setTimeout(() => {
              const nextPage = page + 1;
              setPage(nextPage);
              handleLoadMoreBottom();
            }, 600); 
          }
        },
        { threshold: 1.0 }
      );
      observerRef.current.observe(node);
    }
  }, [hasNextPage, isLoadingMore]);

  const fetchTasks = async (pageNum: number, loadDirection: 'top' | 'bottom' = 'bottom') => {
    try {
      const result = await mockApiService.fetchTasks({ page: pageNum, limit: 20 });
      
      setTasks(result.tasks as Task[]);
      setHasNextPage(result.hasNextPage);
  
      if (loadDirection === 'bottom') {
        setIsLoadingMore(false);
      } else {
        setIsLoadingTop(false);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      if (loadDirection === 'bottom') {
        setIsLoadingMore(false);
      } else {
        setIsLoadingTop(false);
      }
    }
  };
  
  const handleLoadMoreBottom = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTasks(nextPage, 'bottom');
  };
  
  const handleLoadMoreTop = () => {
    const prevPage = page - 1;
    setPage(prevPage);
    fetchTasks(prevPage, 'top');
  };

  useEffect(() => {
    fetchTasks(1);
  }, []);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl max-h-[600px] overflow-y-auto border border-gray-300 rounded-lg mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Task List</h1>
      <button 
        onClick={() => handleLoadMoreTop()} 
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Load Older Tasks
      </button>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            ref={index === tasks.length - 1 ? lastItemRef : null}
          />
        ))}
      </div>

      {isLoadingMore && (
        <div className="mt-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <span className="text-gray-500">Loading...</span>
        </div>
      )}

      {tasks.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          No tasks found. Add your first task above!
        </div>
      )}
    </div>
  );
}
