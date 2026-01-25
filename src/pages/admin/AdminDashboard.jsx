import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getTeams();
            setTeams(response.data.data);
        } catch (err) {
            toast.error('Failed to load teams');
            console.error('Fetch teams error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTeamClick = (teamId) => {
        navigate(`/admin/team/${teamId}`);
    };

    const toggleFlashRound = async (e, team) => {
        e.stopPropagation();

        // Confirmation dialog
        const action = team.isFlashRoundSelected ? 'remove' : 'add';
        const confirmMessage = team.isFlashRoundSelected
            ? `Remove ${team.teamName} from Flash Round?`
            : `Add ${team.teamName} to Flash Round?`;

        if (!window.confirm(confirmMessage)) {
            return; // User cancelled
        }

        const loadingToast = toast.loading(`${action === 'add' ? 'Adding' : 'Removing'} team...`);

        try {
            if (team.isFlashRoundSelected) {
                await adminAPI.removeFlashRound(team._id);
                toast.success(`${team.teamName} removed from Flash Round`, {
                    id: loadingToast,
                });
            } else {
                await adminAPI.selectFlashRound(team._id, 20);
                toast.success(`${team.teamName} added to Flash Round`, {
                    id: loadingToast,
                });
            }
            fetchTeams();
        } catch (err) {
            toast.error('Failed to update Flash Round status', {
                id: loadingToast,
            });
            console.error('Flash Round toggle error:', err);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-wrapper">
                    <div className="container">
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p className="loading-text">Loading teams...</p>
                        </div>
                    </div>
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
                            <span className="gradient-text">Admin Dashboard</span>
                        </h1>
                        <p className="page-subtitle">Manage {teams.length} Teams • Assign Tasks • View Scores</p>
                    </div>

                    {(() => {
                        // Group teams by domain
                        const teamsByDomain = teams.reduce((acc, team) => {
                            const domain = team.domain || 'Uncategorized';
                            if (!acc[domain]) acc[domain] = [];
                            acc[domain].push(team);
                            return acc;
                        }, {});

                        // Define domain colors for visual distinction
                        const domainColors = {
                            'Web Development': '#3b82f6',
                            'Web3 & Blockchain': '#8b5cf6',
                            'IoT Systems': '#10b981',
                            'Quantum Computing': '#06b6d4',
                            'Cyber Security': '#ef4444',
                            'Machine Learning': '#f59e0b',
                            'Agentic AI': '#ec4899',
                            'App Development': '#14b8a6'
                        };

                        return Object.entries(teamsByDomain).map(([domain, domainTeams]) => (
                            <div key={domain} className="domain-section fade-in">
                                <div className="domain-header" style={{ borderLeftColor: domainColors[domain] || '#6b7280' }}>
                                    <h2 className="domain-title" style={{ color: domainColors[domain] || '#6b7280' }}>
                                        {domain}
                                    </h2>
                                    <span className="domain-count">{domainTeams.length} team{domainTeams.length !== 1 ? 's' : ''}</span>
                                </div>

                                <div className="cards-grid">
                                    {domainTeams.map((team, index) => (
                                        <div
                                            key={team._id}
                                            className="glass-card team-card fade-in"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                            onClick={() => handleTeamClick(team._id)}
                                        >
                                            <div className="team-card-header">
                                                <span className="team-number">#{team.teamNumber}</span>
                                                {team.isFlashRoundSelected && (
                                                    <span className="flash-badge">⚡ FLASH</span>
                                                )}
                                            </div>

                                            <h3 className="team-name">{team.teamName}</h3>

                                            <div className="scores-row">
                                                <span className="score-badge round1">
                                                    R1: {team.scores?.round1?.score ?? '-'}/{team.scores?.round1?.maxScore}
                                                </span>
                                                <span className="score-badge round2">
                                                    R2: {team.scores?.round2?.score ?? '-'}/{team.scores?.round2?.maxScore}
                                                </span>
                                                <span className="score-badge round3">
                                                    R3: {team.scores?.round3?.score ?? '-'}/{team.scores?.round3?.maxScore}
                                                </span>
                                            </div>

                                            <div className="team-card-footer">
                                                <span className="score-badge total">
                                                    Total: {team.totalScore}/100
                                                </span>
                                                <button
                                                    className={`btn btn-sm ${team.isFlashRoundSelected ? 'btn-danger' : 'btn-secondary'}`}
                                                    onClick={(e) => toggleFlashRound(e, team)}
                                                >
                                                    {team.isFlashRoundSelected ? 'Remove Flash' : 'Add Flash'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            <style>{`
        .domain-section {
          margin-bottom: 48px;
        }

        .domain-header {
          border-left: 4px solid;
          padding-left: 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .domain-title {
          font-size: 24px;
          font-family: 'Orbitron', sans-serif;
          margin: 0;
        }

        .domain-count {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
        }

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
          font-size: 16px;
        }

        .scores-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 16px 0;
        }

        .team-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 11px;
        }
      `}</style>
        </>
    );
};

export default AdminDashboard;
