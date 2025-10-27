import { useState } from 'react';

export default function LandingPage({ onLogin, onSignUp }) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "SMART REMINDERS & SCHEDULING",
      description: "Set up intelligent reminders with custom intervals, daily, weekly, or personalized scheduling options",
      icon: "⏰"
    },
    {
      title: "TELEGRAM INTEGRATION", 
      description: "Receive notifications directly in Telegram with instant messaging capabilities",
      icon: "📱"
    },
    {
      title: "EMAIL NOTIFICATIONS",
      description: "Get reminder emails sent automatically to keep you on track",
      icon: "📧"
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-buttons">
                <span className="terminal-button red"></span>
                <span className="terminal-button yellow"></span>
                <span className="terminal-button green"></span>
              </div>
              <div className="terminal-title">TASK-TRACKER v2.0</div>
            </div>
            <div className="terminal-body">
              <div className="typing-animation">
                <span className="prompt">$</span> <span className="command">init task-management-system</span>
                <div className="output">
                  <div>Initializing advanced reminder system...</div>
                  <div>Loading Telegram integration... ✓</div>
                  <div>Setting up email notifications... ✓</div>
                  <div>Configuring smart scheduling... ✓</div>
                  <div className="success">System ready. Welcome aboard.</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="primary-text">TERMINAL</span>
              <span className="secondary-text">TASK TRACKER</span>
            </h1>
            <p className="hero-subtitle">
              A developer-grade task management system with intelligent reminders, 
              Telegram integration, and email notifications built for productivity.
            </p>
            
            <div className="hero-buttons">
              <button className="cta-button primary" onClick={onSignUp}>
                [SIGN UP] →
              </button>
              <button className="cta-button secondary" onClick={onLogin}>
                [LOGIN]
              </button>
            </div>
            
            <div className="hero-note">
              Free to use • No credit card required • Open source
            </div>
          </div>
        </div>

          {/* Floating code snippets */}
        <div className="floating-elements">
          <div className="code-snippet snippet-1">
            <span className="code-comment">// Set reminder</span><br/>
            <span className="code-function">createTask</span>(<span className="code-string">"Deploy app"</span>);
          </div>
          <div className="code-snippet snippet-2">
            <span className="code-comment">// Telegram notify</span><br/>
            <span className="code-function">sendReminder</span>(<span className="code-string">"telegram"</span>);
          </div>
          <div className="code-snippet snippet-3">
            <span className="code-comment">// Schedule daily</span><br/>
            <span className="code-function">setInterval</span>(<span className="code-string">"1d"</span>);
          </div>
        </div>
        
        {/* Scroll indicator for mobile */}
        <div className="scroll-indicator">
          <div className="scroll-arrow">↓</div>
          <span>Scroll to explore features</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">[CORE FEATURES]</h2>
          <p className="section-subtitle">
            Built with modern technology stack for reliability and performance
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card ${currentFeature === index ? 'active' : ''}`}
              onMouseEnter={() => setCurrentFeature(index)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-status">
                <span className="status-indicator">●</span> OPERATIONAL
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">READY TO OPTIMIZE YOUR WORKFLOW?</h2>
          <p className="cta-subtitle">
            Join developers who trust Terminal Task Tracker for their productivity needs
          </p>
          <button className="cta-button large" onClick={onSignUp}>
            [GET STARTED NOW]
          </button>
          <div className="cta-note">
            Free to use • No credit card required • Open source
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">TERMINAL TASK TRACKER</div>
            <div className="footer-tagline">Built for developers, by developers</div>
          </div>
          <div className="footer-right">
            <div className="footer-links">
              <a href="#features" className="footer-link">[FEATURES]</a>
              <a href="https://github.com/lmnitzsche/Full-Stack-Reminder-System" className="footer-link">[GITHUB]</a>
              <a href="https://www.linkedin.com/in/logan-nitzsche/" className="footer-link">[LINKEDIN]</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="copyright">© 2025 Terminal Task Tracker. Built with ❤️ by <a href="https://logannitzsche.com" className="footer-link">Logan Nitzsche</a></div>
        </div>
      </footer>
    </div>
  );
}