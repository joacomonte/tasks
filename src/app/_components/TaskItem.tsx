import React, { useState } from 'react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(task.text);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (editedText.trim()) {
      onEdit(task.id, editedText);
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setEditedText(task.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    } else if (e.key === 'Escape') {
      handleCancelClick();
    }
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <div className="task-id">#{task.id}</div>
        {isEditing ? (
          <div className="edit-container">
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="task-edit-input"
            />
            <div className="inline-edit-buttons">
              <button className="save-button" onClick={handleSaveClick} title="Save">
                ✓
              </button>
              <button className="cancel-button" onClick={handleCancelClick} title="Cancel">
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="task-text">{task.text}</div>
        )}
        <div className={`task-status ${task.completed ? 'completed' : 'pending'}`}>
          {task.completed ? 'Completed' : 'Pending'}
        </div>
      </div>
      <div className="task-actions">
        {!isEditing && (
          <>
            <button
              className={`status-button ${task.completed ? 'pending' : 'complete'}`}
              onClick={() => onToggleComplete(task.id)}
            >
              {task.completed ? 'Mark Pending' : 'Mark Complete'}
            </button>
            <button className="edit-button" onClick={handleEditClick}>
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem;