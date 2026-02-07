import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import CountdownTimer from '../../components/CountdownTimer';
import RippleGrid from '../../components/RippleGrid';
import DoomGame from '../../components/DoomGameClassic';
import { teamLeadAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaUsers,
  FaGamepad,
  FaBullseye,
  FaBolt,
  FaInfoCircle,
  FaUser,
  FaStar,
  FaTrophy,
  FaHashtag,
  FaExpand,
  FaCompress
} from 'react-icons/fa';

const TeamLeadDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGameFullscreen, setIsGameFullscreen] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await teamLeadAPI.getDashboard();
      setDashboard(response.data.data);
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // UI State for Task Progress (Red/Yellow/Green)
  const [taskStatus, setTaskStatus] = useState(() => {
    const saved = localStorage.getItem('prajwalan_task_status');
    return saved ? JSON.parse(saved) : {};
  });

  const updateTaskStatus = (round, index, status) => {
    const newStatus = { ...taskStatus, [`${round}-${index}`]: status };
    setTaskStatus(newStatus);
    localStorage.setItem('prajwalan_task_status', JSON.stringify(newStatus));
  };

  // Initialize default 'pending' (Red) for all tasks if not set
  useEffect(() => {
    if (dashboard?.tasks) {
      const newStatus = { ...taskStatus };
      let hasChanges = false;

      Object.entries(dashboard.tasks).forEach(([round, tasks]) => {
        tasks.forEach((_, idx) => {
          const key = `${round}-${idx}`;
          if (!newStatus[key]) {
            newStatus[key] = 'pending';
            hasChanges = true;
          }
        });
      });

      if (hasChanges) {
        setTaskStatus(newStatus);
        localStorage.setItem('prajwalan_task_status', JSON.stringify(newStatus));
      }
    }
  }, [dashboard]);

  const roundInfo = {
    round1: { label: 'Round 1', subtitle: 'Project Explanation', color: '#a78bfa' },
    round2: { label: 'Round 2', subtitle: 'Progress Demo', color: '#06b6d4' },
    round3: { label: 'Round 3', subtitle: 'Final Presentation', color: '#ec4899' }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  const allTasks = [];
  Object.entries(dashboard?.tasks || {}).forEach(([round, tasks]) => {
    tasks.forEach((task, index) => {
      allTasks.push({ ...task, round, index, statusKey: `${round}-${index}` });
    });
  });

  // Calculate progress statistics
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => taskStatus[task.statusKey] === 'completed').length;
  const inProgressTasks = allTasks.filter(task => taskStatus[task.statusKey] === 'progress').length;
  const pendingTasks = allTasks.filter(task => !taskStatus[task.statusKey] || taskStatus[task.statusKey] === 'pending').length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="dashboard-wrapper">
      <div className="vr-background">
        {/* RippleGrid WebGL Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <RippleGrid
            enableRainbow={false}
            gridColor={isDark ? "#8b5cf6" : "#7c3aed"}
            rippleIntensity={0.05}
            gridSize={10}
            gridThickness={15}
            mouseInteraction={true}
            mouseInteractionRadius={1.2}
            opacity={isDark ? 0.6 : 0.4}
            fadeDistance={1.5}
            vignetteStrength={2.0}
            glowIntensity={0.15}
          />
        </div>
        {/* Soft overlay gradient for better text readability */}
        <div className="vr-overlay"></div>
      </div>

      <Navbar />
      <div className="page-wrapper dashboard-content-container">
        <div className="container">
          {/* Enhanced Team Header with Stats */}
          <div className="team-header-enhanced glass-card slide-up">
            {/* Team Title Row - Full Width */}
            <div className="team-title-row">
              <div className="title-row-glow"></div>

              <div className="team-number-badge-new">
                <div className="badge-glow"></div>
                <FaHashtag className="hash-icon" />
                <span className="team-number-new">{dashboard?.teamNumber}</span>
              </div>

              <div className="team-title-info">
                <div className="team-name-container">
                  <h1 className="team-name-enhanced">{dashboard?.teamName}</h1>
                </div>

                <div className="team-badges">
                  {dashboard?.domain && (
                    <span className="domain-badge-enhanced">
                      <FaBullseye className="badge-icon" />
                      <span>{dashboard.domain}</span>
                    </span>
                  )}
                  {dashboard?.isFlashRoundSelected && (
                    <span className="flash-badge-enhanced">
                      <FaBolt className="badge-icon" />
                      <span>Flash Round</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="team-stats-mini">
                <div className="mini-stat">
                  <FaUsers className="mini-icon" />
                  <span>{dashboard?.members?.length || 0} Members</span>
                </div>
                <div className="mini-stat">
                  <FaStar className="mini-icon" />
                  <span>{completionPercentage}% Complete</span>
                </div>
              </div>
            </div>

            {/* Content Row - Game + Members */}
            <div className="team-content-row">
              {/* Game Section - Clickable */}
              <div
                className="game-section-compact"
                onClick={() => setIsGameFullscreen(true)}
                title="Click to play fullscreen"
              >
                <div className="game-preview-overlay">
                  <FaGamepad className="game-preview-icon" />
                  <h3>Take a Break!</h3>
                  <p>Click to play DOOM-Style Shooter</p>
                  <div className="game-preview-hint">
                    <FaExpand /> FIGHT THE DEMONS!
                  </div>
                </div>
                <div className="game-preview-bg"></div>
              </div>

              {/* Team Members - Grid Layout */}
              <div className="team-members-grid">
                <div className="members-grid-header">
                  <h4>
                    <FaUsers className="header-icon" />
                    Team Members
                  </h4>
                </div>
                <div className="members-grid-container">
                  {dashboard?.members?.map((member, idx) => (
                    <div key={idx} className="member-card">
                      <div className="member-card-inner">
                        <div className="member-avatar-large">
                          <FaUser className="avatar-icon" />
                          <div className="avatar-ring"></div>
                        </div>
                        <div className="member-details">
                          <h5 className="member-name-new">{member.name}</h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card stat-total">
                <div className="stat-icon"><FaClipboardList /></div>
                <div className="stat-content">
                  <div className="stat-value">{totalTasks}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>
              </div>

              <div className="stat-card stat-completed">
                <div className="stat-icon"><FaCheckCircle /></div>
                <div className="stat-content">
                  <div className="stat-value">{completedTasks}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>

              <div className="stat-card stat-progress">
                <div className="stat-icon"><FaClock /></div>
                <div className="stat-content">
                  <div className="stat-value">{inProgressTasks}</div>
                  <div className="stat-label">In Progress</div>
                </div>
              </div>

              <div className="stat-card stat-pending">
                <div className="stat-icon"><FaExclamationCircle /></div>
                <div className="stat-content">
                  <div className="stat-value">{pendingTasks}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="dashboard-content">
            {/* Countdown Timer */}
            <div id="timer">
              <CountdownTimer />
            </div>

            <div className="status-instruction-card glass-card fade-in">
              <div className="instruction-icon"><FaInfoCircle /></div>
              <div className="instruction-content">
                <h3>Track Your Progress</h3>
                <p>Click the colored circles to update your task status:</p>
                <div className="status-legends">
                  <span className="legend-item"><span className="legend-dot pending"></span> Pending</span>
                  <span className="legend-item"><span className="legend-dot progress"></span> In Progress</span>
                  <span className="legend-item"><span className="legend-dot completed"></span> Completed</span>
                </div>
              </div>
            </div>

            <h2 id="tasks" className="section-title gradient-text">Your Tasks</h2>

            {allTasks.length === 0 ? (
              <div className="no-tasks glass-card">
                <div className="no-tasks-icon"><FaClipboardList /></div>
                <h3>No Tasks Yet</h3>
                <p>Tasks will appear here once they are assigned by the admin.</p>
              </div>
            ) : (
              <div className="tasks-by-round">
                {Object.entries(roundInfo).map(([roundKey, info]) => {
                  const tasks = dashboard?.tasks?.[roundKey] || [];
                  if (tasks.length === 0) return null;

                  return (
                    <div key={roundKey} className="round-section glass-card fade-in">
                      <div className="round-header" style={{ borderLeftColor: info.color }}>
                        <h3 className="round-label" style={{ color: info.color }}>
                          {info.label}
                        </h3>
                        <span className="round-subtitle">{info.subtitle}</span>
                      </div>

                      <div className="tasks-list">
                        {tasks.map((task, idx) => (
                          <div key={idx} className={`task-item status-${taskStatus[`${roundKey}-${idx}`] || 'pending'}`}>
                            <div className="task-header-row">
                              <div className="task-left">
                                <div className="task-number" style={{ background: info.color }}>
                                  {idx + 1}
                                </div>
                                <div className="task-content">
                                  <h4 className="task-title">{task.title}</h4>
                                  <p className="task-description">{task.description}</p>
                                </div>
                              </div>
                              <div className="task-status-actions">
                                <button
                                  className={`status-btn pending ${taskStatus[`${roundKey}-${idx}`] === 'pending' ? 'active' : ''}`}
                                  onClick={() => updateTaskStatus(roundKey, idx, 'pending')}
                                  title="Pending"
                                />
                                <button
                                  className={`status-btn progress ${taskStatus[`${roundKey}-${idx}`] === 'progress' ? 'active' : ''}`}
                                  onClick={() => updateTaskStatus(roundKey, idx, 'progress')}
                                  title="In Progress"
                                />
                                <button
                                  className={`status-btn completed ${taskStatus[`${roundKey}-${idx}`] === 'completed' ? 'active' : ''}`}
                                  onClick={() => updateTaskStatus(roundKey, idx, 'completed')}
                                  title="Completed"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Game Overlay */}
      {isGameFullscreen && (
        <div className="game-fullscreen-overlay">
          <div className="fullscreen-header">
            <h2>
              <FaGamepad /> DOOM - Take a Break
            </h2>
            <button
              className="fullscreen-close-btn"
              onClick={() => setIsGameFullscreen(false)}
              title="Exit Fullscreen"
            >
              <FaCompress /> Exit Fullscreen
            </button>
          </div>
          <div className="fullscreen-game-container">
            <DoomGame fullscreen={true} />
          </div>
        </div>
      )}

      <style>{`
        .dashboard-wrapper {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .vr-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
        }

        .vr-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${isDark
          ? 'radial-gradient(circle at center, rgba(15, 17, 21, 0.2) 0%, rgba(15, 17, 21, 0.6) 100%)'
          : 'radial-gradient(circle at center, rgba(248, 249, 250, 0.2) 0%, rgba(248, 249, 250, 0.6) 100%)'};
        }

        /* Animated gradient mesh background */
        .gradient-mesh {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: ${isDark ? '0.6' : '0.5'};
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: ${isDark
          ? 'radial-gradient(circle, rgba(139, 92, 246, 1) 0%, rgba(124, 58, 237, 0.6) 50%, transparent 100%)'
          : 'radial-gradient(circle, rgba(124, 58, 237, 0.8) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%)'};
          top: -15%;
          left: -15%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: ${isDark
          ? 'radial-gradient(circle, rgba(236, 72, 153, 0.9) 0%, rgba(219, 39, 119, 0.5) 50%, transparent 100%)'
          : 'radial-gradient(circle, rgba(219, 39, 119, 0.7) 0%, rgba(236, 72, 153, 0.35) 50%, transparent 100%)'};
          top: 15%;
          right: -10%;
          animation-delay: -5s;
          animation-duration: 25s;
        }

        .orb-3 {
          width: 550px;
          height: 550px;
          background: ${isDark
          ? 'radial-gradient(circle, rgba(99, 102, 241, 0.95) 0%, rgba(79, 70, 229, 0.55) 50%, transparent 100%)'
          : 'radial-gradient(circle, rgba(79, 70, 229, 0.75) 0%, rgba(99, 102, 241, 0.4) 50%, transparent 100%)'};
          bottom: -15%;
          left: 15%;
          animation-delay: -10s;
          animation-duration: 30s;
        }

        .orb-4 {
          width: 450px;
          height: 450px;
          background: ${isDark
          ? 'radial-gradient(circle, rgba(167, 139, 250, 0.85) 0%, rgba(139, 92, 246, 0.5) 50%, transparent 100%)'
          : 'radial-gradient(circle, rgba(139, 92, 246, 0.7) 0%, rgba(167, 139, 250, 0.35) 50%, transparent 100%)'};
          bottom: 5%;
          right: 10%;
          animation-delay: -15s;
          animation-duration: 22s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(60px, -60px) scale(1.15);
          }
          50% {
            transform: translate(-40px, 40px) scale(0.85);
          }
          75% {
            transform: translate(50px, 25px) scale(1.1);
          }
        }

        .dashboard-content-container {
          position: relative;
          z-index: 1;
        }

        /* Enhanced glass-card with better light mode support */
        .glass-card {
          background: ${isDark ? 'rgba(24, 27, 33, 0.7)' : 'rgba(255, 255, 255, 0.85)'};
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(124, 58, 237, 0.1)'};
          box-shadow: ${isDark
          ? '0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.05) inset'
          : '0 4px 16px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(124, 58, 237, 0.05) inset'};
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          border-color: ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.2)'};
          box-shadow: ${isDark
          ? '0 12px 40px 0 rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.1) inset'
          : '0 8px 24px 0 rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(124, 58, 237, 0.1) inset'};
        }

        .team-header-enhanced {
          padding: 40px;
          margin-bottom: 32px;
          animation: slideDown 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .team-header-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899, #06b6d4, #8b5cf6);
          background-size: 200% 100%;
          animation: gradientShift 3s linear infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* Team Title Row - Full Width */
        .team-title-row {
          position: relative;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)'};
          overflow: hidden;
        }

        .title-row-glow {
          position: absolute;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          background: radial-gradient(
            circle at center,
            rgba(139, 92, 246, 0.15) 0%,
            rgba(236, 72, 153, 0.15) 25%,
            rgba(6, 182, 212, 0.1) 50%,
            transparent 70%
          );
          animation: rotate 15s linear infinite;
          pointer-events: none;
        }

        .team-title-info {
          flex: 1;
        }

        /* Team Content Row - Game + Members */
        .team-content-row {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 32px;
          margin-bottom: 32px;
          align-items: stretch;
        }

        /* Game Section - Compact Clickable Preview */
        .game-section-compact {
          position: relative;
          height: 100%;
          min-height: 450px;
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.12) 100%)'
          : 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(185, 28, 28, 0.08) 100%)'};
          border: 2px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.2)'};
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .game-section-compact:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: ${isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(220, 38, 38, 0.4)'};
          box-shadow: ${isDark
          ? '0 16px 48px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(239, 68, 68, 0.2) inset'
          : '0 12px 36px rgba(220, 38, 38, 0.3), 0 0 0 1px rgba(220, 38, 38, 0.15) inset'};
        }

        .game-preview-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 50%, rgba(220, 38, 38, 0.15) 0%, transparent 50%);
          animation: pulse-bg 3s ease-in-out infinite;
        }

        @keyframes pulse-bg {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .game-preview-overlay {
          position: relative;
          z-index: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 40px;
          text-align: center;
        }

        .game-preview-icon {
          font-size: 80px;
          color: ${isDark ? '#ef4444' : '#dc2626'};
          filter: drop-shadow(0 8px 16px rgba(239, 68, 68, 0.5));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .game-preview-overlay h3 {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          font-weight: 900;
          margin: 0;
          background: ${isDark
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .game-preview-overlay p {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0;
        }

        .game-preview-hint {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          background: ${isDark
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : 'linear-gradient(135deg, #dc2626, #b91c1c)'};
          color: white;
          border-radius: 12px;
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
          animation: pulse-hint 2s ease-in-out infinite;
        }

        @keyframes pulse-hint {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .game-section-compact:hover .game-preview-icon {
          animation: float 1.5s ease-in-out infinite;
        }

        .game-section-compact:hover .game-preview-hint {
          animation: pulse-hint 1s ease-in-out infinite;
        }

        /* Team Branding */
        .team-branding {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        .team-number-badge-new {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px 32px;
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)'};
          border: 2px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.25)'};
          border-radius: 20px;
          box-shadow: ${isDark
          ? '0 8px 24px rgba(139, 92, 246, 0.2)'
          : '0 4px 16px rgba(124, 58, 237, 0.15)'};
          overflow: hidden;
        }

        .badge-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
          animation: rotate 10s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hash-icon {
          font-size: 32px;
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          z-index: 1;
        }

        .team-number-new {
          font-family: 'Orbitron', sans-serif;
          font-size: 48px;
          font-weight: 900;
          background: ${isDark
          ? 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)'
          : 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          z-index: 1;
        }

        .team-info-new {
          flex: 1;
        }

        .team-name-container {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .trophy-icon {
          font-size: 32px;
          color: ${isDark ? '#fbbf24' : '#f59e0b'};
          filter: drop-shadow(0 4px 8px rgba(251, 191, 36, 0.4));
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .team-meta {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .team-stats-mini {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .mini-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.08)'};
          border-radius: 12px;
          border: 1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)'};
        }

        .mini-icon {
          font-size: 14px;
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
        }

        .mini-stat span {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
        }

        /* Team Members Grid */
        .team-members-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .members-grid-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 2px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)'};
        }

        .members-grid-header h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
        }

        .header-icon {
          font-size: 18px;
        }

        .members-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          align-items: stretch;
          flex: 1;
          grid-auto-rows: 1fr;
          align-content: start;
        }

        .member-card {
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%)'};
          border: 1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)'};
          border-radius: 16px;
          padding: 32px 20px;
          min-height: 200px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .member-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .member-card:hover {
          transform: translateY(-4px);
          box-shadow: ${isDark
          ? '0 12px 32px rgba(139, 92, 246, 0.3)'
          : '0 8px 24px rgba(124, 58, 237, 0.2)'};
          border-color: ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(124, 58, 237, 0.3)'};
        }

        .member-card:hover::before {
          opacity: 1;
        }

        .member-card-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
          flex: 1;
        }

        .member-avatar-large {
          position: relative;
          width: 80px;
          height: 80px;
          background: ${isDark
          ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
          : 'linear-gradient(135deg, #7c3aed, #db2777)'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
        }

        .avatar-icon {
          font-size: 36px;
          color: white;
          z-index: 1;
        }

        .avatar-ring {
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border: 2px solid ${isDark ? '#a78bfa' : '#7c3aed'};
          border-radius: 50%;
          opacity: 0.5;
          animation: pulse-ring 2s ease-in-out infinite;
        }

        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        .member-details {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .member-name-new {
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.4;
        }

        .member-role {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .member-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 24px;
          height: 24px;
          background: ${isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(245, 158, 11, 0.15)'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .star-icon {
          font-size: 12px;
          color: ${isDark ? '#fbbf24' : '#f59e0b'};
        }

        /* Integrated Game Section */
        .game-section-integrated {
          margin-top: 24px;
          padding: 20px;
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.08) 100%)'
          : 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.05) 100%)'};
          border: 1px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.15)'};
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .game-section-integrated:hover {
          border-color: ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.25)'};
          box-shadow: ${isDark
          ? '0 8px 24px rgba(239, 68, 68, 0.2)'
          : '0 4px 16px rgba(220, 38, 38, 0.15)'};
        }

        .game-header-integrated {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.15)'};
        }

        .game-header-integrated h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: ${isDark ? '#ef4444' : '#dc2626'};
        }

        .game-icon-small {
          font-size: 16px;
        }

        .fullscreen-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: ${isDark
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : 'linear-gradient(135deg, #dc2626, #b91c1c)'};
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .fullscreen-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .fullscreen-btn:active {
          transform: translateY(0);
        }

        .game-container-integrated {
          width: 100%;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'};
          border-radius: 12px;
          overflow: hidden;
        }

        /* Fullscreen Game Overlay */
        .game-fullscreen-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${isDark ? 'rgba(10, 10, 26, 0.98)' : 'rgba(0, 0, 0, 0.95)'};
          z-index: 9999;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .fullscreen-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(219, 39, 119, 0.08) 100%)'};
          border-bottom: 2px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.2)'};
        }

        .fullscreen-header h2 {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0;
          font-family: 'Orbitron', sans-serif;
          font-size: 28px;
          font-weight: 800;
          background: ${isDark
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .fullscreen-close-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: ${isDark
          ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
          : 'linear-gradient(135deg, #7c3aed, #6d28d9)'};
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        }

        .fullscreen-close-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(139, 92, 246, 0.5);
        }

        .fullscreen-close-btn:active {
          transform: translateY(0);
        }

        .fullscreen-game-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: auto;
        }

        .team-number-badge {
          position: relative;
          display: flex;
          align-items: baseline;
          gap: 4px;
          padding: 20px 28px;
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(219, 39, 119, 0.12) 100%)'};
          border: 2px solid ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(124, 58, 237, 0.3)'};
          border-radius: 20px;
          box-shadow: ${isDark
          ? '0 8px 32px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 4px 16px rgba(124, 58, 237, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'};
        }

        .team-hash {
          font-family: 'Orbitron', sans-serif;
          font-size: 48px;
          font-weight: 900;
          background: ${isDark
          ? 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)'
          : 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.7;
        }

        .team-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 64px;
          font-weight: 900;
          background: ${isDark
          ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)'
          : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -2px;
          filter: drop-shadow(0 4px 12px ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(124, 58, 237, 0.3)'});
        }

        .team-info {
          flex: 1;
        }

        .team-name-enhanced {
          font-size: 42px;
          margin: 0 0 16px 0;
          font-weight: 900;
          letter-spacing: -1px;
          color: var(--text-primary);
          font-family: 'Orbitron', sans-serif;
          line-height: 1.2;
        }

        .team-badges {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .domain-badge-enhanced,
        .flash-badge-enhanced {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }

        .domain-badge-enhanced {
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'};
          border: 1.5px solid ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(124, 58, 237, 0.3)'};
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          box-shadow: 0 4px 12px ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)'};
        }

        .flash-badge-enhanced {
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(219, 39, 119, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)'};
          border: 1.5px solid ${isDark ? 'rgba(236, 72, 153, 0.4)' : 'rgba(236, 72, 153, 0.3)'};
          color: ${isDark ? '#f472b6' : '#db2777'};
          box-shadow: 0 4px 12px ${isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.15)'};
          animation: flashPulse 2s infinite;
        }

        .badge-icon {
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .domain-badge-enhanced:hover,
        .flash-badge-enhanced:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.25)'};
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: ${isDark ? 'rgba(10, 10, 26, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
          border-radius: 16px;
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: ${isDark ? '0 12px 32px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(0, 0, 0, 0.12)'};
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-total::before {
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
        }

        .stat-completed::before {
          background: linear-gradient(90deg, #10b981, #34d399);
        }

        .stat-progress::before {
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }

        .stat-pending::before {
          background: linear-gradient(90deg, #ef4444, #f87171);
        }

        .stat-icon {
          font-size: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
        }

        .stat-total .stat-icon {
          color: #8b5cf6;
        }

        .stat-completed .stat-icon {
          color: #10b981;
        }

        .stat-progress .stat-icon {
          color: #f59e0b;
        }

        .stat-pending .stat-icon {
          color: #ef4444;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-total .stat-value {
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-completed .stat-value {
          background: linear-gradient(135deg, #10b981, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-progress .stat-value {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-pending .stat-value {
          background: linear-gradient(135deg, #ef4444, #f87171);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
        }

        /* Enhanced Team Members */
        .team-members-enhanced {
          background: ${isDark ? 'rgba(10, 10, 26, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
          padding: 24px;
          border-radius: 16px;
          border: 1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)'};
        }

        .members-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        }

        .members-icon {
          font-size: 20px;
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .members-header h4 {
          flex: 1;
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          margin: 0;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 800;
          font-family: 'Inter', sans-serif;
        }

        .members-count {
          background: ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)'};
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          font-family: 'Orbitron', sans-serif;
        }

        .members-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .member-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: ${isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(124, 58, 237, 0.03)'};
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .member-item:hover {
          background: ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.08)'};
          transform: translateX(4px);
        }

        .member-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${isDark
          ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
          : 'linear-gradient(135deg, #7c3aed, #db2777)'};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 14px;
          font-family: 'Orbitron', sans-serif;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .member-name {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }

        /* Game Section */
        .game-section {
          padding: 32px;
          margin-bottom: 32px;
        }

        .game-header-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .game-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-family: 'Orbitron', sans-serif;
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 8px 0;
          background: ${isDark
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .game-icon {
          font-size: 28px;
          color: ${isDark ? '#ef4444' : '#dc2626'};
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .game-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .game-container {
          width: 100%;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-title {
          font-size: 32px;
          margin-bottom: 28px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 800;
          font-family: 'Orbitron', sans-serif;
        }

        .no-tasks {
          text-align: center;
          padding: 80px 40px;
        }

        .no-tasks-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.6;
          color: ${isDark ? '#8b5cf6' : '#7c3aed'};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .no-tasks h3 {
          font-size: 26px;
          margin-bottom: 12px;
          color: var(--text-primary);
          font-weight: 700;
        }

        .no-tasks p {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.6;
        }

        .round-section {
          padding: 28px;
          margin-bottom: 28px;
          border-radius: 16px;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .round-header {
          border-left: 5px solid;
          padding-left: 20px;
          margin-bottom: 24px;
          background: ${isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)'};
          padding: 16px 20px;
          border-radius: 8px;
        }

        .round-label {
          font-size: 22px;
          margin-bottom: 6px;
          font-weight: 800;
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 0.5px;
        }

        .round-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
          opacity: 0.9;
          font-family: 'Inter', sans-serif;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item {
          padding: 24px;
          background: ${isDark ? 'rgba(10, 10, 26, 0.5)' : 'rgba(255, 255, 255, 0.7)'};
          border-radius: 14px;
          margin-bottom: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 4px solid transparent;
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          box-shadow: ${isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'};
        }
        
        .task-item:hover {
          background: ${isDark ? 'rgba(10, 10, 26, 0.7)' : 'rgba(255, 255, 255, 0.95)'};
          transform: translateX(6px);
          box-shadow: ${isDark ? '0 4px 16px rgba(0, 0, 0, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.1)'};
        }

        .task-item.status-pending {
          background: ${isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)'};
          border-left-color: #ef4444;
          border-left-width: 4px;
        }

        .task-item.status-progress {
          background: ${isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)'};
          border-left-color: #f59e0b;
          border-left-width: 4px;
        }

        .task-item.status-completed {
          background: ${isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)'};
          border-left-color: #10b981;
          border-left-width: 4px;
        }

        .task-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .task-left {
          display: flex;
          gap: 18px;
          flex: 1;
        }

        .task-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-weight: 800;
          font-size: 16px;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .task-content {
          flex: 1;
        }

        .task-title {
          font-size: 17px;
          margin-bottom: 8px;
          color: var(--text-primary);
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.2px;
        }

        .task-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .task-status-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          background: ${isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)'};
          padding: 8px 12px;
          border-radius: 24px;
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)'};
        }

        .status-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0.4;
          position: relative;
        }

        .status-btn:hover {
          opacity: 0.9;
          transform: scale(1.2);
        }

        .status-btn.active {
          opacity: 1;
          transform: scale(1.2);
          box-shadow: 0 0 0 3px ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        }
        
        .status-btn.active::after {
          content: '';
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          border-radius: 50%;
          border: 2px solid currentColor;
          opacity: 0.4;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .status-btn.pending { 
          background-color: #ef4444; 
          color: #ef4444; 
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); 
        }
        
        .status-btn.progress { 
          background-color: #f59e0b; 
          color: #f59e0b; 
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.4); 
        }
        
        .status-btn.completed { 
          background-color: #10b981; 
          color: #10b981; 
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); 
        }

        .status-instruction-card {
          margin-bottom: 28px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 20px;
          background: ${isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.06)'};
          border: 1.5px solid ${isDark ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.2)'};
          border-radius: 14px;
          box-shadow: ${isDark ? '0 4px 16px rgba(124, 58, 237, 0.15)' : '0 2px 12px rgba(124, 58, 237, 0.1)'};
        }

        .instruction-icon {
          font-size: 24px;
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .instruction-content h3 {
          margin: 0 0 10px 0;
          font-family: 'Orbitron', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          letter-spacing: 0.5px;
        }

        .instruction-content p {
          margin: 0 0 14px 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        }

        .status-legends {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
        }

        .legend-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }
        
        .legend-dot.pending { 
          background: #ef4444; 
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); 
        }
        
        .legend-dot.progress { 
          background: #f59e0b; 
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5); 
        }
        
        .legend-dot.completed { 
          background: #10b981; 
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); 
        }

        @media (max-width: 768px) {
          .team-header-enhanced {
            padding: 24px;
          }

          .team-title-row {
            flex-direction: column;
            align-items: flex-start;
            text-align: center;
            gap: 20px;
          }

          .team-number-badge-new {
            padding: 20px 28px;
            align-self: center;
          }

          .team-title-info {
            width: 100%;
            text-align: center;
          }

          .team-name-container {
            justify-content: center;
          }

          .team-badges {
            justify-content: center;
          }

          .team-stats-mini {
            width: 100%;
            justify-content: center;
          }

          .team-content-row {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .game-section-compact {
            min-height: 350px;
          }

          .game-preview-icon {
            font-size: 60px;
          }

          .game-preview-overlay h3 {
            font-size: 24px;
          }

          .members-grid-container {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-icon {
            font-size: 28px;
          }

          .stat-value {
            font-size: 24px;
          }

          .game-section {
            padding: 24px;
          }

          .game-title {
            font-size: 24px;
          }

          .game-container {
            min-height: 300px;
          }

          .task-header-row {
            flex-direction: column;
            gap: 16px;
          }

          .task-status-actions {
            align-self: flex-start;
          }

          .section-title {
            font-size: 26px;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flashPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default TeamLeadDashboard;
