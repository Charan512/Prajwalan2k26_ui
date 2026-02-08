import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('top');

  // Track scroll position to determine active section
  useEffect(() => {
    if (location.pathname !== '/team') {
      setActiveSection(null);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      // Check if at top
      if (scrollPosition < 200) {
        setActiveSection('top');
        return;
      }

      // Check each section
      const timerElement = document.getElementById('timer');
      const tasksElement = document.getElementById('tasks');

      if (tasksElement && scrollPosition >= tasksElement.offsetTop) {
        setActiveSection('tasks');
      } else if (timerElement && scrollPosition >= timerElement.offsetTop) {
        setActiveSection('timer');
      } else {
        setActiveSection('top');
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin', label: 'Teams' },
          { path: '/admin/leaderboard', label: 'Leaderboard' }
        ];
      case 'evaluator':
        return [
          { path: '/evaluator', label: 'Teams' },
          { path: '/evaluator/flash-round', label: 'Flash Round' }
        ];
      case 'team_lead':
        return [
          { path: '/team', label: 'Dashboard', scrollTo: 'top' },
          { path: '/team', label: 'Timer', scrollTo: 'timer' },
          { path: '/team', label: 'Tasks', scrollTo: 'tasks' },
          { path: '/team/game-leaderboard', label: 'Leaderboard', isRoute: true }
        ];
      default:
        return [];
    }
  };

  const getRoleBadge = () => {
    const badges = {
      admin: { label: 'ADMIN', color: '#ef4444' },
      evaluator: { label: 'EVALUATOR', color: '#f59e0b' },
      team_lead: { label: 'TEAM LEAD', color: '#10b981' }
    };
    return badges[user?.role] || { label: 'USER', color: '#6b7280' };
  };

  const roleBadge = getRoleBadge();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">P</span>
          <span className="brand-text">PRAJWALAN</span>
          <span className="brand-year">2K26</span>
        </Link>
      </div>

      <div className="navbar-center">
        <div className="navbar-nav">
          {getNavLinks().map((link, index) => {
            const handleClick = (e) => {
              if (link.scrollTo) {
                e.preventDefault();
                // Only scroll if we're on the /team page
                if (location.pathname === '/team') {
                  if (link.scrollTo === 'top') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    const element = document.getElementById(link.scrollTo);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                } else {
                  // Navigate to /team first, then scroll will happen on page load
                  navigate('/team');
                }
              }
            };

            // Determine if this link should be active
            const isActive = () => {
              if (link.scrollTo) {
                // For scroll-based links, check if this specific section is active
                return location.pathname === '/team' && activeSection === link.scrollTo;
              } else {
                // For route-based links, check if path matches
                return location.pathname === link.path;
              }
            };

            return (
              <Link
                key={`${link.path}-${index}`}
                to={link.path}
                onClick={handleClick}
                className={`nav-link ${isActive() ? 'active' : ''} ${link.isRoute ? 'nav-link-route' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span
              className="role-badge"
              style={{
                background: `${roleBadge.color}15`,
                border: `1px solid ${roleBadge.color}40`,
                color: roleBadge.color
              }}
            >
              {roleBadge.label}
            </span>
          </div>
          <div className="navbar-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              <span className="theme-icon">{isDark ? 'Light' : 'Dark'}</span>
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* Navbar Layout */
        .navbar-left, .navbar-center, .navbar-right {
          display: flex;
          align-items: center;
        }

        .navbar-left {
          flex: 0 0 auto;
        }

        .navbar-center {
          flex: 1;
          justify-content: center;
        }

        .navbar-right {
          flex: 0 0 auto;
        }

        /* Brand Styling */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.15);
        }

        .navbar-brand:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }

        .brand-icon {
          font-size: 24px;
          font-weight: 900;
          font-family: 'Orbitron', sans-serif;
          color: #8b5cf6;
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        .brand-text {
          font-family: 'Samarkan', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 1.5px;
        }

        .brand-year {
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.15);
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        /* User Section */
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .user-name {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .role-badge {
          padding: 3px 10px;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Theme Toggle Button */
        .theme-toggle-btn {
          background: rgba(139, 92, 246, 0.1);
          border: 1.5px solid rgba(139, 92, 246, 0.25);
          color: var(--text-primary);
          padding: 8px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .theme-icon {
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.5px;
          color: rgba(167, 139, 250, 0.9);
        }

        .theme-toggle-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .theme-toggle-btn:hover .theme-icon {
          color: #a78bfa;
        }

        .theme-toggle-btn:active {
          transform: translateY(0);
        }

        /* Logout Button */
        .logout-btn {
          padding: 10px 20px;
          background: rgba(139, 92, 246, 0.08);
          border: 1.5px solid rgba(139, 92, 246, 0.25);
          border-radius: 8px;
          color: rgba(167, 139, 250, 0.9);
          font-size: 13px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.3px;
        }

        .logout-btn:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
          color: #a78bfa;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        .logout-btn:active {
          transform: translateY(0);
          background: rgba(139, 92, 246, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .navbar-center {
            display: none;
          }

          .user-info {
            display: none;
          }

          .navbar-user {
            gap: 8px;
          }

          .brand-text {
            font-size: 16px;
          }

          .brand-year {
            font-size: 10px;
            padding: 2px 6px;
          }

          .logout-btn {
            padding: 8px 14px;
            font-size: 12px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
