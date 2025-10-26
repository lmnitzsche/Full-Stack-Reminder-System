import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Settings({ user }) {
  const [telegramChatId, setTelegramChatId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setTelegramChatId(data?.telegram_chat_id || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          telegram_chat_id: telegramChatId,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setMessage('✓ SETTINGS SAVED');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('✗ SAVE FAILED');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">[LOADING SETTINGS...]</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="terminal-label">[USER SETTINGS]</div>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <div className="form-group">
          <label htmlFor="telegramChatId">
            TELEGRAM CHAT ID
            <span className="helper-text">
              Message @userinfobot on Telegram to get your Chat ID
            </span>
          </label>
          <input
            type="text"
            id="telegramChatId"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder="123456789"
            className="terminal-input"
          />
        </div>

        <div className="button-group">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? '[SAVING...]' : '[SAVE SETTINGS]'}
          </button>
        </div>

        {message && <div className="message">{message}</div>}
      </form>
    </div>
  );
}
