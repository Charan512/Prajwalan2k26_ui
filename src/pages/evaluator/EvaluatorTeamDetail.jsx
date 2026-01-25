import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { evaluatorAPI } from '../../services/api';
import HoloBackground from '../../components/HoloBackground';
import { useTheme } from '../../context/ThemeContext';

const EvaluatorTeamDetail = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [team, setTeam] = useState(null);
    const [activeRound, setActiveRound] = useState('round1');
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const rounds = [
        { key: 'round1', label: 'ROUND 1', subtitle: 'Project Explanation', maxScore: 30 },
        { key: 'round2', label: 'ROUND 2', subtitle: 'Progress Demo', maxScore: 20 },
        { key: 'round3', label: 'ROUND 3', subtitle: 'Final Presentation', maxScore: 50 },
        { key: 'round4', label: 'FLASH ROUND', subtitle: '⚡ Algorithmic Challenge', maxScore: 20 }
    ];

    useEffect(() => {
        fetchTeam();
    }, [teamId]);

    useEffect(() => {
        if (team) {
            const roundScore = team.scores?.[activeRound];
            setScore(roundScore?.score ?? '');
            setFeedback(roundScore?.feedback || '');
        }
    }, [team, activeRound]);

    const fetchTeam = async () => {
        try {
            const response = await evaluatorAPI.getTeam(teamId);
            setTeam(response.data.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load team' });
        } finally {
            setLoading(false);
        }
    };

    const submitScore = async () => {
        if (score === '') {
            setMessage({ type: 'error', text: 'Please enter a score' });
            return;
        }

        const currentRound = rounds.find(r => r.key === activeRound);
        const numScore = parseInt(score);

        if (numScore < 0 || numScore > currentRound.maxScore) {
            setMessage({ type: 'error', text: `Score must be between 0 and ${currentRound.maxScore}` });
            return;
        }

        setSubmitting(true);
        try {
            await evaluatorAPI.submitScore(teamId, activeRound, numScore, feedback);
            setMessage({ type: 'success', text: 'Score submitted successfully!' });
            fetchTeam();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit score' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
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

    const currentRound = rounds.find(r => r.key === activeRound);
    const roundScore = team?.scores?.[activeRound];
    const roundTasks = team?.tasks?.[activeRound] || [];

    return (
        <>
            <HoloBackground />
            <Navbar />
            <div className="page-wrapper detail-container">
                <div className="container">
                    <button className="tech-btn secondary back-btn" onClick={() => navigate('/evaluator')}>
                        &lt; RETURN TO CONSOLE
                    </button>

                    {/* Tech Header */}
                    <div className="header-panel slide-up">
                        <div className="header-identity">
                            <span className="id-marker">#{team?.teamNumber}</span>
                            <div className="title-group">
                                <h1 className="tech-title">{team?.teamName}</h1>
                                {team?.isFlashRoundSelected && <span className="flash-indicator">FLASH QUALIFIED</span>}
                                {team?.domain && <span className="domain-indicator">{team.domain}</span>}
                            </div>
                        </div>
                        <div className="score-readout">
                            <span className="readout-label">CUMULATIVE SCORE</span>
                            <div className="readout-value">{team?.totalScore}<span className="unit">/100</span></div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>{message.text}</div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="tech-tabs slide-up delay-1">
                        {rounds.map((round) => (
                            <button
                                key={round.key}
                                className={`tech-tab ${activeRound === round.key ? 'active' : ''}`}
                                onClick={() => setActiveRound(round.key)}
                                disabled={round.key === 'round4' && !team?.isFlashRoundSelected}
                            >
                                <span className="tab-label">{round.label}</span>
                                <span className="tab-sub">{round.subtitle}</span>
                                {activeRound === round.key && <div className="active-line"></div>}
                            </button>
                        ))}
                    </div>

                    <div className="evaluation-console slide-up delay-2">
                        {/* Left: Tasks Data Feed */}
                        <div className="console-panel tasks-view">
                            <div className="panel-header">
                                <h3>MISSION PARAMETERS</h3>
                                <span className="panel-status">ONLINE</span>
                            </div>

                            <div className="tasks-scroll">
                                {roundTasks.length === 0 ? (
                                    <div className="placeholder-message">
                                        NO MISSION PARAMETERS ASSIGNED
                                    </div>
                                ) : (
                                    roundTasks.map((task, idx) => (
                                        <div key={idx} className="task-entry">
                                            <div className="entry-marker">{idx + 1}</div>
                                            <div className="entry-content">
                                                <h4>{task.title}</h4>
                                                <p>{task.description}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right: Evaluation Input */}
                        <div className="console-panel grading-view">
                            <div className="panel-header">
                                <h3>PERFORMANCE ASSESSMENT</h3>
                                {roundScore?.evaluatedAt && <span className="panel-status success">EVALUATED</span>}
                            </div>

                            <div className="input-zone">
                                <label className="zone-label">SCORE INPUT</label>
                                <div className="digital-input-container">
                                    <input
                                        type="number"
                                        className="digital-score-input"
                                        value={score}
                                        onChange={(e) => setScore(e.target.value)}
                                        min="0"
                                        max={currentRound.maxScore}
                                        placeholder="00"
                                    />
                                    <div className="max-indicator">
                                        <span>MAX</span>
                                        <span>{currentRound.maxScore}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="input-zone">
                                <label className="zone-label">TECHNICAL FEEDBACK</label>
                                <textarea
                                    className="tech-textarea"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="ENTER EVALUATION OBSERVATIONS..."
                                    rows={4}
                                />
                            </div>

                            {roundScore?.evaluatedAt && (
                                <div className="audit-log">
                                    <div className="log-entry">
                                        <span className="log-label">LAST UPDATE:</span>
                                        <span className="log-value">{new Date(roundScore.evaluatedAt).toLocaleString()}</span>
                                    </div>
                                    {roundScore.evaluatorName && (
                                        <div className="log-entry">
                                            <span className="log-label">OFFICER:</span>
                                            <span className="log-value">{roundScore.evaluatorName}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                className="tech-btn primary execute-btn"
                                onClick={submitScore}
                                disabled={submitting}
                            >
                                {submitting ? 'PROCESSING...' : 'SUBMIT EVALUATION'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Tech Detail Styles */
                
                .detail-container {
                    padding-top: 80px;
                    min-height: 100vh;
                }

                .slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
                .delay-1 { animation-delay: 0.1s; }
                .delay-2 { animation-delay: 0.2s; }

                @keyframes slideUp {
                    to { opacity: 1; transform: translateY(0); }
                }

                .header-panel {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px;
                    background: ${isDark ? 'rgba(15, 17, 26, 0.96)' : 'rgba(255, 255, 255, 0.96)'};
                    border: 1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
                    margin: 24px 0;
                    position: relative;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    backdrop-filter: blur(12px);
                }
                .header-panel::after {
                    content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--primary);
                }

                .header-identity {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .id-marker {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 56px;
                    font-weight: 900;
                    color: rgba(139, 92, 246, 0.2);
                    -webkit-text-stroke: 1px var(--primary);
                }

                .title-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .tech-title {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .flash-indicator {
                    color: #fbbf24;
                    font-size: 10px;
                    letter-spacing: 2px;
                    font-weight: 700;
                }
                
                .domain-indicator {
                    color: var(--primary);
                    font-size: 10px;
                    letter-spacing: 2px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .score-readout {
                    text-align: right;
                    background: rgba(0,0,0,0.2);
                    padding: 16px 24px;
                    border-radius: 4px;
                }

                .readout-label {
                    display: block;
                    font-size: 10px;
                    color: var(--text-muted);
                    letter-spacing: 2px;
                    margin-bottom: 4px;
                }

                .readout-value {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 42px;
                    font-weight: 700;
                    color: var(--primary);
                    line-height: 1;
                }

                .unit {
                    font-size: 16px;
                    color: var(--text-muted);
                    margin-left: 4px;
                }

                /* Tech Tabs */
                .tech-tabs {
                    display: flex;
                    gap: 2px;
                    margin-bottom: 24px;
                    background: rgba(0,0,0,0.2);
                    padding: 4px;
                    border-radius: 4px;
                }

                .tech-tab {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 16px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    opacity: 0.6;
                }

                .tech-tab:hover {
                    background: rgba(255,255,255,0.05);
                    opacity: 0.8;
                }

                .tech-tab.active {
                    opacity: 1;
                    background: rgba(255,255,255,0.05);
                }

                .tech-tab:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .tab-label {
                    font-family: 'Orbitron', sans-serif;
                    font-weight: 700;
                    font-size: 14px;
                    color: var(--text-primary);
                }

                .tab-sub {
                    font-size: 10px;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                }

                .active-line {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: var(--primary);
                    box-shadow: 0 0 10px var(--primary);
                }

                /* Console Grid */
                .evaluation-console {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .console-panel {
                    background: ${isDark ? 'rgba(15, 17, 26, 0.96)' : 'rgba(255, 255, 255, 0.96)'};
                    border: 1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    backdrop-filter: blur(12px);
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--border-color);
                    background: rgba(0,0,0,0.1);
                }

                .panel-header h3 {
                    margin: 0;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 14px;
                    letter-spacing: 1px;
                    color: var(--text-secondary);
                }

                .panel-status {
                    font-size: 10px;
                    color: #10b981;
                    letter-spacing: 1px;
                }
                .panel-status.success {
                    background: rgba(16, 185, 129, 0.1);
                    padding: 2px 6px;
                    border-radius: 2px;
                }

                .tasks-scroll {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }

                .placeholder-message {
                    text-align: center;
                    color: var(--text-muted);
                    margin-top: 40px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                }

                .task-entry {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                    padding-bottom: 24px;
                    border-bottom: 1px dashed var(--border-color);
                }
                
                .task-entry:last-child {
                    border-bottom: none;
                }

                .entry-marker {
                    width: 24px;
                    height: 24px;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    border-radius: 2px;
                }

                .grading-view {
                    padding: 24px;
                    gap: 24px;
                }

                .input-zone {
                    margin-bottom: 8px;
                }

                .zone-label {
                    display: block;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                }

                .digital-input-container {
                    display: flex;
                    align-items: center;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    padding: 8px;
                }

                .digital-score-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    text-align: center;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 48px;
                    color: var(--primary);
                    outline: none;
                    -moz-appearance: textfield;
                }
                .digital-score-input::-webkit-outer-spin-button,
                .digital-score-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                .max-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0 16px;
                    border-left: 1px solid var(--border-color);
                    color: var(--text-muted);
                    font-size: 12px;
                    font-family: 'Orbitron', sans-serif;
                }

                .tech-textarea {
                    width: 100%;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--border-color);
                    padding: 16px;
                    color: var(--text-primary);
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    resize: vertical;
                    min-height: 100px;
                    outline: none;
                }
                .tech-textarea:focus {
                    border-color: var(--primary);
                }

                .audit-log {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: var(--text-muted);
                    background: rgba(255,255,255,0.02);
                    padding: 12px;
                    border-radius: 4px;
                }
                
                .log-entry {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }

                .execute-btn {
                    width: 100%;
                    margin-top: auto;
                    height: 56px;
                    font-size: 14px;
                    letter-spacing: 2px;
                }
                
                /* Tech Buttons */
                .tech-btn {
                    padding: 0 24px;
                    height: 48px;
                    border: none;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    border-radius: 2px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .tech-btn.primary {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
                }

                .tech-btn.primary:hover {
                    box-shadow: 0 0 25px rgba(139, 92, 246, 0.5);
                    transform: translateY(-1px);
                }
                
                .tech-btn.primary:disabled {
                    background: #4b5563;
                    box-shadow: none;
                    cursor: not-allowed;
                    transform: none;
                }

                .tech-btn.secondary {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-muted);
                    height: 36px;
                    padding: 0 16px;
                }

                .tech-btn.secondary:hover {
                    border-color: var(--text-primary);
                    color: var(--text-primary);
                }

                @media (max-width: 768px) {
                    .evaluation-console {
                        grid-template-columns: 1fr;
                    }
                    .header-panel {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 24px;
                    }
                    .score-readout {
                        width: 100%;
                        text-align: left;
                    }
                }
            `}</style>
        </>
    );
};

export default EvaluatorTeamDetail;
