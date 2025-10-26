import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, reminders(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setError(error.message);
        setTasks([]);
      } else {
        setTasks(data || []);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <h1>📋 Task Tracker</h1>
          <p>Manage your tasks with smart reminders</p>
        </header>

        {error && (
          <div className="error-banner">
            <strong>⚠️ Database Connection Issue:</strong> {error}
            <br />
            <small>Make sure you've created the database tables in Supabase (see SUPABASE_SCHEMA.md)</small>
          </div>
        )}

        <TaskForm 
          onTaskCreated={handleTaskCreated}
          editingTask={editingTask}
          onCancelEdit={handleCancelEdit}
        />

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <TaskList 
            tasks={tasks} 
            onRefresh={fetchTasks}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
}

export default App;
