import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

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
                    { path: '/team', label: 'Dashboard' }
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
            <Link to="/" className="navbar-brand">PRAJWALAN</Link>

            <div className="navbar-nav">
                {getNavLinks().map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <div className="navbar-user">
                <span
                    className="role-badge"
                    style={{
                        background: `${roleBadge.color}22`,
                        border: `1px solid ${roleBadge.color}`,
                        color: roleBadge.color
                    }}
                >
                    {roleBadge.label}
                </span>
                <span className="user-name">{user?.name}</span>
                <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                    Logout
                </button>
            </div>

            <style>{`
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .role-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .user-name {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 12px;
        }

        .theme-toggle-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--text-primary);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .theme-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(255,255,255,0.3);
        }

        @media (max-width: 768px) {
          .navbar-user {
            width: 100%;
            justify-content: center;
          }
          .user-name {
            display: none;
          }
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
