import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Auth from './components/Auth';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'settings'

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchTasks();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchTasks();
      } else {
        setTasks([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Show auth screen if not logged in
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app">
      <div className="container">
        <header className="app-header">
          <div className="header-content">
            <div>
              <h1>Task Tracker v1.0</h1>
              <p>Task management system with automated reminder protocols</p>
            </div>
            <div className="header-user">
              <span className="user-email">{session.user.email}</span>
              <button onClick={handleSignOut} className="btn-secondary btn-logout">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            [TASKS]
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            [SETTINGS]
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <strong>Database Connection Issue:</strong> {error}
            <br />
            <small>Verify database tables exist in Supabase (see SUPABASE_SCHEMA.md)</small>
          </div>
        )}

        {activeTab === 'tasks' ? (
          <>
            <TaskForm 
              onTaskCreated={handleTaskCreated}
              editingTask={editingTask}
              onCancelEdit={handleCancelEdit}
              userId={session.user.id}
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
          </>
        ) : (
          <Settings user={session.user} />
        )}
      </div>
    </div>
  );
}

export default App;
