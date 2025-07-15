import React from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
}

const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(
  ({ task }, ref) => {
    return (
      <div
        ref={ref}
        className={`task-container ${task.completed ? "task-completed" : ""}`}
      >
        <div className="task-content">
          <div
            className={`task-checkbox ${
              task.completed ? "checkbox-completed" : ""
            }`}
          >
            {task.completed && (
              <svg
                className="checkbox-icon"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <span
            className={`task-text ${task.completed ? "text-completed" : ""}`}
          >
            {task.text}
          </span>
        </div>
      </div>
    );
  }
);

export default TaskItem;
