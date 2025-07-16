import React from 'react';

interface TaskCreatorProps {
  isEditing: boolean;
  taskValue: string;
  onStartEditing: () => void;
  onTaskValueChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TaskCreator: React.FC<TaskCreatorProps> = ({
  isEditing,
  taskValue,
  onStartEditing,
  onTaskValueChange,
  onSave,
  onCancel,
  onKeyDown
}) => {
  return (
    <div>
      {!isEditing ? (
        <button 
          onClick={onStartEditing} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          New task
        </button>
      ) : (
        <div className="flex gap-2">
          <input 
            type="text" 
            value={taskValue} 
            onChange={(e) => onTaskValueChange(e.target.value)} 
            onKeyDown={onKeyDown}
            placeholder="Enter task description" 
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
            autoFocus 
          />
          <button 
            onClick={onSave} 
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
          >
            Save
          </button>
          <button 
            onClick={onCancel} 
            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCreator; 