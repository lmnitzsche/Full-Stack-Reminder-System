import { format } from 'date-fns';

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const hasReminders = task.reminders && task.reminders.length > 0;

  const formatReminder = (reminder) => {
    if (reminder.exact_datetime) {
      return `${format(new Date(reminder.exact_datetime), 'MMM d, yyyy')} at ${format(new Date(reminder.exact_datetime), 'h:mm a')}`;
    }
    
    if (reminder.is_recurring) {
      const days = reminder.days_of_week ? JSON.parse(reminder.days_of_week).join(', ') : '';
      return `${reminder.recurrence_type} at ${reminder.time_of_day}${days ? ` on ${days}` : ''}`;
    }
    
    return 'Custom reminder';
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-main">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          className="task-checkbox"
        />
        
        <div className="task-content">
          <h3 className="task-title">{task.title}</h3>
          {task.description && (
            <p className="task-description">{task.description}</p>
          )}
          
          {hasReminders && (
            <div className="task-reminders">
              {task.reminders.map((reminder) => (
                <div key={reminder.id} className="reminder-tag">
                  {formatReminder(reminder)}
                  <span className="reminder-phone"> → {reminder.phone_number}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="task-meta">
            <span className="task-date">
              {format(new Date(task.created_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="task-actions">
        <button 
          onClick={() => onEdit(task)}
          className="btn-icon"
          title="Edit task"
        >
          [EDIT]
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="btn-icon"
          title="Delete task"
        >
          [DELETE]
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
