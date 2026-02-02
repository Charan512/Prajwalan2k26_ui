import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminTeamDetail = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [activeRound, setActiveRound] = useState('round1');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const rounds = [
        { key: 'round1', label: 'Round 1', subtitle: 'Project Explanation', maxScore: 30 },
        { key: 'round2', label: 'Round 2', subtitle: 'Progress Demo', maxScore: 20 },
        { key: 'round3', label: 'Round 3', subtitle: 'Final Presentation', maxScore: 50 },
        { key: 'round4', label: 'Round 4', subtitle: 'Flash Round ⚡', maxScore: 20 }
    ];

    useEffect(() => {
        fetchTeam();
    }, [teamId]);

    useEffect(() => {
        if (team) {
            setTasks(team.tasks?.[activeRound] || []);
        }
    }, [team, activeRound]);

    const fetchTeam = async () => {
        try {
            console.log('Fetching team with ID:', teamId);
            const response = await adminAPI.getTeam(teamId);
            console.log('Team data received:', response.data);
            setTeam(response.data.data);
        } catch (err) {
            console.error('Failed to load team:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);


            const errorMessage = err.response?.data?.message || 'Failed to load team';
            const statusCode = err.response?.status;

            if (statusCode === 404) {
                toast.error('Team not found. It may have been deleted.');
            } else if (statusCode === 401) {
                toast.error('Unauthorized. Please log in again.');
            } else if (!err.response) {
                toast.error('Cannot connect to server. Please check if the backend is running.');
            } else {
                toast.error(errorMessage);
            }

            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const addTask = () => {
        setTasks([...tasks, { title: '', description: '', visible: false }]);
    };

    const updateTask = (index, field, value) => {
        const newTasks = [...tasks];
        newTasks[index][field] = value;
        setTasks(newTasks);
    };

    const removeTask = (index) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const saveTasks = async () => {
        setSaving(true);
        try {
            await adminAPI.updateTasks(teamId, activeRound, tasks);
            setMessage({ type: 'success', text: 'Tasks saved successfully!' });
            fetchTeam();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save tasks' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const publishTasks = async () => {
        setSaving(true);
        try {
            await adminAPI.publishTasks(teamId, activeRound);
            setMessage({ type: 'success', text: 'Tasks published! Team can now see them.' });
            fetchTeam();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to publish tasks' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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

    const currentRound = rounds.find(r => r.key === activeRound);
    const roundScore = team?.scores?.[activeRound];

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="container">
                    <button className="btn btn-secondary back-btn" onClick={() => navigate('/admin')}>
                        ← Back to Teams
                    </button>

                    <div className="team-header glass-card slide-up">
                        <div className="team-header-left">
                            <span className="team-number-large">#{team?.teamNumber}</span>
                            <div>
                                <h1 className="team-name-large">{team?.teamName}</h1>
                                {team?.isFlashRoundSelected && <span className="flash-badge">⚡ FLASH ROUND SELECTED</span>}
                            </div>
                        </div>
                        <div className="team-score-large">
                            <span className="score-value">{team?.totalScore}</span>
                            <span className="score-label">/ 100</span>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>{message.text}</div>
                    )}

                    <div className="tabs">
                        {rounds.map((round) => (
                            <button
                                key={round.key}
                                className={`tab ${activeRound === round.key ? 'active' : ''}`}
                                onClick={() => setActiveRound(round.key)}
                                disabled={round.key === 'round4' && !team?.isFlashRoundSelected}
                            >
                                {round.label}
                            </button>
                        ))}
                    </div>

                    <div className="round-header">
                        <div>
                            <h2 className="round-title">{currentRound.subtitle}</h2>
                            <p className="round-description">Assign tasks for {currentRound.label}</p>
                        </div>
                        <div className="round-score-display">
                            <span className={`score-badge ${activeRound}`}>
                                Score: {roundScore?.score ?? '-'} / {currentRound.maxScore}
                            </span>
                        </div>
                    </div>

                    <div className="tasks-list">
                        {tasks.map((task, index) => (
                            <div key={index} className="task-card fade-in">
                                <div className="task-header">
                                    <span className="task-index">Task {index + 1}</span>
                                    <div className="task-actions">
                                        <label className="visibility-toggle">
                                            <input
                                                type="checkbox"
                                                checked={task.visible}
                                                onChange={(e) => updateTask(index, 'visible', e.target.checked)}
                                            />
                                            <span>{task.visible ? 'Visible' : 'Hidden'}</span>
                                        </label>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => removeTask(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Task Title"
                                        value={task.title}
                                        onChange={(e) => updateTask(index, 'title', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <textarea
                                        className="input-field textarea"
                                        placeholder="Task Description"
                                        value={task.description}
                                        onChange={(e) => updateTask(index, 'description', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}

                        <button className="btn btn-secondary add-task-btn" onClick={addTask}>
                            + Add Task
                        </button>
                    </div>

                    <div className="actions-footer glass-card">
                        <button
                            className="btn btn-primary"
                            onClick={saveTasks}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Tasks'}
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={publishTasks}
                            disabled={saving || tasks.length === 0}
                        >
                            Publish to Team
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        .back-btn {
          margin-bottom: 24px;
        }

        .team-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          margin-bottom: 24px;
        }

        .team-header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .team-number-large {
          font-family: 'Orbitron', sans-serif;
          font-size: 48px;
          font-weight: 900;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .team-name-large {
          font-size: 24px;
          margin-bottom: 4px;
        }

        .team-score-large {
          text-align: right;
        }

        .score-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 48px;
          font-weight: 900;
          color: var(--success);
        }

        .score-label {
          font-size: 24px;
          color: var(--text-muted);
        }

        .round-description {
          color: var(--text-muted);
          margin-top: 4px;
        }

        .tasks-list {
          margin-bottom: 24px;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .task-index {
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .task-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .visibility-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .visibility-toggle input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .textarea {
          resize: vertical;
          min-height: 80px;
        }

        .add-task-btn {
          width: 100%;
          padding: 16px;
          border-style: dashed;
        }

        .actions-footer {
          display: flex;
          gap: 16px;
          padding: 20px 24px;
          position: sticky;
          bottom: 20px;
        }

        .tab:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
        </>
    );
};

export default AdminTeamDetail;
