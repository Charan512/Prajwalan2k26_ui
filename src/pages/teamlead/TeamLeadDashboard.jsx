import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { teamLeadAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { GridScan } from '../../components/GridScan';

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
        <GridScan
          sensitivity={0.5}
          lineThickness={1.5}
          linesColor={isDark ? "#4f46e5" : "#cbd5e1"}
          gridScale={0.15}
          scanColor={isDark ? "#ec4899" : "#3b82f6"}
          scanOpacity={0.3}
          enablePost
          bloomIntensity={0.4}
          noiseIntensity={0.005}
        />
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
                  <span className="flash-badge">⚡ FLASH ROUND SELECTED</span>
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
          ? 'radial-gradient(circle at center, rgba(15, 17, 21, 0.4) 0%, rgba(15, 17, 21, 0.85) 100%)'
          : 'radial-gradient(circle at center, rgba(240, 242, 245, 0.4) 0%, rgba(240, 242, 245, 0.85) 100%)'};
        }

        .dashboard-content-container {
          position: relative;
          z-index: 1;
        }

        /* Override glass-card for better VR transparency */
        .glass-card {
          background: ${isDark ? 'rgba(24, 27, 33, 0.65)' : 'rgba(255, 255, 255, 0.65)'};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }

        .team-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32px;
          margin-bottom: 32px;
        }

        .team-header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .team-number-large {
          font-family: 'Orbitron', sans-serif;
          font-size: 64px;
          font-weight: 900;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
        }

        .team-name-large {
          font-size: 32px;
          margin-bottom: 8px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .domain-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 20px;
          color: #a78bfa;
          font-size: 12px;
          font-weight: 600;
          margin-right: 8px;
          margin-bottom: 8px;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.1);
        }

        .team-members {
          text-align: right;
        }

        .team-members h4 {
          color: var(--text-secondary);
          margin-bottom: 8px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .team-members ul {
          list-style: none;
        }

        .team-members li {
          color: var(--text-muted);
          margin: 4px 0;
          font-weight: 500;
        }

        .section-title {
          font-size: 28px;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 800;
        }

        .no-tasks {
          text-align: center;
          padding: 60px 40px;
        }

        .no-tasks-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .no-tasks h3 {
          font-size: 24px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .no-tasks p {
          color: var(--text-muted);
        }

        .round-section {
          padding: 24px;
          margin-bottom: 24px;
          border-radius: 16px;
        }

        .round-header {
          border-left: 4px solid;
          padding-left: 16px;
          margin-bottom: 20px;
        }

        .round-label {
          font-size: 20px;
          margin-bottom: 4px;
          font-weight: 700;
        }

        .round-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          opacity: 0.8;
        }

        .task-item {
          padding: 20px;
          background: ${isDark ? 'rgba(10, 10, 26, 0.4)' : 'rgba(255, 255, 255, 0.5)'};
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
          border: 1px solid transparent;
        }
        
        .task-item:hover {
          background: ${isDark ? 'rgba(10, 10, 26, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
          transform: translateX(4px);
        }

        .task-item.status-pending {
          background: ${isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.05)'};
          border-left-color: #ef4444;
        }

        .task-item.status-progress {
          background: ${isDark ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.05)'};
          border-left-color: #f59e0b;
        }

        .task-item.status-completed {
          background: ${isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.05)'};
          border-left-color: #10b981;
        }

        .task-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .task-left {
            display: flex;
            gap: 16px;
            flex: 1;
        }

        .task-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .task-content {
          flex: 1;
        }

        .task-title {
          font-size: 16px;
          margin-bottom: 6px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .task-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .task-status-actions {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .status-btn {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            opacity: 0.3;
            position: relative;
        }

        .status-btn:hover {
            opacity: 0.8;
            transform: scale(1.15);
        }

        .status-btn.active {
            opacity: 1;
            transform: scale(1.15);
        }
        
        .status-btn.active::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 50%;
          border: 2px solid currentColor;
          opacity: 0.3;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .status-btn.pending { background-color: #ef4444; color: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.3); }
        .status-btn.progress { background-color: #f59e0b; color: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
        .status-btn.completed { background-color: #10b981; color: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.3); }

        .status-instruction-card {
          margin-bottom: 24px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: ${isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};
          border: 1px solid rgba(99, 102, 241, 0.2);
        }

        .instruction-icon {
          font-size: 24px;
        }

        .instruction-content h3 {
          margin: 0 0 8px 0;
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          color: ${isDark ? '#818cf8' : '#4f46e5'};
        }

        .instruction-content p {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .status-legends {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-primary);
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .legend-dot.pending { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
        .legend-dot.progress { background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
        .legend-dot.completed { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }

        @media (max-width: 768px) {
          .team-header {
            flex-direction: column;
            text-align: center;
            gap: 24px;
          }

          .team-header-left {
            flex-direction: column;
          }

          .team-members {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TeamLeadDashboard;
