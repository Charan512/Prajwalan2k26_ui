import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { evaluatorAPI } from '../../services/api';

const FlashRound = () => {
    const [teams, setTeams] = useState([]);
    const [evaluatorProfile, setEvaluatorProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchFlashRoundTeams();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await evaluatorAPI.getProfile();
            setEvaluatorProfile(response.data.data);
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const fetchFlashRoundTeams = async () => {
        try {
            const response = await evaluatorAPI.getFlashRoundTeams();
            setTeams(response.data.data);
        } catch (err) {
            setError('Failed to load Flash Round teams');
        } finally {
            setLoading(false);
        }
    };

    const handleTeamClick = (teamId) => {
        navigate(`/evaluator/team/${teamId}`);
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
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <div className="page-header slide-up">
                        <h1 className="page-title">
                            <span className="gradient-text">⚡ Flash Round</span>
                        </h1>
                        <p className="page-subtitle">Round 4 • Selected Top Performers</p>
                        {evaluatorProfile?.domain && (
                            <div className="evaluator-domain">
                                <span className="domain-label">Your Domain:</span>
                                <span className="domain-value">{evaluatorProfile.domain}</span>
                            </div>
                        )}
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    {teams.length === 0 ? (
                        <div className="no-teams glass-card">
                            <div className="no-teams-icon">⚡</div>
                            <h3>No Flash Round Teams Yet</h3>
                            <p>
                                {evaluatorProfile?.domain
                                    ? `No teams in ${evaluatorProfile.domain} have been selected for Flash Round yet.`
                                    : 'No teams have been selected for Flash Round yet.'}
                            </p>
                            <p className="hint">Admin will select top performers after Round 3.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="section-title">
                                Flash Round Teams
                                {evaluatorProfile?.domain && ` in ${evaluatorProfile.domain}`}
                                <span className="team-count"> ({teams.length})</span>
                            </h2>
                            <div className="cards-grid">
                                {teams.map((team, index) => (
                                    <div
                                        key={team._id}
                                        className="glass-card team-card fade-in flash-team-card"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                        onClick={() => handleTeamClick(team._id)}
                                    >
                                        <div className="team-card-header">
                                            <span className="team-number">#{team.teamNumber}</span>
                                            <span className="flash-badge flash-active">⚡ FLASH</span>
                                        </div>

                                        <h3 className="team-name">{team.teamName}</h3>
                                        {team.domain && (
                                            <span className="domain-badge-small">{team.domain}</span>
                                        )}

                                        <div className="scores-row">
                                            <span className="score-badge round1">
                                                {team.scores?.round1?.score ?? '-'}/30
                                            </span>
                                            <span className="score-badge round2">
                                                {team.scores?.round2?.score ?? '-'}/20
                                            </span>
                                            <span className="score-badge round3">
                                                {team.scores?.round3?.score ?? '-'}/50
                                            </span>
                                            <span className="score-badge round4">
                                                {team.scores?.round4?.score ?? '-'}/{team.scores?.round4?.maxScore ?? 20}
                                            </span>
                                        </div>

                                        <div className="team-total">
                                            <span className="score-badge total">Total: {team.totalScore}/100</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
        .page-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .page-title {
          font-size: 36px;
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .evaluator-domain {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid #8b5cf6;
          border-radius: 24px;
          margin-top: 12px;
        }

        .domain-label {
          font-size: 12px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .domain-value {
          font-size: 14px;
          color: #a78bfa;
          font-weight: 700;
        }

        .no-teams {
          text-align: center;
          padding: 60px 40px;
        }

        .no-teams-icon {
          font-size: 64px;
          margin-bottom: 16px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }

        .no-teams h3 {
          font-size: 24px;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .no-teams p {
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .hint {
          font-size: 14px;
          font-style: italic;
          color: var(--text-secondary);
        }

        .section-title {
          font-size: 20px;
          margin-bottom: 24px;
          color: var(--text-secondary);
        }

        .team-count {
          color: var(--primary);
          font-weight: 700;
        }

        .flash-team-card {
          border: 2px solid rgba(239, 68, 68, 0.3);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(10, 10, 26, 0.8) 100%);
        }

        .flash-team-card:hover {
          border-color: rgba(239, 68, 68, 0.6);
          transform: translateY(-4px);
        }

        .flash-active {
          animation: flash-glow 2s ease-in-out infinite;
        }

        @keyframes flash-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
        }

        .domain-badge-small {
          display: block;
          font-size: 11px;
          color: #a78bfa;
          margin-top: 4px;
          font-weight: 500;
        }

        .scores-row {
          display: flex;
          gap: 8px;
          margin: 16px 0;
          flex-wrap: wrap;
        }

        .team-total {
          margin-top: 12px;
        }

        .score-badge.round4 {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
      `}</style>
        </>
    );
};

export default FlashRound;
