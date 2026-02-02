import { useState, useEffect } from 'react';
import { timerAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [timerData, setTimerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();

    // Fetch active timer
    const fetchActiveTimer = async () => {
        try {
            const response = await timerAPI.getActiveTimer();
            if (response.data.data) {
                setTimerData(response.data.data);
                setTimeLeft(response.data.data.remainingTime);
            } else {
                setTimerData(null);
                setTimeLeft(null);
            }
        } catch (error) {
            console.error('Failed to fetch timer:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveTimer();
        // Poll for timer updates every 30 seconds
        const pollInterval = setInterval(fetchActiveTimer, 30000);
        return () => clearInterval(pollInterval);
    }, []);

    // Countdown effect
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1000) {
                    fetchActiveTimer(); // Refresh when timer expires
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    // Format time as HH:MM:SS
    const formatTime = (milliseconds) => {
        if (!milliseconds || milliseconds <= 0) return '00:00:00';

        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const getProgress = () => {
        if (!timerData || !timeLeft) return 0;
        return ((timerData.duration - timeLeft) / timerData.duration) * 100;
    };

    if (loading) {
        return null; // Or a loading skeleton
    }

    if (!timerData || timeLeft === null || timeLeft <= 0) {
        return null; // No active timer
    }

    return (
        <div className="countdown-timer-wrapper">
            <div className="countdown-timer glass-card">
                <div className="timer-header">
                    <div className="timer-icon">🔥</div>
                    <div className="timer-info">
                        <h3 className="timer-title">Hackathon Timer</h3>
                        <p className="timer-message">{timerData.message}</p>
                    </div>
                </div>

                <div className="timer-display">
                    <div className="time-value">{formatTime(timeLeft)}</div>
                    <div className="time-label">Time Remaining</div>
                </div>

                <div className="timer-progress-bar">
                    <div
                        className="timer-progress-fill"
                        style={{ width: `${getProgress()}%` }}
                    ></div>
                </div>

                <div className="timer-stats">
                    <div className="timer-stat">
                        <span className="stat-label">Started</span>
                        <span className="stat-value">
                            {new Date(timerData.startTime).toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="timer-stat">
                        <span className="stat-label">Ends</span>
                        <span className="stat-value">
                            {new Date(timerData.endTime).toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
        .countdown-timer-wrapper {
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

        .countdown-timer {
          padding: 28px;
          background: ${isDark
                    ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)'};
          border: 2px solid ${isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)'};
          box-shadow: ${isDark
                    ? '0 8px 32px rgba(236, 72, 153, 0.2), 0 0 0 1px rgba(236, 72, 153, 0.1) inset'
                    : '0 4px 16px rgba(236, 72, 153, 0.15), 0 0 0 1px rgba(236, 72, 153, 0.05) inset'};
        }

        .timer-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .timer-icon {
          font-size: 36px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        .timer-info {
          flex: 1;
        }

        .timer-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: ${isDark ? '#f472b6' : '#db2777'};
          margin: 0 0 6px 0;
          letter-spacing: 0.5px;
        }

        .timer-message {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .timer-display {
          text-align: center;
          margin: 24px 0;
        }

        .time-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 56px;
          font-weight: 900;
          background: ${isDark
                    ? 'linear-gradient(135deg, #f472b6 0%, #ec4899 50%, #db2777 100%)'
                    : 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 4px;
          text-shadow: ${isDark ? '0 0 30px rgba(236, 72, 153, 0.3)' : 'none'};
        }

        .time-label {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--text-secondary);
          margin-top: 8px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
        }

        .timer-progress-bar {
          height: 8px;
          background: ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'};
          border-radius: 8px;
          overflow: hidden;
          margin: 24px 0;
        }

        .timer-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f472b6 0%, #ec4899 50%, #db2777 100%);
          border-radius: 8px;
          transition: width 1s linear;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }

        .timer-stats {
          display: flex;
          justify-content: space-around;
          gap: 16px;
        }

        .timer-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        .stat-value {
          font-family: 'Orbitron', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .time-value {
            font-size: 42px;
            letter-spacing: 2px;
          }

          .timer-header {
            flex-direction: column;
            text-align: center;
          }

          .timer-stats {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
        </div>
    );
};

export default CountdownTimer;
