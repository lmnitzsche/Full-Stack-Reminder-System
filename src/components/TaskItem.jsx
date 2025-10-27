import { format } from 'date-fns';

function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const hasReminders = task.reminders && task.reminders.length > 0;

  const formatReminder = (reminder) => {
    if (reminder.exact_datetime) {
      return `${format(new Date(reminder.exact_datetime), 'MMM d, yyyy')} at ${format(new Date(reminder.exact_datetime), 'h:mm a')}`;
    }
    
    if (reminder.is_recurring) {
      let daysText = '';
      if (reminder.days_of_week) {
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const parsedDays = JSON.parse(reminder.days_of_week);
        const sortedDays = dayOrder.filter(day => parsedDays.includes(day));
        daysText = sortedDays.join(', ');
      }
      return `${reminder.recurrence_type} at ${reminder.time_of_day}${daysText ? ` on ${daysText}` : ''}`;
    }
    
    return 'Custom reminder';
  };

  const getNotificationMethodLabel = (method) => {
    switch (method) {
      case 'telegram':
        return 'Telegram';
      case 'email':
        return 'Email';
      case 'both':
        return 'Telegram & Email';
      default:
        return 'Telegram'; // fallback for old reminders
    }
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
                  <span className="reminder-phone"> → {getNotificationMethodLabel(reminder.notification_method)}</span>
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
