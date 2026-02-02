import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import { GridScan } from '../../components/GridScan';
import { useTheme } from '../../context/ThemeContext';

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await adminAPI.getLeaderboard();
      setLeaderboard(response.data.data);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const toggleFlashRound = async (e, team) => {
    e.stopPropagation();

    try {
      if (team.isFlashRoundSelected) {
        await adminAPI.removeFlashRound(team._id);
      } else {
        await adminAPI.selectFlashRound(team._id, 20);
      }
      // Silently refresh the leaderboard
      fetchLeaderboard();
    } catch (err) {
      console.error('Flash Round toggle error:', err);
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return { color: '#ffd700', icon: '👑', glow: '0 0 15px rgba(255, 215, 0, 0.5)' };
      case 2: return { color: '#c0c0c0', icon: '🥈', glow: '0 0 10px rgba(192, 192, 192, 0.5)' };
      case 3: return { color: '#cd7f32', icon: '🥉', glow: '0 0 10px rgba(205, 127, 50, 0.5)' };
      default: return { color: 'var(--text-primary)', icon: `#${rank}`, glow: 'none' };
    }
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

  return (
    <div className="leaderboard-wrapper">
      <div className="vr-background">
        <GridScan
          sensitivity={0.4}
          lineThickness={1}
          linesColor={isDark ? "#4f46e5" : "#cbd5e1"}
          gridScale={0.15}
          scanColor={isDark ? "#f59e0b" : "#3b82f6"}
          scanOpacity={0.2}
          enablePost
        />
        <div className="vr-overlay"></div>
      </div>

      <Navbar />

      <div className="page-wrapper content-container">
        <div className="container">
          <div className="page-header slide-up">
            <h1 className="page-title">
              <span className="gradient-text">Global Leaderboard</span>
            </h1>
            <p className="page-subtitle">Top Performing Teams Across All Domains</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="leaderboard-card glass-card fade-in">
            <div className="table-responsive">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="team-col">Team</th>
                    <th className="domain-col">Domain</th>
                    <th className="scores-col">Round Scores</th>
                    <th className="total-col">Total</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((team, index) => {
                    const rankData = getRankStyle(index + 1);
                    return (
                      <tr key={team.teamNumber} className={`rank-row rank-${index + 1}`} style={{ animationDelay: `${index * 0.05}s` }}>
                        <td className="rank-cell">
                          <div className="rank-badge" style={{
                            color: rankData.color,
                            borderColor: rankData.color,
                            boxShadow: rankData.glow
                          }}>
                            {rankData.icon}
                          </div>
                        </td>
                        <td className="team-cell">
                          <div className="team-info">
                            <span className="team-name">{team.teamName}</span>
                            <span className="team-number">#{team.teamNumber}</span>
                            {team.isFlashRoundSelected && <span className="flash-tag">⚡</span>}
                          </div>
                        </td>
                        <td className="domain-cell">
                          <span className="domain-tag">{team.domain || 'Uncategorized'}</span>
                        </td>
                        <td className="scores-cell">
                          <div className="mini-scores">
                            <span title="Round 1" className="ms-item r1">R1: {team.scores?.round1?.finalScore ?? '-'}</span>
                            <span title="Round 2" className="ms-item r2">R2: {team.scores?.round2?.finalScore ?? '-'}</span>
                            <span title="Round 3" className="ms-item r3">R3: {team.scores?.round3?.finalScore ?? '-'}</span>
                          </div>
                        </td>
                        <td className="total-cell">
                          <span className="total-score">{team.totalScore}</span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className={`flash-btn ${team.isFlashRoundSelected ? 'active' : ''}`}
                            onClick={(e) => toggleFlashRound(e, team)}
                            title={team.isFlashRoundSelected ? 'Remove from Flash Round' : 'Add to Flash Round'}
                          >
                            Flash
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .leaderboard-wrapper {
          position: relative;
          min-height: 100vh;
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
          ? 'radial-gradient(circle at center, rgba(15, 17, 21, 0.4) 0%, rgba(15, 17, 21, 0.9) 100%)'
          : 'radial-gradient(circle at center, rgba(240, 242, 245, 0.4) 0%, rgba(240, 242, 245, 0.9) 100%)'};
        }

        .content-container {
          position: relative;
          z-index: 10;
        }

        .leaderboard-card {
          padding: 0;
          overflow: hidden;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
        }

        .leaderboard-table th {
          padding: 20px;
          text-align: left;
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
          color: var(--text-secondary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .leaderboard-table td {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .rank-row:last-child td {
          border-bottom: none;
        }

        .rank-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .rank-badge {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          border: 2px solid transparent;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.2);
        }

        .team-info {
          display: flex;
          flex-direction: column;
        }

        .team-name {
          font-weight: 600;
          font-size: 16px;
          color: var(--text-primary);
        }

        .team-number {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .flash-tag {
          font-size: 12px;
          margin-left: 8px;
        }

        .domain-tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          font-size: 12px;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .mini-scores {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .total-score {
          font-family: 'Orbitron', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: var(--primary);
        }

        .flash-btn {
          padding: 6px 16px;
          background: rgba(139, 92, 246, 0.1);
          border: 1.5px solid rgba(139, 92, 246, 0.3);
          border-radius: 6px;
          color: rgba(167, 139, 250, 0.9);
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.3px;
        }

        .flash-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
          color: #a78bfa;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
        }

        .flash-btn.active {
          background: rgba(139, 92, 246, 0.25);
          border-color: rgba(139, 92, 246, 0.6);
          color: #8b5cf6;
        }

        .flash-btn.active:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
        }

        .actions-cell {
          text-align: center;
        }

        @media (max-width: 768px) {
          .domain-col, .scores-col {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLeaderboard;
