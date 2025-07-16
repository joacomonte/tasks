'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import mockApiService from '@/lib/mockApi';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskList = () => {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load tasks handler
  const loadTasks = useCallback(async (direction: 'newer' | 'older') => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    const page = direction === 'older' ? currentPage + 1 : currentPage - 1;

    try {
      const result = await mockApiService.fetchTasks({ page, limit: 10 });
      
      setTasks(result.tasks as Task[]);
      setCurrentPage(page);
      setHasMore(result.hasNextPage);

      // Scroll to top when loading newer tasks
      if (direction === 'newer' && containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentPage]);

  // Initial load
  useEffect(() => {
    const loadInitialTasks = async () => {
      setIsLoading(true);
      try {
        const result = await mockApiService.fetchTasks({ page: 1, limit: 10 });
        setTasks(result.tasks as Task[]);
        setHasMore(result.hasNextPage);
      } catch (err) {
        setError('Failed to load initial tasks');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialTasks();
  }, []);

  return (
    <div className="task-list-container max-h-[300px] overflow-y-auto" ref={containerRef}>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Top load button */}
      <div className="load-button-container">
        <button
          onClick={() => loadTasks('newer')}
          disabled={currentPage === 1 || isLoading}
          className="load-button"
        >
          {isLoading ? 'Loading...' : 'Load Newer Tasks'}
        </button>
      </div>

      {/* Task items */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''}`}
          >
            <div className="task-id">ID: {task.id}</div>
            <div className="task-text">{task.text}</div>
            <div className="task-status">
              {task.completed ? '✅ Completed' : '🟡 Pending'}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="loading-indicator">Loading tasks...</div>
        )}
      </div>

      {/* Bottom load button */}
      <div className="load-button-container">
        <button
          onClick={() => loadTasks('older')}
          disabled={!hasMore || isLoading}
          className="load-button"
        >
          {isLoading ? 'Loading...' : 'Load Older Tasks'}
        </button>
      </div>
    </div>
  );
};

export default TaskList;