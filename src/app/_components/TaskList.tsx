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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const lastItemRef = useRef<HTMLDivElement>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);


useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          console.log("Element is now in view!");
          setIsLoadingMore(true);
          const nextPage = page + 1;
          setPage(nextPage);
          fetchTasks(nextPage);
        }
      },
      { threshold: 1.0 }
    );

    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isLoadingMore, page]);

  const fetchTasks = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockApiService.fetchTasks({
        page: pageNum,
        limit: 20,
      });

      console.log("response", response);

      const typedTasks = response.tasks as Task[];

      if (pageNum === 1) {
        setTasks(typedTasks);
      } else {
        setTasks((prev) => {
          const combined = [...prev, ...typedTasks];
          return combined.slice(-80); // Keep only the most recent 40 tasks (20 from previous + 20 new)
        });
      }

      setHasNextPage(response.hasNextPage);
    } catch (err) {
      setError("Error loading tasks");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
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
