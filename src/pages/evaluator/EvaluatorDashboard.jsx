import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { evaluatorAPI } from '../../services/api';
import HoloBackground from '../../components/HoloBackground';
import { useTheme } from '../../context/ThemeContext';

const EvaluatorDashboard = () => {
    const [teams, setTeams] = useState([]);
    const [evaluatorProfile, setEvaluatorProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isDark } = useTheme();

    useEffect(() => {
        fetchProfile();
        fetchTeams();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await evaluatorAPI.getProfile();
            setEvaluatorProfile(response.data.data);
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await evaluatorAPI.getTeams();
            setTeams(response.data.data);
        } catch (err) {
            setError('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    // Filter teams based on search query
    const filteredTeams = teams.filter(team => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        return (
            team.teamName?.toLowerCase().includes(query) ||
            team.teamNumber?.toString().includes(query) ||
            (team.domain && team.domain.toLowerCase().includes(query))
        );
    });

    const handleTeamClick = (teamId) => {
        navigate(`/evaluator/team/${teamId}`);
    };

    if (loading) {
        return (
            <>
                <HoloBackground />
                <Navbar />
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <HoloBackground />
            <Navbar />
            <div className="page-wrapper dashboard-container">
                <div className="container">
                    {/* Header Section */}
                    <div className="page-header slide-up">
                        <div className="header-content">
                            <h1 className="page-title">
                                HELLO, <span className="highlight-text">{evaluatorProfile?.name?.split(' ')[0] || 'EVALUATOR'}</span>
                            </h1>
                            <p className="page-subtitle">SECURE CONSOLE • {evaluatorProfile?.role === 'student' ? 'STUDENT' : 'FACULTY'} EVALUATOR</p>
                        </div>

                        {evaluatorProfile?.domain && (
                            <div className="domain-card glass-panel">
                                <span className="domain-label">ASSIGNED DOMAIN</span>
                                <span className="domain-value">{evaluatorProfile.domain}</span>
                                <div className="status-dot"></div>
                            </div>
                        )}
                    </div>

                    {/* Search Section */}
                    <div className="search-section glass-panel slide-up delay-1">
                        <div className="search-form">
                            <div className="search-input-group">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="tech-input"
                                    placeholder="SEARCH TEAM NAME OR ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {searchQuery && (
                                <button
                                    className="tech-btn secondary"
                                    onClick={() => setSearchQuery('')}
                                >
                                    CLEAR
                                </button>
                            )}
                        </div>
                    </div>

                    {error && <div className="alert alert-error slide-up">{error}</div>}

                    {/* Teams Grid View */}
                    <div className="teams-section slide-up delay-2">
                        <div className="section-header">
                            <h2>
                                {searchQuery ? 'SEARCH RESULTS' : (evaluatorProfile?.domain ? `YOUR TEAMS` : 'ALL TEAMS')}
                            </h2>
                            <span className="count-badge">{filteredTeams.length} DETECTED</span>
                        </div>

                        {filteredTeams.length === 0 ? (
                            <div className="no-results glass-panel">
                                <div className="no-results-content">
                                    <span className="no-results-icon">🔍</span>
                                    <p>NO TEAMS FOUND MATCHING "{searchQuery}"</p>
                                </div>
                            </div>
                        ) : (
                            <div className="tech-grid">
                                {filteredTeams.map((team, index) => (
                                    <div
                                        key={team._id}
                                        className="tech-card fade-in"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                        onClick={() => handleTeamClick(team._id)}
                                    >
                                        <div className="card-top">
                                            <span className="team-id">#{team.teamNumber}</span>
                                            {team.isFlashRoundSelected && <span className="flash-icon">⚡</span>}
                                        </div>

                                        <h3 className="card-title">{team.teamName}</h3>

                                        <div className="progress-track">
                                            <div className={`progress-step ${team.scores?.round1?.finalScore ? 'completed' : ''}`}>R1: {team.scores?.round1?.finalScore ?? '-'}</div>
                                            <div className="progress-divide"></div>
                                            <div className={`progress-step ${team.scores?.round2?.finalScore ? 'completed' : ''}`}>R2: {team.scores?.round2?.finalScore ?? '-'}</div>
                                            <div className="progress-divide"></div>
                                            <div className={`progress-step ${team.scores?.round3?.finalScore ? 'completed' : ''}`}>R3: {team.scores?.round3?.finalScore ?? '-'}</div>
                                        </div>

                                        <div className="card-footer">
                                            <span className="total-score">TOT: {team.totalScore}</span>
                                            <span className="access-arrow">→</span>
                                        </div>

                                        <div className="card-corner"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                /* Professional VR Theme CSS - Mobile Optimized */
                
                .dashboard-container {
                    padding-top: 80px;
                    padding-bottom: 40px;
                    min-height: 100vh;
                }

                .slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
                .delay-1 { animation-delay: 0.1s; }
                .delay-2 { animation-delay: 0.2s; }

                @keyframes slideUp {
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Typography & Headers */
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 20px;
                }

                .page-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 28px; 
                    font-weight: 700;
                    letter-spacing: 1px;
                    margin: 0;
                    line-height: 1.2;
                }

                .highlight-text {
                    color: var(--primary);
                }

                .page-subtitle {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    color: var(--text-secondary);
                    letter-spacing: 1px;
                    margin-top: 8px;
                    text-transform: uppercase;
                }

                /* Domain Card */
                .domain-card {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    padding: 10px 16px;
                    position: relative;
                }

                .domain-label {
                    font-size: 9px;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                }

                .domain-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--primary);
                    font-family: 'Orbitron', sans-serif;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                    position: absolute;
                    top: 10px;
                    right: 8px;
                    box-shadow: 0 0 6px #10b981;
                }

                /* Glass Panels - Increased Opacity for Visibility */
                .glass-panel {
                    background: ${isDark ? 'rgba(11, 13, 22, 0.92)' : 'rgba(255, 255, 255, 0.95)'};
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'};
                    border-radius: 8px;
                    box-shadow: 0 4px 20px -1px rgba(0, 0, 0, 0.2);
                }

                /* Search Bar */
                .search-section {
                    padding: 16px;
                    margin-bottom: 24px;
                }

                .search-form {
                    display: flex;
                    gap: 8px; /* Tighter gap for mobile */
                }

                .search-input-group {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--border-color);
                    padding: 0 12px;
                    border-radius: 4px;
                    height: 48px; /* Touch friendly height */
                }
                
                .tech-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    padding: 0 8px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 16px; /* Larger font for mobile inputs prevents zoom */
                    outline: none;
                    width: 100%;
                }

                /* Tech Buttons */
                .tech-btn {
                    height: 48px; /* Touch friendly */
                    border: none;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .tech-btn.primary {
                    background: var(--primary);
                    color: white;
                    padding: 0 20px;
                }
                
                .tech-btn.secondary {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    min-width: 48px; /* Square button for clear/back */
                    padding: 0;
                }

                /* Search Result Panel */
                .search-result-panel {
                    padding: 20px;
                    margin-bottom: 32px;
                }

                .panel-header {
                    margin-bottom: 20px;
                }

                .team-identity {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .id-badge {
                    font-size: 42px;
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 900;
                    color: transparent;
                    -webkit-text-stroke: 1px var(--text-primary);
                    opacity: 0.5;
                }

                .team-info h2 {
                    font-size: 20px;
                    margin: 0 0 6px 0;
                    word-break: break-word; /* Prevent overflow */
                }

                .tech-badge {
                    font-size: 9px;
                    padding: 2px 6px;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid var(--primary);
                    color: var(--primary);
                    text-transform: uppercase;
                    margin-right: 6px;
                    display: inline-block;
                    margin-bottom: 4px;
                }

                .full-width {
                    width: 100%;
                    margin-bottom: 24px;
                }
                .mt-4 { margin-top: 16px; }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1px;
                    background: var(--border-color);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .stat-box {
                    background: ${isDark ? 'rgba(7, 8, 12, 0.6)' : 'rgba(255, 255, 255, 0.6)'};
                    padding: 12px 4px;
                    text-align: center;
                }

                .stat-box label {
                    display: block;
                    font-size: 9px;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }

                .stat-value {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                }

                /* Teams Grid */
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .section-header h2 {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-secondary);
                }

                .count-badge {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: var(--primary);
                }

                .tech-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Good for mobile */
                    gap: 16px;
                }

                /* Tech Card - Improved Visibility */
                .tech-card {
                    background: ${isDark ? '#0f111a' : '#ffffff'}; /* Solid color fallback */
                    background: ${isDark ? 'rgba(15, 17, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)'}; /* Near opaque */
                    border: 1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 0, 0, 0.15)'}; /* Purple tint border */
                    padding: 16px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3); /* Stronger shadow */
                }

                .tech-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.4);
                    background: ${isDark ? '#161924' : '#f8fafc'};
                }
                
                .tech-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 3px;
                    height: 100%;
                    background: var(--primary);
                    transform: scaleY(0);
                    transition: transform 0.3s ease;
                }

                .tech-card:hover::before {
                    transform: scaleY(1);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .team-id {
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    color: var(--text-muted);
                    font-size: 12px;
                }

                .card-title {
                    font-size: 16px;
                    margin: 0 0 12px 0;
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .progress-track {
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9px;
                    color: var(--text-muted);
                    background: rgba(0,0,0,0.1);
                    padding: 8px;
                    border-radius: 4px;
                }
                
                .progress-step {
                    flex: 1;
                    text-align: center;
                }
                
                .progress-divide {
                    width: 1px;
                    height: 12px;
                    background: var(--border-color);
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 11px;
                }

                .total-score {
                    color: var(--primary);
                    font-weight: 700;
                }

                .access-arrow {
                    color: var(--primary);
                }

                /* Mobile Breakpoints */
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .header-content {
                        width: 100%;
                    }

                    .domain-card {
                        width: 100%;
                        align-items: flex-start;
                        border-top: 1px solid var(--border-color);
                        padding-top: 16px;
                    }

                    .tech-grid {
                        grid-template-columns: 1fr; /* Single column on mobile proper */
                    }
                    
                    .search-btn {
                       font-size: 0; /* Hide text on small screens, show icon only? No space */
                    }
                     
                    /* Restore search button text size on larger mobiles */
                    .search-btn {
                         font-size: 12px; 
                    }
                }

                .no-results {
                    padding: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px dashed var(--border-color);
                    border-radius: 8px;
                    margin-top: 24px;
                }

                .no-results-content {
                    text-align: center;
                    color: var(--text-muted);
                }

                .no-results-icon {
                    font-size: 32px;
                    display: block;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .progress-step.completed {
                    color: var(--primary);
                    font-weight: 700;
                    text-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
                }
            `}</style>
        </>
    );
};

export default EvaluatorDashboard;
