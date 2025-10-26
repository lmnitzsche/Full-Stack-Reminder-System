import { useState } from 'react';
import { supabase } from '../lib/supabase';
import TaskItem from './TaskItem';

function TaskList({ tasks, onRefresh, onEdit }) {
  const [filter, setFilter] = useState('all'); // all, active, completed

  const handleToggleComplete = async (task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task and all its reminders?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const activeTasks = tasks.filter(t => !t.completed).length;
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className="task-list-container">
      <div className="task-stats">
        <div className="stat">
          <span className="stat-number">{activeTasks}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat">
          <span className="stat-number">{completedTasks}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat">
          <span className="stat-number">{tasks.length}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>

      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found</p>
            <p className="empty-state-hint">
              {filter !== 'all' 
                ? `No ${filter} tasks. Try changing the filter.`
                : 'Create your first task to get started!'}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;
