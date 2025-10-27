import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Settings({ user }) {
  const [telegramChatId, setTelegramChatId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [instantMessage, setInstantMessage] = useState('');
  const [sending, setSending] = useState(false);

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('✗ PASSWORD MUST BE AT LEAST 6 CHARACTERS');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('✗ PASSWORDS DO NOT MATCH');
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      setPasswordMessage('✓ PASSWORD CHANGED SUCCESSFULLY');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage('✗ PASSWORD CHANGE FAILED: ' + error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const sendInstantMessage = async () => {
    if (!instantMessage.trim()) {
      alert('Please enter a message!');
      return;
    }

    if (!telegramChatId) {
      alert('Please save your Telegram Chat ID first!');
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-instant-telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId: user.id,
          message: instantMessage,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('✓ Message sent to your Telegram!');
        setInstantMessage('');
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('✗ Failed to send message: ' + error.message);
    } finally {
      setSending(false);
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

      {/* Profile Settings */}
      <form onSubmit={handleSave} className="settings-form">
        <h3 className="section-title">PROFILE CONFIGURATION</h3>
        
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

      {/* Password Change */}
      <form onSubmit={handlePasswordChange} className="settings-form password-section">
        <h3 className="section-title">SECURITY SETTINGS</h3>
        
        <div className="form-group">
          <label htmlFor="newPassword">
            NEW PASSWORD
            <span className="helper-text">
              Minimum 6 characters required
            </span>
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="terminal-input"
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            CONFIRM NEW PASSWORD
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="terminal-input"
            autoComplete="new-password"
          />
        </div>

        <div className="button-group">
          <button type="submit" disabled={changingPassword} className="btn-primary">
            {changingPassword ? '[CHANGING PASSWORD...]' : '[CHANGE PASSWORD]'}
          </button>
        </div>

        {passwordMessage && <div className="message">{passwordMessage}</div>}
      </form>

      {/* Instant Telegram Messenger */}
      <div className="settings-form telegram-section">
        <h3 className="section-title">INSTANT TELEGRAM MESSENGER</h3>
        
        {telegramChatId ? (
          <div className="telegram-info">
            <strong>✓ Your Telegram ID:</strong> {telegramChatId}
            <br /><small>Messages will be sent to your Telegram</small>
          </div>
        ) : (
          <div className="telegram-info error">
            <strong>⚠ No Telegram ID found</strong>
            <br /><small>Add your Telegram Chat ID above first</small>
          </div>
        )}
        
        <div className="form-group">
          <label>Message to your Telegram:</label>
          <textarea
            value={instantMessage}
            onChange={(e) => setInstantMessage(e.target.value)}
            placeholder="Type your message..."
            className="terminal-input"
            rows="4"
          />
        </div>
        
        <button 
          className="btn-primary"
          onClick={sendInstantMessage}
          disabled={sending || !telegramChatId}
        >
          {sending ? '[SENDING...]' : '[SEND TO MY TELEGRAM]'}
        </button>
      </div>
    </div>
  );
}
