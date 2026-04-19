import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('flexitUser') || 'null');
  } catch {
    user = null;
  }

  const isLoggedIn = Boolean(user?.userId);
  const displayName = user?.fullName || 'User';

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('flexitUser');
    navigate('/login');
  };

  const handleTicketsNavigation = (event) => {
    event.preventDefault();

    const userId = (user?.userId || 'USER001').trim();
    const userName = (user?.userName || user?.fullName || 'User').trim();
    const params = new URLSearchParams({
      role: 'USER',
      userId,
      userName,
    });

    navigate(`/user/dashboard?${params.toString()}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">⚙️</span>
          <span className="logo-text">Flexit</span>
        </div>

        <ul className="nav-menu">
          <li className="nav-item">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#resources"
              onClick={(e) => {
                e.preventDefault();
                navigate('/resources');
              }}
              className={`nav-link ${isActive('/resources') ? 'active' : ''}`}
            >
              Resources
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#booking"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
            >
              Booking
            </a>
          </li>
          <li className="nav-item">
            <a
              href="#tickets"
              className="nav-link"
              onClick={handleTicketsNavigation}
            >
              Tickets
            </a>
          </li>
        </ul>

        <div className="nav-auth">
          {isLoggedIn ? (
            <>
              <span className="user-name">Hi, {displayName}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-login"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="btn-signup"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
