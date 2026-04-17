import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Resource Management Made Simple</h1>
          <p>Manage, track, and allocate your resources efficiently</p>
          <button className="cta-btn" onClick={() => navigate('/resources')}>
            Start Managing Resources
          </button>
        </div>
        <div className="hero-image">
          <div className="illustration">📊</div>
        </div>
      </section>

      <section id="features" className="features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏛️</div>
            <h3>Multiple Resource Types</h3>
            <p>Manage lecture halls, labs, meeting rooms, projectors, cameras and more</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Availability Tracking</h3>
            <p>Set availability windows and track resource usage over time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Location Management</h3>
            <p>Keep track of where each resource is located for easy access</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Status</h3>
            <p>See real-time status of each resource - active or out of service</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Capacity Planning</h3>
            <p>Track capacity of resources for better planning and allocation</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Reliable</h3>
            <p>Your data is secure and accessible whenever you need it</p>
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="about-content">
          <h2>About Flexit</h2>
          <p>
            Flexit is a modern resource management system designed for educational institutions 
            and organizations. Whether you're managing classroom facilities, laboratory equipment, 
            or meeting spaces, Flexit provides an intuitive platform to streamline your operations.
          </p>
          <div className="about-stats">
            <div className="stat">
              <h3>100%</h3>
              <p>Uptime</p>
            </div>
            <div className="stat">
              <h3>∞</h3>
              <p>Resources</p>
            </div>
            <div className="stat">
              <h3>24/7</h3>
              <p>Available</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2026 Flexit. All rights reserved.</p>
        <p>Efficient Resource Management</p>
      </footer>
    </div>
  );
}

export default Home;
