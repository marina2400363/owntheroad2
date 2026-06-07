import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    // Clear localStorage credentials
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          🚗 OWN THE <span className="brand-accent">ROAD</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
          </li>
          
          {token && (
            <li>
              <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings')}`}>
                My Bookings
              </Link>
            </li>
          )}

          {token && user && user.isAdmin && (
            <li>
              <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
                Admin Dashboard
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-user">
          {token && user ? (
            <>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Hello, <strong style={{ color: '#ffffff' }}>{user.name}</strong>
                {user.isAdmin && <span style={{ marginLeft: '5px', fontSize: '0.75rem', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>Admin</span>}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// Note: MVC Flow: Navbar acts as a view element triggering the Logout event handler.
