import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import CountdownTimer from '../../components/CountdownTimer';
import RippleGrid from '../../components/RippleGrid';
import { teamLeadAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const TeamLeadDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    tasks.forEach(task => {
      allTasks.push({ ...task, round });
    });
  });

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
          <div className="team-header glass-card slide-up">
            <div className="team-header-left">
              <span className="team-number-large">#{dashboard?.teamNumber}</span>
              <div>
                <h1 className="team-name-large">{dashboard?.teamName}</h1>
                {dashboard?.domain && (
                  <span className="domain-badge">{dashboard.domain}</span>
                )}
                {dashboard?.isFlashRoundSelected && (
                  <span className="flash-badge">⚡</span>
                )}
              </div>
            </div>
            <div className="team-members">
              <h4>Team Members</h4>
              <ul>
                {dashboard?.members?.map((member, idx) => (
                  <li key={idx}>{member.name}</li>
                ))}
              </ul>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="dashboard-content">
            {/* Countdown Timer */}
            <CountdownTimer />

            <div className="status-instruction-card glass-card fade-in">
              <div className="instruction-icon">ℹ️</div>
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

            <h2 className="section-title gradient-text">Your Tasks</h2>

            {allTasks.length === 0 ? (
              <div className="no-tasks glass-card">
                <div className="no-tasks-icon">📋</div>
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

        .team-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32px;
          margin-bottom: 32px;
          animation: slideDown 0.6s ease-out;
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

        .team-header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .team-number-large {
          font-family: 'Orbitron', sans-serif;
          font-size: 72px;
          font-weight: 900;
          background: ${isDark
          ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)'
          : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: ${isDark ? '0 0 30px rgba(139, 92, 246, 0.3)' : 'none'};
          letter-spacing: -2px;
        }

        .team-name-large {
          font-size: 36px;
          margin-bottom: 12px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text-primary);
          font-family: 'Orbitron', sans-serif;
        }

        .domain-badge {
          display: inline-block;
          padding: 6px 16px;
          background: ${isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(124, 58, 237, 0.1)'};
          border: 1.5px solid ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(124, 58, 237, 0.3)'};
          border-radius: 24px;
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          font-size: 13px;
          font-weight: 700;
          margin-right: 8px;
          margin-bottom: 8px;
          box-shadow: ${isDark ? '0 0 12px rgba(139, 92, 246, 0.2)' : '0 2px 8px rgba(124, 58, 237, 0.15)'};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: 'Inter', sans-serif;
        }

        .flash-badge {
          display: inline-block;
          padding: 6px 12px;
          background: ${isDark ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.1)'};
          border: 1.5px solid ${isDark ? 'rgba(236, 72, 153, 0.4)' : 'rgba(236, 72, 153, 0.3)'};
          border-radius: 24px;
          color: ${isDark ? '#f472b6' : '#db2777'};
          font-size: 16px;
          font-weight: 700;
          box-shadow: ${isDark ? '0 0 12px rgba(236, 72, 153, 0.3)' : '0 2px 8px rgba(236, 72, 153, 0.2)'};
          animation: flashPulse 2s infinite;
        }

        @keyframes flashPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .team-members {
          text-align: right;
          background: ${isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(124, 58, 237, 0.03)'};
          padding: 16px 20px;
          border-radius: 12px;
          border: 1px solid ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.08)'};
        }

        .team-members h4 {
          color: ${isDark ? '#a78bfa' : '#7c3aed'};
          margin-bottom: 12px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
        }

        .team-members ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .team-members li {
          color: var(--text-secondary);
          margin: 6px 0;
          font-weight: 600;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
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
          font-size: 72px;
          margin-bottom: 20px;
          opacity: 0.6;
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
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
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
          .team-header {
            flex-direction: column;
            text-align: center;
            gap: 24px;
            padding: 24px;
          }

          .team-header-left {
            flex-direction: column;
            gap: 16px;
          }

          .team-number-large {
            font-size: 56px;
          }

          .team-name-large {
            font-size: 28px;
          }

          .team-members {
            text-align: center;
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
      `}</style>
    </div>
  );
};

export default TeamLeadDashboard;
