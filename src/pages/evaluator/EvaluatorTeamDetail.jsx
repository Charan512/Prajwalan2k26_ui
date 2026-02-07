import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { evaluatorAPI } from '../../services/api';
import HoloBackground from '../../components/HoloBackground';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const EvaluatorTeamDetail = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const [team, setTeam] = useState(null);
    const [activeRound, setActiveRound] = useState('round1');
    const [score, setScore] = useState('');
    const [parameters, setParameters] = useState({});
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const rounds = [
        {
            key: 'round1',
            label: 'ROUND 1',
            subtitle: 'Project Explanation',
            maxScore: 30,
            parameters: [
                { name: 'Idea', max: 7 },
                { name: 'Product Potential', max: 7 },
                { name: 'Innovation', max: 6 },
                { name: 'Social Significance', max: 5 },
                { name: 'Sustainability', max: 5 }
            ]
        },
        {
            key: 'round2',
            label: 'ROUND 2',
            subtitle: 'Progress Demo',
            maxScore: 25,
            parameters: [
                { name: 'Implementation', max: 7 },
                { name: 'Task Completion', max: 6 },
                { name: 'Presentation', max: 5 },
                { name: 'Tech Stack', max: 5 },
                { name: 'Team Work', max: 2 }
            ]
        },
        {
            key: 'round3',
            label: 'ROUND 3',
            subtitle: 'Final Presentation',
            maxScore: 45,
            parameters: [
                { name: 'Amount of Completion', max: 10 },
                { name: 'Presentation', max: 5 },
                { name: 'Working', max: 10 },
                { name: 'Tasks', max: 10 },
                { name: 'UI/UX', max: 5 },
                { name: 'Future Scope', max: 5 }
            ]
        },
        {
            key: 'round4',
            label: 'FLASH ROUND',
            subtitle: '⚡ The Summit',
            maxScore: 10,
            parameters: [] // No parameters, single score
        }
    ];

    useEffect(() => {
        fetchTeam();
    }, [teamId]);

    useEffect(() => {
        if (team) {
            const roundScore = team.scores?.[activeRound];
            const currentRound = rounds.find(r => r.key === activeRound);

            // Check if current evaluator has already submitted
            const userEvaluation = roundScore?.evaluations?.find(
                e => e.evaluatorId === user?._id
            );

            if (userEvaluation) {
                setHasSubmitted(true);
                setScore(userEvaluation.score || '');
                setFeedback(userEvaluation.feedback || '');

                // Load parameter values if they exist
                if (userEvaluation.parameters && currentRound?.parameters?.length > 0) {
                    const paramObj = {};
                    currentRound.parameters.forEach(param => {
                        paramObj[param.name] = userEvaluation.parameters[param.name] || 0;
                    });
                    setParameters(paramObj);
                } else {
                    setParameters({});
                }
            } else {
                setHasSubmitted(false);
                setScore('');
                setFeedback('');

                // Initialize parameters to 0
                if (currentRound?.parameters?.length > 0) {
                    const paramObj = {};
                    currentRound.parameters.forEach(param => {
                        paramObj[param.name] = 0;
                    });
                    setParameters(paramObj);
                } else {
                    setParameters({});
                }
            }
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

    // Calculate total score from parameters
    const calculateTotalScore = () => {
        const currentRound = rounds.find(r => r.key === activeRound);

        if (currentRound.parameters.length === 0) {
            // Flash Round - use direct score input
            return parseInt(score) || 0;
        }

        // Sum all parameter values
        return Object.values(parameters).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    };

    // Handle parameter slider change
    const handleParameterChange = (paramName, value) => {
        setParameters(prev => ({
            ...prev,
            [paramName]: parseInt(value) || 0
        }));
    };

    // Show confirmation dialog
    const handleSubmitClick = () => {
        const currentRound = rounds.find(r => r.key === activeRound);
        const totalScore = calculateTotalScore();

        // Validation
        if (currentRound.parameters.length === 0 && score === '') {
            setMessage({ type: 'error', text: 'Please enter a score' });
            return;
        }

        if (totalScore < 0 || totalScore > currentRound.maxScore) {
            setMessage({ type: 'error', text: `Total score must be between 0 and ${currentRound.maxScore}` });
            return;
        }

        setShowConfirmDialog(true);
    };

    // Actual submission after confirmation
    const submitScore = async () => {
        setShowConfirmDialog(false);
        const currentRound = rounds.find(r => r.key === activeRound);
        const totalScore = calculateTotalScore();

        setSubmitting(true);
        try {
            await evaluatorAPI.submitScore(teamId, activeRound, totalScore, feedback, parameters);
            setMessage({ type: 'success', text: 'Score submitted successfully!' });
            setHasSubmitted(true);
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
                        {/* Left: Evaluation Parameters with Sliders */}
                        <div className="console-panel tasks-view">
                            <div className="panel-header">
                                <h3>EVALUATION PARAMETERS</h3>
                                <span className="panel-status">ACTIVE</span>
                            </div>

                            <div className="tasks-scroll">
                                {currentRound.parameters.length === 0 ? (
                                    <div className="placeholder-message">
                                        NO PARAMETER-BASED EVALUATION
                                        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--text-muted)' }}>
                                            Flash Round uses direct score input
                                        </p>
                                    </div>
                                ) : (
                                    currentRound.parameters.map((param, idx) => (
                                        <div key={idx} className="parameter-item-left">
                                            <div className="param-header-left">
                                                <span className="param-number">{idx + 1}</span>
                                                <div className="param-info">
                                                    <span className="param-name-left">{param.name}</span>
                                                    <span className="param-score-left">{parameters[param.name] || 0}/{param.max}</span>
                                                </div>
                                            </div>
                                            <div className="slider-container">
                                                <input
                                                    type="range"
                                                    className="param-slider-left"
                                                    min="0"
                                                    max={param.max}
                                                    value={parameters[param.name] || 0}
                                                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                                                    disabled={hasSubmitted}
                                                />
                                                <div className="slider-scale">
                                                    <span>0</span>
                                                    <span>{Math.floor(param.max / 2)}</span>
                                                    <span>{param.max}</span>
                                                </div>
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
                                {hasSubmitted && <span className="panel-status success">SUBMITTED</span>}
                            </div>

                            {/* Total Score Display */}
                            <div className="input-zone">
                                <label className="zone-label">
                                    {currentRound.parameters.length > 0 ? 'TOTAL SCORE' : 'SCORE INPUT'}
                                </label>
                                <div className="digital-input-container digital-input-large">
                                    <input
                                        type="number"
                                        className="digital-score-input digital-score-large"
                                        value={currentRound.parameters.length > 0 ? calculateTotalScore() : score}
                                        onChange={currentRound.parameters.length === 0 ? (e) => setScore(e.target.value) : undefined}
                                        min="0"
                                        max={currentRound.maxScore}
                                        placeholder="00"
                                        readOnly={currentRound.parameters.length > 0}
                                        disabled={currentRound.parameters.length > 0 || hasSubmitted}
                                    />
                                    <div className="max-indicator max-indicator-large">
                                        <span>MAX</span>
                                        <span>{currentRound.maxScore}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tasks Reference Section */}
                            <div className="tasks-reference-section">
                                <label className="zone-label">ASSIGNED TASKS REFERENCE</label>
                                <div className="tasks-reference-container">
                                    {roundTasks.length === 0 ? (
                                        <div className="no-tasks-message">
                                            <span className="no-tasks-icon">📋</span>
                                            <p>No tasks assigned for this round</p>
                                        </div>
                                    ) : (
                                        <div className="tasks-list">
                                            {roundTasks.map((task, idx) => (
                                                <div key={idx} className="task-reference-item">
                                                    <div className="task-ref-header">
                                                        <span className="task-ref-number">{idx + 1}</span>
                                                        <span className="task-ref-title">{task.title}</span>
                                                    </div>
                                                    {task.description && (
                                                        <p className="task-ref-description">{task.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                    maxLength={500}
                                    disabled={hasSubmitted}
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
                                onClick={handleSubmitClick}
                                disabled={submitting || hasSubmitted}
                            >
                                {submitting ? 'PROCESSING...' : hasSubmitted ? 'ALREADY SUBMITTED' : 'SUBMIT EVALUATION'}
                            </button>
                        </div>
                    </div>

                    {/* Confirmation Dialog */}
                    {showConfirmDialog && (
                        <div className="confirm-overlay">
                            <div className="confirm-dialog">
                                <div className="confirm-header">
                                    <h3>⚠️ CONFIRM SUBMISSION</h3>
                                </div>
                                <div className="confirm-body">
                                    <p>You are about to submit your evaluation for <strong>{currentRound.label}</strong>.</p>
                                    <div className="confirm-score">
                                        <span>Total Score:</span>
                                        <span className="score-highlight">{calculateTotalScore()}/{currentRound.maxScore}</span>
                                    </div>
                                    <p className="confirm-warning">⚠️ Once submitted, you cannot change your scores. Please review carefully.</p>
                                </div>
                                <div className="confirm-actions">
                                    <button
                                        className="tech-btn secondary"
                                        onClick={() => setShowConfirmDialog(false)}
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        className="tech-btn primary"
                                        onClick={submitScore}
                                    >
                                        CONFIRM SUBMIT
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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

                /* Larger Digital Input Variant */
                .digital-input-large {
                    padding: 16px;
                    border: 2px solid var(--border-color);
                    background: rgba(139, 92, 246, 0.05);
                }

                .digital-score-large {
                    font-size: 64px;
                    font-weight: 700;
                    letter-spacing: 2px;
                }

                .max-indicator-large {
                    padding: 0 24px;
                    font-size: 14px;
                }

                .max-indicator-large span:last-child {
                    font-size: 20px;
                    color: var(--primary);
                    font-weight: 700;
                }

                /* Tasks Reference Section */
                .tasks-reference-section {
                    margin: 24px 0;
                }

                .tasks-reference-container {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 16px;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .tasks-reference-container::-webkit-scrollbar {
                    width: 6px;
                }

                .tasks-reference-container::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                    border-radius: 3px;
                }

                .tasks-reference-container::-webkit-scrollbar-thumb {
                    background: var(--primary);
                    border-radius: 3px;
                }

                .no-tasks-message {
                    text-align: center;
                    padding: 32px 16px;
                    color: var(--text-muted);
                }

                .no-tasks-icon {
                    font-size: 32px;
                    display: block;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .no-tasks-message p {
                    margin: 0;
                    font-size: 13px;
                    font-family: 'JetBrains Mono', monospace;
                }

                .tasks-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .task-reference-item {
                    background: rgba(139, 92, 246, 0.05);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 6px;
                    padding: 12px;
                    transition: all 0.2s;
                }

                .task-reference-item:hover {
                    border-color: rgba(139, 92, 246, 0.4);
                    background: rgba(139, 92, 246, 0.08);
                }

                .task-ref-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .task-ref-number {
                    width: 24px;
                    height: 24px;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 11px;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .task-ref-title {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    color: var(--text-primary);
                    font-weight: 600;
                    flex: 1;
                }

                .task-ref-description {
                    margin: 0;
                    padding-left: 34px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    font-family: 'JetBrains Mono', monospace;
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

                /* Parameter Sliders */
                .parameters-section {
                    margin-bottom: 24px;
                }

                .parameter-item {
                    margin-bottom: 20px;
                    padding: 16px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }

                .param-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .param-name {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    color: var(--text-primary);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .param-score {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 16px;
                    color: var(--primary);
                    font-weight: 700;
                }

                /* Left Panel Parameter Sliders with Scale */
                .parameter-item-left {
                    margin-bottom: 24px;
                    padding: 16px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }

                .parameter-item-left:hover {
                    border-color: rgba(139, 92, 246, 0.5);
                    background: rgba(139, 92, 246, 0.05);
                }

                .param-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .param-number {
                    width: 28px;
                    height: 28px;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 13px;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .param-info {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .param-name-left {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 13px;
                    color: var(--text-primary);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .param-score-left {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    color: var(--primary);
                    font-weight: 700;
                }

                .slider-container {
                    margin-top: 8px;
                }

                .param-slider-left {
                    width: 100%;
                    height: 10px;
                    -webkit-appearance: none;
                    appearance: none;
                    background: linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
                    border-radius: 5px;
                    outline: none;
                    cursor: pointer;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                }

                .param-slider-left::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.6), 0 2px 4px rgba(0,0,0,0.3);
                    transition: all 0.2s;
                    border: 2px solid rgba(255,255,255,0.3);
                }

                .param-slider-left::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.9), 0 4px 8px rgba(0,0,0,0.4);
                }

                .param-slider-left::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid rgba(255,255,255,0.3);
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.6), 0 2px 4px rgba(0,0,0,0.3);
                    transition: all 0.2s;
                }

                .param-slider-left::-moz-range-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.9), 0 4px 8px rgba(0,0,0,0.4);
                }

                .param-slider-left:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: rgba(100,100,100,0.2);
                }

                .param-slider-left:disabled::-webkit-slider-thumb {
                    cursor: not-allowed;
                    background: #6b7280;
                    box-shadow: none;
                }

                .param-slider-left:disabled::-moz-range-thumb {
                    cursor: not-allowed;
                    background: #6b7280;
                    box-shadow: none;
                }

                .slider-scale {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 6px;
                    padding: 0 2px;
                }

                .slider-scale span {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .slider-scale span:nth-child(2) {
                    color: rgba(139, 92, 246, 0.7);
                }

                .slider-scale span:last-child {
                    color: var(--primary);
                }


                .param-slider {
                    width: 100%;
                    height: 8px;
                    -webkit-appearance: none;
                    appearance: none;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    outline: none;
                    cursor: pointer;
                }

                .param-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: var(--primary);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
                    transition: all 0.2s;
                }

                .param-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.8);
                }

                .param-slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    background: var(--primary);
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
                    transition: all 0.2s;
                }

                .param-slider::-moz-range-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 15px rgba(139, 92, 246, 0.8);
                }

                .param-slider:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .param-slider:disabled::-webkit-slider-thumb {
                    cursor: not-allowed;
                    background: #6b7280;
                }

                .param-slider:disabled::-moz-range-thumb {
                    cursor: not-allowed;
                    background: #6b7280;
                }

                /* Disabled input styling */
                .digital-score-input:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    background: rgba(0,0,0,0.3);
                }

                .tech-textarea:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    background: rgba(0,0,0,0.3);
                }

                /* Confirmation Dialog */
                .confirm-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .confirm-dialog {
                    background: ${isDark ? 'rgba(15, 17, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)'};
                    border: 2px solid var(--primary);
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.3);
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .confirm-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--border-color);
                    background: rgba(139, 92, 246, 0.1);
                }

                .confirm-header h3 {
                    margin: 0;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    color: var(--text-primary);
                    letter-spacing: 1px;
                }

                .confirm-body {
                    padding: 24px;
                }

                .confirm-body p {
                    margin: 0 0 16px 0;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                .confirm-score {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: rgba(139, 92, 246, 0.1);
                    border-radius: 8px;
                    margin: 16px 0;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                }

                .score-highlight {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--primary);
                }

                .confirm-warning {
                    font-size: 13px;
                    color: #fbbf24;
                    background: rgba(251, 191, 36, 0.1);
                    padding: 12px;
                    border-radius: 6px;
                    border-left: 3px solid #fbbf24;
                }

                .confirm-actions {
                    display: flex;
                    gap: 12px;
                    padding: 20px 24px;
                    border-top: 1px solid var(--border-color);
                }

                .confirm-actions .tech-btn {
                    flex: 1;
                    height: 48px;
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
                    .confirm-dialog {
                        width: 95%;
                        max-width: none;
                    }
                }
            `}</style>
        </>
    );
};

export default EvaluatorTeamDetail;
