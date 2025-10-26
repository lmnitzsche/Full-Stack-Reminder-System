import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ReminderForm from './ReminderForm';

function TaskForm({ onTaskCreated, editingTask, onCancelEdit, userId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCurrentTaskId(editingTask.id);
      setShowReminderForm(false);
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({ title, description })
          .eq('id', editingTask.id);

        if (error) throw error;
        resetForm();
        onTaskCreated();
      } else {
        // Create new task with user_id
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ title, description, user_id: userId }])
          .select()
          .single();

        if (error) throw error;
        
        setCurrentTaskId(data.id);
        setShowReminderForm(true);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setShowReminderForm(false);
    setCurrentTaskId(null);
    if (onCancelEdit) onCancelEdit();
  };

  const handleSkipReminder = () => {
    resetForm();
    onTaskCreated();
  };

  const handleReminderCreated = () => {
    resetForm();
    onTaskCreated();
  };

  return (
    <div className="task-form-container">
      {!showReminderForm ? (
        <form onSubmit={handleSubmit} className="task-form">
          <h2>{editingTask ? '[EDIT TASK]' : '[NEW TASK]'}</h2>
          
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details (optional)"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
            {editingTask && (
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="reminder-step">
          <h2>[REMINDER CONFIGURATION]</h2>
          <p>Configure automated reminder protocol for this task</p>
          
          <ReminderForm 
            taskId={currentTaskId}
            userId={userId}
            onReminderCreated={handleReminderCreated}
          />
          
          <button onClick={handleSkipReminder} className="btn-text">
            Skip and finish
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskForm;
