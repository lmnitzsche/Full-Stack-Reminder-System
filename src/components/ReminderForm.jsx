import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { format, addDays, setHours, setMinutes } from 'date-fns';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'MON' },
  { value: 'tuesday', label: 'TUE' },
  { value: 'wednesday', label: 'WED' },
  { value: 'thursday', label: 'THU' },
  { value: 'friday', label: 'FRI' },
  { value: 'saturday', label: 'SAT' },
  { value: 'sunday', label: 'SUN' },
];

function ReminderForm({ taskId, userId, onReminderCreated }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reminderType, setReminderType] = useState('exact'); // exact, recurring
  const [isRecurring, setIsRecurring] = useState(false);
  
  // Exact date/time
  const [exactDate, setExactDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [exactTime, setExactTime] = useState('09:00');
  
  // Recurring settings
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState(['monday', 'wednesday', 'friday']);
  
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const calculateNextSendAt = () => {
    if (reminderType === 'exact') {
      const [year, month, day] = exactDate.split('-').map(Number);
      const [hours, minutes] = exactTime.split(':').map(Number);
      const date = new Date(year, month - 1, day, hours, minutes);
      return date.toISOString();
    } else {
      // For recurring, set to next occurrence
      const now = new Date();
      const [hours, minutes] = timeOfDay.split(':').map(Number);
      let nextDate = setMinutes(setHours(now, hours), minutes);
      
      // If time has passed today, move to tomorrow
      if (nextDate <= now) {
        nextDate = addDays(nextDate, 1);
      }
      
      return nextDate.toISOString();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    if (reminderType === 'recurring' && recurrenceType === 'weekly' && selectedDays.length === 0) {
      alert('Please select at least one day of the week');
      return;
    }

    setLoading(true);
    try {
      const reminderData = {
        task_id: taskId,
        user_id: userId,
        phone_number: phoneNumber,
        is_recurring: reminderType === 'recurring',
        is_active: true,
        next_send_at: calculateNextSendAt(),
      };

      if (reminderType === 'exact') {
        const [year, month, day] = exactDate.split('-').map(Number);
        const [hours, minutes] = exactTime.split(':').map(Number);
        reminderData.exact_datetime = new Date(year, month - 1, day, hours, minutes).toISOString();
      } else {
        reminderData.recurrence_type = recurrenceType;
        reminderData.time_of_day = timeOfDay;
        
        if (recurrenceType === 'weekly') {
          reminderData.days_of_week = JSON.stringify(selectedDays);
        }
      }

      const { error } = await supabase
        .from('reminders')
        .insert([reminderData]);

      if (error) throw error;
      
      onReminderCreated();
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Error creating reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reminder-form">
      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number *</label>
        <input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1234567890"
          required
        />
        <small>Include country code (e.g., +1 for US)</small>
      </div>

      <div className="form-group">
        <label>Reminder Type</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              value="exact"
              checked={reminderType === 'exact'}
              onChange={(e) => setReminderType(e.target.value)}
            />
            <span>One-time (exact date & time)</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="recurring"
              checked={reminderType === 'recurring'}
              onChange={(e) => setReminderType(e.target.value)}
            />
            <span>Recurring</span>
          </label>
        </div>
      </div>

      {reminderType === 'exact' ? (
        <>
          <div className="form-group">
            <label htmlFor="exactDate">Date</label>
            <input
              id="exactDate"
              type="date"
              value={exactDate}
              onChange={(e) => setExactDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="exactTime">Time</label>
            <input
              id="exactTime"
              type="time"
              value={exactTime}
              onChange={(e) => setExactTime(e.target.value)}
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="recurrenceType">Frequency</label>
            <select
              id="recurrenceType"
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="timeOfDay">Time of Day</label>
            <input
              id="timeOfDay"
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              required
            />
          </div>

          {recurrenceType === 'weekly' && (
            <div className="form-group">
              <label>Days of Week</label>
              <div className="days-selector">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    className={`day-button ${selectedDays.includes(day.value) ? 'selected' : ''}`}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Creating...' : 'Add Reminder'}
      </button>
    </form>
  );
}

export default ReminderForm;
