import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Boxes } from '../../components/ui/background-boxes';

const AdminScoreEditor = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editedScores, setEditedScores] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('All');
    const [expandedDomains, setExpandedDomains] = useState({});
    const navigate = useNavigate();

    const TEAMS_PER_PAGE = 10;

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

    const toggleDomainExpansion = (domain) => {
        setExpandedDomains(prev => ({
            ...prev,
            [domain]: !prev[domain]
        }));
    };

    const handleScoreChange = (teamId, round, value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) return;

        setEditedScores(prev => ({
            ...prev,
            [teamId]: {
                ...prev[teamId],
                [round]: numValue
            }
        }));
    };

    const handleSaveScore = async (teamId, round) => {
        const newScore = editedScores[teamId]?.[round];
        if (newScore === undefined) return;

        try {
            setSaving(true);
            await adminAPI.updateFacultyScore(teamId, round, newScore);
            toast.success(`${round} faculty score updated successfully`);

            await fetchTeams();

            setEditedScores(prev => {
                const updated = { ...prev };
                if (updated[teamId]) {
                    delete updated[teamId][round];
                }
                return updated;
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update score');
            console.error('Update score error:', err);
        } finally {
            setSaving(false);
        }
    };

    const getCurrentFacultyScore = (team, round) => {
        const roundScore = team.scores?.[round];
        if (!roundScore?.evaluations) return null;

        const staffEvaluations = roundScore.evaluations.filter(e => e.evaluatorType === 'staff');
        if (staffEvaluations.length === 0) return null;

        const average = staffEvaluations.reduce((sum, e) => sum + e.score, 0) / staffEvaluations.length;
        return Math.round(average * 100) / 100;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    <Boxes disableHover />
                </div>
                <div className="page-wrapper" style={{ position: 'relative', zIndex: 10 }}>
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

    // Filter teams
    const filteredTeams = teams.filter(team => {
        const matchesSearch = searchQuery === '' ||
            team.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.teamNumber?.toString().includes(searchQuery) ||
            (team.domain && team.domain.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesDomain = selectedDomain === 'All' || team.domain === selectedDomain;

        return matchesSearch && matchesDomain;
    });

    // Group by domain
    const teamsByDomain = filteredTeams.reduce((acc, team) => {
        const domain = team.domain || 'Uncategorized';
        if (!acc[domain]) acc[domain] = [];
        acc[domain].push(team);
        return acc;
    }, {});

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

    const sortedDomains = Object.entries(teamsByDomain).sort((a, b) => a[0].localeCompare(b[0]));

    return (
        <>
            <Navbar />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <Boxes className="opacity-20" disableHover />
            </div>

            <div className="page-wrapper" style={{ position: 'relative', zIndex: 10 }}>
                <div className="container">
                    <div className="page-header">
                        <button className="back-btn" onClick={() => navigate('/admin')}>
                            ← Back to Dashboard
                        </button>
                        <h1 className="page-title">
                            <span className="gradient-text">Faculty Score Editor</span>
                        </h1>
                        <p className="page-subtitle">🔒 Admin Only - Edit Faculty Average Scores (Student scores are read-only)</p>
                    </div>

                    {/* Search and Filter */}
                    <div className="search-filter-container">
                        <div className="search-bar">
                            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    className="clear-search-btn"
                                    onClick={() => setSearchQuery('')}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="filter-buttons">
                            {['All', 'Web Development', 'Web3 & Blockchain', 'IoT Systems', 'Quantum Computing', 'Cyber Security', 'Machine Learning', 'Agentic AI', 'App Development'].map((domain) => (
                                <button
                                    key={domain}
                                    className={`filter-btn ${selectedDomain === domain ? 'active' : ''}`}
                                    onClick={() => setSelectedDomain(domain)}
                                >
                                    {domain}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredTeams.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-xl text-gray-400">No teams found</h3>
                            <p className="text-gray-500">
                                {searchQuery ? `No results for "${searchQuery}"` : 'No teams in this domain'}
                            </p>
                            <button
                                className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedDomain('All');
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        sortedDomains.map(([domain, domainTeams]) => {
                            const isExpanded = expandedDomains[domain];
                            const hasMore = domainTeams.length > TEAMS_PER_PAGE;
                            const displayedTeams = isExpanded ? domainTeams : domainTeams.slice(0, TEAMS_PER_PAGE);
                            const hiddenCount = domainTeams.length - TEAMS_PER_PAGE;

                            return (
                                <div key={domain} className="domain-section">
                                    <div className="domain-header" style={{ borderLeftColor: domainColors[domain] || '#6b7280' }}>
                                        <h2 className="domain-title" style={{ color: domainColors[domain] || '#6b7280' }}>
                                            {domain}
                                        </h2>
                                        <span className="domain-count">
                                            {domainTeams.length} team{domainTeams.length !== 1 ? 's' : ''}
                                            {hasMore && !isExpanded && (
                                                <span className="showing-count"> • Showing {TEAMS_PER_PAGE}</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="scores-table-container">
                                        <table className="scores-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Team Name</th>
                                                    <th>Round 1 Faculty</th>
                                                    <th>Round 2 Faculty</th>
                                                    <th>Round 3 Faculty</th>
                                                    <th>Flash Faculty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayedTeams.map((team) => (
                                                    <tr key={team._id}>
                                                        <td className="team-number">#{team.teamNumber}</td>
                                                        <td className="team-name">{team.teamName}</td>

                                                        {['round1', 'round2', 'round3', 'round4'].map((round) => {
                                                            const currentScore = getCurrentFacultyScore(team, round);
                                                            const maxScore = team.scores?.[round]?.maxScore || 0;
                                                            const hasEdit = editedScores[team._id]?.[round] !== undefined;
                                                            const displayValue = hasEdit ? editedScores[team._id][round] : (currentScore ?? '');

                                                            return (
                                                                <td key={round} className="score-cell">
                                                                    <div className="score-input-group">
                                                                        <input
                                                                            type="number"
                                                                            className="score-input"
                                                                            value={displayValue}
                                                                            onChange={(e) => handleScoreChange(team._id, round, e.target.value)}
                                                                            placeholder={currentScore !== null ? currentScore.toString() : '-'}
                                                                            step="0.01"
                                                                            min="0"
                                                                            max={maxScore}
                                                                        />
                                                                        <span className="max-label">/{maxScore}</span>
                                                                        {hasEdit && (
                                                                            <button
                                                                                className="save-btn"
                                                                                onClick={() => handleSaveScore(team._id, round)}
                                                                                disabled={saving}
                                                                            >
                                                                                ✓
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {hasMore && (
                                        <div className="show-more-container">
                                            <button
                                                className="show-more-btn"
                                                onClick={() => toggleDomainExpansion(domain)}
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <span>Show Less</span>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Show {hiddenCount} More Team{hiddenCount !== 1 ? 's' : ''}</span>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <style>{`
                .page-header {
                    margin-bottom: 32px;
                    text-align: center;
                    position: relative;
                }

                .back-btn {
                    position: absolute;
                    left: 0;
                    top: 0;
                    padding: 8px 16px;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 8px;
                    color: var(--primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                }

                .back-btn:hover {
                    background: rgba(139, 92, 246, 0.2);
                    transform: translateX(-4px);
                }

                .page-title {
                    font-size: 36px;
                    margin-bottom: 8px;
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    font-size: 16px;
                }

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

                .showing-count {
                    color: rgba(167, 139, 250, 0.7);
                    font-size: 13px;
                }

                .scores-table-container {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 24px;
                    overflow-x: auto;
                }

                .scores-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .scores-table thead {
                    border-bottom: 2px solid var(--border-color);
                }

                .scores-table th {
                    padding: 16px;
                    text-align: left;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 12px;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .scores-table td {
                    padding: 16px;
                    border-bottom: 1px solid rgba(139, 92, 246, 0.1);
                }

                .scores-table tbody tr {
                    transition: background 0.2s;
                }

                .scores-table tbody tr:hover {
                    background: rgba(139, 92, 246, 0.05);
                }

                .team-number {
                    font-family: 'Orbitron', sans-serif;
                    color: var(--primary);
                    font-weight: 700;
                }

                .team-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .score-cell {
                    min-width: 150px;
                }

                .score-input-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .score-input {
                    width: 80px;
                    padding: 8px 12px;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 6px;
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    text-align: center;
                    transition: all 0.2s;
                }

                .score-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(139, 92, 246, 0.15);
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
                }

                .score-input::-webkit-outer-spin-button,
                .score-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                .max-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    color: var(--text-muted);
                }

                .save-btn {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    border: none;
                    border-radius: 6px;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .save-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                }

                .save-btn:active {
                    transform: scale(0.95);
                }

                .save-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Search and Filter Styles */
                .search-filter-container {
                    margin-bottom: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .search-bar {
                    position: relative;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(167, 139, 250, 0.6);
                    pointer-events: none;
                    z-index: 1;
                }

                .search-input {
                    width: 100%;
                    padding: 14px 48px 14px 48px;
                    background: rgba(139, 92, 246, 0.08);
                    border: 1.5px solid rgba(139, 92, 246, 0.3);
                    border-radius: 12px;
                    color: var(--text-primary);
                    font-size: 15px;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) inset;
                }

                .search-input::placeholder {
                    color: rgba(167, 139, 250, 0.4);
                }

                .search-input:hover {
                    background: rgba(139, 92, 246, 0.12);
                    border-color: rgba(139, 92, 246, 0.5);
                }

                .search-input:focus {
                    outline: none;
                    background: rgba(139, 92, 246, 0.15);
                    border-color: #8b5cf6;
                    box-shadow: 
                        0 0 0 3px rgba(139, 92, 246, 0.2),
                        0 0 20px rgba(139, 92, 246, 0.3),
                        0 2px 8px rgba(0, 0, 0, 0.2) inset;
                    transform: translateY(-1px);
                }

                .clear-search-btn {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(139, 92, 246, 0.15);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 6px;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: rgba(167, 139, 250, 0.8);
                    font-size: 16px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .clear-search-btn:hover {
                    background: rgba(139, 92, 246, 0.25);
                    border-color: rgba(139, 92, 246, 0.5);
                    color: #a78bfa;
                    transform: translateY(-50%) scale(1.05);
                }

                .filter-buttons {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                    padding: 0 16px;
                }

                .filter-btn {
                    padding: 10px 20px;
                    background: rgba(139, 92, 246, 0.08);
                    border: 1.5px solid rgba(139, 92, 246, 0.25);
                    border-radius: 24px;
                    color: rgba(167, 139, 250, 0.9);
                    font-size: 14px;
                    font-weight: 500;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                }

                .filter-btn:hover {
                    background: rgba(139, 92, 246, 0.15);
                    border-color: rgba(139, 92, 246, 0.4);
                    color: #a78bfa;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
                }

                .filter-btn.active {
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    border-color: rgba(139, 92, 246, 0.6);
                    color: #ffffff;
                    box-shadow: 
                        0 4px 16px rgba(139, 92, 246, 0.4),
                        0 2px 8px rgba(0, 0, 0, 0.2);
                }

                .show-more-container {
                    display: flex;
                    justify-content: center;
                    margin-top: 24px;
                    margin-bottom: 16px;
                }

                .show-more-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: rgba(139, 92, 246, 0.08);
                    border: 1.5px solid rgba(139, 92, 246, 0.25);
                    border-radius: 12px;
                    color: rgba(167, 139, 250, 0.9);
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .show-more-btn:hover {
                    background: rgba(139, 92, 246, 0.15);
                    border-color: rgba(139, 92, 246, 0.4);
                    color: #a78bfa;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
                }

                @media (max-width: 768px) {
                    .scores-table-container {
                        padding: 16px;
                    }

                    .scores-table th,
                    .scores-table td {
                        padding: 12px 8px;
                        font-size: 12px;
                    }

                    .score-input {
                        width: 60px;
                        padding: 6px 8px;
                        font-size: 12px;
                    }

                    .back-btn {
                        position: static;
                        margin-bottom: 16px;
                    }

                    .search-bar {
                        max-width: 100%;
                    }

                    .filter-btn {
                        padding: 8px 16px;
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
};

export default AdminScoreEditor;
