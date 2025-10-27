import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('instant');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Instant Telegram state
  const [instantMessage, setInstantMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userTelegramId, setUserTelegramId] = useState('');

  // Wheel state
  const [wheelPrompts, setWheelPrompts] = useState([
    { text: 'Hello!', color: '#ff6b6b' },
    { text: 'How are you?', color: '#4ecdc4' },
    { text: 'Have a great day!', color: '#45b7d1' }
  ]);
  const [newPrompt, setNewPrompt] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState('');
  const [wheelRotation, setWheelRotation] = useState(0);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, telegram_chat_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data?.is_admin) {
        setIsAdmin(true);
        setUserTelegramId(data.telegram_chat_id || '');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };  const sendInstantMessage = async () => {
    if (!instantMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!userTelegramId) {
      alert('You need to set your Telegram Chat ID in Settings first');
      return;
    }

    setSending(true);
    try {
      console.log('Sending instant message:', { userId: user.id, message: instantMessage });
      
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

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (response.ok) {
        alert('Message sent successfully!');
        setInstantMessage('');
      } else {
        throw new Error(responseData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const spinWheel = async () => {
    try {
      if (wheelPrompts.length === 0) {
        alert('Add some prompts first!');
        return;
      }

      setSpinning(true);
      
      // Calculate random rotation (multiple full spins + random position)
      const randomIndex = Math.floor(Math.random() * wheelPrompts.length);
      const segmentAngle = 360 / wheelPrompts.length;
      const targetAngle = randomIndex * segmentAngle;
      const spins = 5; // Number of full rotations
      const finalRotation = spins * 360 + targetAngle;
      
      setWheelRotation(finalRotation);
      
      // Wait for animation to finish
      setTimeout(async () => {
        try {
          const winner = wheelPrompts[randomIndex];
          if (!winner || !winner.text) {
            throw new Error('Invalid wheel prompt selected');
          }
          
          setWheelResult(winner.text);
          
          // Send the winning message to admin's own Telegram
          if (userTelegramId) {
            console.log('Sending winner to admin:', winner.text);
            
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-instant-telegram`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                message: `🎲 Wheel Result: ${winner.text}`,
                chat_id: userTelegramId,
              }),
            });

            const result = await response.json();
            console.log('Telegram result:', result);

            if (response.ok) {
              alert(`🎉 Wheel landed on: "${winner.text}"\n\nSent to your Telegram!`);
            } else {
              console.error('Telegram error:', result);
              alert(`🎉 Wheel landed on: "${winner.text}"\n\nBut failed to send to Telegram: ${result.error || 'Unknown error'}`);
            }
          } else {
            alert(`🎉 Wheel landed on: "${winner.text}"\n\n(No Telegram ID configured)`);
          }
        } catch (error) {
          console.error('Error in wheel result handling:', error);
          alert(`Wheel spinning failed: ${error.message}`);
        } finally {
          setSpinning(false);
        }
      }, 3000); // Match the CSS animation duration
    } catch (error) {
      console.error('Error starting wheel spin:', error);
      alert(`Failed to spin wheel: ${error.message}`);
      setSpinning(false);
    }
  };

  const addPrompt = () => {
    if (newPrompt.trim()) {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      setWheelPrompts([...wheelPrompts, { 
        text: newPrompt.trim(), 
        color: randomColor 
      }]);
      setNewPrompt('');
    }
  };

  const removePrompt = (index) => {
    setWheelPrompts(wheelPrompts.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="loading">[LOADING ADMIN PANEL...]</div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="terminal-label">[ACCESS DENIED]</div>
        <p>You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="terminal-label">[ADMIN CONTROL PANEL]</div>
                <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'instant' ? 'active' : ''}`}
            onClick={() => setActiveTab('instant')}
          >
            [INSTANT MSG]
          </button>
          <button 
            className={`tab ${activeTab === 'wheel' ? 'active' : ''}`}
            onClick={() => setActiveTab('wheel')}
          >
            [SPIN WHEEL]
          </button>
        </div>
      </div>

            {activeTab === 'instant' && (
        <div className="admin-section">
          <h3>[INSTANT TELEGRAM MESSENGER]</h3>
          <div className="instant-messenger">
            {userTelegramId ? (
              <div className="admin-info">
                <strong>✓ Your Telegram ID:</strong> {userTelegramId}
                <br /><small>Messages will be sent to yourself</small>
              </div>
            ) : (
              <div className="admin-info error">
                <strong>⚠ No Telegram ID found</strong>
                <br /><small>Go to Settings and add your Telegram Chat ID first</small>
              </div>
            )}
            
            <div className="form-group">
              <label>Message to yourself:</label>
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
              disabled={sending || !userTelegramId}
            >
              {sending ? '[SENDING...]' : '[SEND TO MY TELEGRAM]'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'wheel' && (
        <div className="admin-section">
          <h3>[SPIN THE WHEEL]</h3>
          <div className="wheel-section">
            <div className="wheel-container">
              {/* Pointer/Indicator */}
              <div className="wheel-pointer">▼</div>
              
              <div 
                className={`wheel ${spinning ? 'spinning' : ''}`}
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                <svg width="388" height="388" style={{ position: 'absolute', top: '6px', left: '6px' }}>
                  {wheelPrompts.map((prompt, index) => {
                    const segmentAngle = 360 / wheelPrompts.length;
                    const startAngle = (segmentAngle * index - 90) * (Math.PI / 180); // -90 to start at top
                    const endAngle = (segmentAngle * (index + 1) - 90) * (Math.PI / 180);
                    
                    const centerX = 194;
                    const centerY = 194;
                    const radius = 184;
                    
                    const x1 = centerX + radius * Math.cos(startAngle);
                    const y1 = centerY + radius * Math.sin(startAngle);
                    const x2 = centerX + radius * Math.cos(endAngle);
                    const y2 = centerY + radius * Math.sin(endAngle);
                    
                    const largeArc = segmentAngle > 180 ? 1 : 0;
                    
                    const pathData = [
                      `M ${centerX} ${centerY}`,
                      `L ${x1} ${y1}`,
                      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                      'Z'
                    ].join(' ');
                    
                    // Text position
                    const textAngle = (segmentAngle * index + segmentAngle / 2 - 90) * (Math.PI / 180);
                    const textRadius = radius * 0.65;
                    const textX = centerX + textRadius * Math.cos(textAngle);
                    const textY = centerY + textRadius * Math.sin(textAngle) + 5;
                    
                    return (
                      <g key={index}>
                        <path
                          d={pathData}
                          fill={prompt.color}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#000"
                          fontSize="11"
                          fontWeight="bold"
                          style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.8)' }}
                        >
                          {prompt.text.length > 12 ? prompt.text.substring(0, 12) + '...' : prompt.text}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Center circle */}
                <div className="wheel-center">
                  <span>SPIN</span>
                </div>
              </div>
              
              <button 
                className="spin-button"
                onClick={spinWheel}
                disabled={spinning}
              >
                {spinning ? 'SPINNING...' : 'SPIN THE WHEEL!'}
              </button>
            </div>
            
            {wheelResult && (
              <div className="wheel-result">
                <strong>🎉 Winner: "{wheelResult}"</strong>
              </div>
            )}
            
            <div className="wheel-controls">
              <h4>Manage Prompts:</h4>
              <div className="add-prompt">
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Add new prompt..."
                  className="terminal-input"
                  onKeyPress={(e) => e.key === 'Enter' && addPrompt()}
                />
                <button onClick={addPrompt} className="btn-primary">
                  [ADD]
                </button>
              </div>
              
              <div className="prompts-list">
                {wheelPrompts.map((prompt, index) => (
                  <div key={index} className="prompt-item">
                    <div 
                      className="prompt-color" 
                      style={{ backgroundColor: prompt.color }}
                    ></div>
                    <span>{prompt.text}</span>
                    <button 
                      onClick={() => removePrompt(index)}
                      className="btn-danger"
                    >
                      [X]
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;