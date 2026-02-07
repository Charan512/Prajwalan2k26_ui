import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GridScan } from '../components/GridScan';
import PixelCard from '../components/PixelCard';
import ShinyText from '../components/ShinyText';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'evaluator':
          navigate('/evaluator', { replace: true });
          break;
        case 'team_lead':
          navigate('/team', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    setLoading(true);

    const loadingToast = toast.loading('Signing in...');

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`, {
          id: loadingToast,
        });

        // Clear credentials only on successful login
        setEmail('');
        setPassword('');

        switch (result.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'evaluator':
            navigate('/evaluator');
            break;
          case 'team_lead':
            navigate('/team');
            break;
          default:
            navigate('/');
        }
      } else {
        // Keep credentials on failed login
        toast.error(result.message || 'Login failed', {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.', {
        id: loadingToast,
      });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor={isDark ? "#392e4e" : "#e0e7ff"}
          gridScale={0.1}
          scanColor={isDark ? "#FF9FFC" : "#0ea5e9"}
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          disableMouseInteraction
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="theme-toggle fade-in"
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
      {/* Text Banner */}
      <div className="banner-wrapper fade-in">
        <div className="text-banner-container">
          <h2 className="hackathon-subtitle">A NATIONAL LEVEL HACKATHON</h2>
          <h1 className="prajwalan-text">Prajwalan <span className="year-text">2k26</span></h1>
          <p className="hackathon-tagline">INNOVATE | OPTIMIZE | IMPLEMENT | SUCCEED</p>
        </div>
      </div>

      {/* Login Box */}
      <div className="login-container fade-in">
        <PixelCard
          variant={isDark ? "pink" : "blue"}
          colors={isDark ? "#fecdd3,#fda4af,#e11d48" : "#e0f2fe,#7dd3fc,#0ea5e9"}
          className="login-pixel-card"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
              return false;
            }}
            className="login-form"
            noValidate
            action="javascript:void(0);"
          >
            <div className="login-header">
              <h3 className="login-title">
                <span className="title-main">Welcome</span>
                <span className="title-accent">Back</span>
              </h3>
              <p className="login-subtitle">Sign in to your Reality</p>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </PixelCard>

        <div className="login-footer">
          <ShinyText
            text="Sagi Rama Krishnam Raju Engineering College"
            disabled={false}
            speed={3}
            className="shiny-footer-text"
          />
          <ShinyText
            text="Department of Computer Science & Engineering"
            disabled={false}
            speed={3}
            className="shiny-footer-subtext"
          />
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0;
          background: #000;
          position: relative;
          overflow: hidden;
        }

        .banner-wrapper {
          width: 100%;
          padding: 40px 20px 10px 20px;
          z-index: 10;
          position: relative;
          display: flex;
          justify-content: center;
        }

        .text-banner-container {
          text-align: center;
        }

        .hackathon-subtitle {
          color: #fff;
          font-family: 'Orbitron', sans-serif;
          font-size: 20px;
          letter-spacing: 2px;
          margin-bottom: 0px;
          text-transform: uppercase;
          text-shadow: 0 0 5px rgba(255,255,255,0.5);
        }

        .hackathon-tagline {
          color: rgba(255, 255, 255, 0.8);
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          letter-spacing: 4px;
          margin-top: -10px;
          font-weight: 600;
        }

        .prajwalan-text {
          font-family: 'Samarkan', sans-serif;
          font-size: 110px;
          line-height: 1.2;
          padding-bottom: 5px;
          margin: 0;
          background: linear-gradient(135deg, #ae00ff 20%, #4f46e5 50%, #0ea5e9 80%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 15px rgba(124, 58, 237, 0.5));
          animation: text-pulse 4s ease-in-out infinite;
        }

        .year-text {
          font-family: 'Samarkan', sans-serif;
          color: #fff;
          -webkit-text-fill-color: #fff;
          text-shadow: 0 0 10px #4f46e5;
        }

        @keyframes text-pulse {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(124, 58, 237, 0.5)); }
          50% { filter: drop-shadow(0 0 25px rgba(124, 58, 237, 0.8)); }
        }

        .login-container {
          width: 100%;
          max-width: 480px;
          text-align: center;
          padding: 20px 24px 40px 24px;
          z-index: 10;
          position: relative;
        }

        .login-pixel-card {
          width: 100% !important;
          height: 550px !important;
          max-height: 550px !important;
          aspect-ratio: auto !important;
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'};
          background: ${isDark ? 'rgba(15, 17, 21, 0.6)' : 'rgba(255, 255, 255, 0.7)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 
            0 20px 60px ${isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)'},
            0 0 0 1px ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'} inset;
        }

        .login-form {
          position: absolute;
          inset: 0;
          padding: 40px;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 1;
          pointer-events: none;
          background: transparent;
          border-radius: 25px;
        }

        .login-form > * {
          pointer-events: auto;
        }

        /* Subtle gradient border effect */
        .login-form::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${isDark ? 'rgba(236, 72, 153, 0.6)' : 'rgba(14, 165, 233, 0.6)'}, transparent);
        }

        .login-header {
          margin-bottom: 32px;
          text-align: center;
        }


        .login-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          margin-bottom: 8px;
          letter-spacing: 2px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .title-main {
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-pulse 3s ease-in-out infinite;
        }

        .title-accent {
          background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-pulse-reverse 3s ease-in-out infinite;
        }

        @keyframes gradient-pulse {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 10px rgba(139, 92, 246, 0.3));
          }
          50% {
            filter: brightness(1.2) drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
          }
        }

        @keyframes gradient-pulse-reverse {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 10px rgba(124, 58, 237, 0.3));
          }
          50% {
            filter: brightness(1.2) drop-shadow(0 0 20px rgba(124, 58, 237, 0.5));
          }
        }

        .login-subtitle {
          color: var(--text-secondary);
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-family: 'Orbitron', sans-serif;
        }

        .input-field {
          width: 100%;
          background: rgba(139, 92, 246, 0.08) !important;
          border: 1.5px solid rgba(139, 92, 246, 0.3) !important;
          color: #ffffff !important;
          padding: 14px 16px !important;
          border-radius: 10px !important;
          font-size: 15px !important;
          font-weight: 500 !important;
          font-family: 'Inter', sans-serif !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) inset !important;
        }

        .input-field:hover {
          background: rgba(139, 92, 246, 0.12) !important;
          border-color: rgba(139, 92, 246, 0.5) !important;
        }

        .input-field:focus {
          background: rgba(139, 92, 246, 0.15) !important;
          border-color: #8b5cf6 !important;
          box-shadow: 
            0 0 0 3px rgba(139, 92, 246, 0.2),
            0 0 20px rgba(139, 92, 246, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.2) inset !important;
          transform: translateY(-1px);
        }
        
        .input-field::placeholder {
          color: rgba(167, 139, 250, 0.4) !important;
          font-weight: 400 !important;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper .input-field {
          padding-right: 45px;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 18px;
          padding: 6px 10px;
          color: rgba(167, 139, 250, 0.8);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle-btn:hover {
          background: rgba(139, 92, 246, 0.25);
          border-color: rgba(139, 92, 246, 0.5);
          color: #a78bfa;
          transform: translateY(-50%) scale(1.05);
        }

        .password-toggle-btn:active {
          transform: translateY(-50%) scale(0.95);
          background: rgba(139, 92, 246, 0.3);
        }

        .login-btn {
          width: 100%;
          padding: 16px;
          font-size: 15px;
          font-weight: 700;
          margin-top: 24px;
          border-radius: 10px;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border: 1px solid rgba(139, 92, 246, 0.5);
          box-shadow: 
            0 4px 16px rgba(139, 92, 246, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(167, 139, 250, 0.2) inset;
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }

        .login-btn:hover::before {
          left: 100%;
        }
        
        .login-btn:hover {
          background: linear-gradient(135deg, #9d6fff 0%, #8b5cf6 100%);
          box-shadow: 
            0 6px 24px rgba(139, 92, 246, 0.6),
            0 4px 12px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(167, 139, 250, 0.4) inset;
          transform: translateY(-2px);
          border-color: rgba(167, 139, 250, 0.7);
        }

        .login-btn:active {
          transform: translateY(0);
          box-shadow: 
            0 2px 8px rgba(139, 92, 246, 0.4),
            0 0 0 1px rgba(167, 139, 250, 0.3) inset;
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-footer {
          margin-top: 32px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .login-footer p {
          margin: 6px 0;
        }

        .theme-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          z-index: 100;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(255,255,255,0.3);
        }

        /* ============================================
           LIGHT MODE STYLES
           ============================================ */

        ${!isDark ? `
        /* Light Mode: Page Background */
        .login-page {
          background: linear-gradient(135deg, #f8f9ff 0%, #e8eaff 100%);
        }

        /* Light Mode: Banner Text */
        .hackathon-subtitle {
          color: #1f2937;
          text-shadow: 0 0 5px rgba(139, 92, 246, 0.2);
        }

        .prajwalan-text {
          background: linear-gradient(135deg, #7c3aed 20%, #6366f1 50%, #8b5cf6 80%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 15px rgba(124, 58, 237, 0.3));
        }

        .year-text {
          color: #1f2937;
          -webkit-text-fill-color: #1f2937;
          text-shadow: 0 0 10px rgba(124, 58, 237, 0.2);
        }

        .hackathon-tagline {
          color: rgba(31, 41, 55, 0.8);
        }

        /* Light Mode: Login Card */
        .login-pixel-card {
          background: rgba(255, 255, 255, 0.85) !important;
          border: 1px solid rgba(139, 92, 246, 0.2) !important;
          box-shadow: 
            0 20px 60px rgba(124, 58, 237, 0.15),
            0 0 0 1px rgba(139, 92, 246, 0.1) inset !important;
        }

        /* Light Mode: Login Header */
        .title-main {
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-accent {
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #7c3aed 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes gradient-pulse {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 10px rgba(124, 58, 237, 0.2));
          }
          50% {
            filter: brightness(1.1) drop-shadow(0 0 20px rgba(124, 58, 237, 0.3));
          }
        }

        @keyframes gradient-pulse-reverse {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 10px rgba(139, 92, 246, 0.2));
          }
          50% {
            filter: brightness(1.1) drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
          }
        }

        .login-subtitle {
          color: rgba(31, 41, 55, 0.7);
        }

        /* Light Mode: Form Labels */
        .form-label {
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Light Mode: Input Fields */
        .input-field {
          background: rgba(139, 92, 246, 0.05) !important;
          border: 1.5px solid rgba(139, 92, 246, 0.25) !important;
          color: #1f2937 !important;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08) inset !important;
        }

        .input-field:hover {
          background: rgba(139, 92, 246, 0.08) !important;
          border-color: rgba(139, 92, 246, 0.4) !important;
        }

        .input-field:focus {
          background: rgba(139, 92, 246, 0.1) !important;
          border-color: #8b5cf6 !important;
          box-shadow: 
            0 0 0 3px rgba(139, 92, 246, 0.15),
            0 0 20px rgba(139, 92, 246, 0.2),
            0 2px 8px rgba(139, 92, 246, 0.1) inset !important;
        }

        .input-field::placeholder {
          color: rgba(124, 58, 237, 0.35) !important;
        }

        /* Light Mode: Password Toggle */
        .password-toggle-btn {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.25);
          color: rgba(124, 58, 237, 0.8);
        }

        .password-toggle-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.4);
          color: #7c3aed;
        }

        .password-toggle-btn:active {
          background: rgba(139, 92, 246, 0.25);
        }

        /* Light Mode: Sign In Button */
        .login-btn {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border: 1px solid rgba(139, 92, 246, 0.4);
          box-shadow: 
            0 4px 16px rgba(139, 92, 246, 0.3),
            0 2px 8px rgba(124, 58, 237, 0.15),
            0 0 0 1px rgba(167, 139, 250, 0.15) inset;
          color: #ffffff;
        }

        .login-btn:hover {
          background: linear-gradient(135deg, #9d6fff 0%, #8b5cf6 100%);
          box-shadow: 
            0 6px 24px rgba(139, 92, 246, 0.5),
            0 4px 12px rgba(124, 58, 237, 0.25),
            0 0 0 1px rgba(167, 139, 250, 0.3) inset;
          border-color: rgba(139, 92, 246, 0.6);
        }

        .login-btn:active {
          box-shadow: 
            0 2px 8px rgba(139, 92, 246, 0.3),
            0 0 0 1px rgba(167, 139, 250, 0.2) inset;
        }

        /* Light Mode: Footer */
        .login-footer {
          color: rgba(31, 41, 55, 0.6);
        }

        /* Light Mode: Theme Toggle */
        .theme-toggle {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.25);
          color: #7c3aed;
        }

        .theme-toggle:hover {
          background: rgba(139, 92, 246, 0.2);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
        }

        /* Light Mode: Border Gradient */
        .login-form::before {
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent);
        }
        ` : ''}
      `}</style>
    </div>
  );
};

export default Login;
