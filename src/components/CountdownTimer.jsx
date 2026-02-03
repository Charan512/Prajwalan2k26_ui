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

  // Format time components
  const getTimeComponents = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return { hours: 0, minutes: 0, seconds: 0 };

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  const padZero = (num) => num.toString().padStart(2, '0');

  // Calculate progress percentage
  const getProgress = () => {
    if (!timerData || !timeLeft) return 0;
    return ((timerData.duration - timeLeft) / timerData.duration) * 100;
  };

  // Status message based on time remaining
  const getStatusMessage = () => {
    if (!timeLeft || timeLeft <= 0) return '🎉 Time\'s Up! Great work everyone! 🎉';

    const hoursRemaining = timeLeft / (1000 * 60 * 60);
    if (hoursRemaining > 22) return 'Prajwalan Ignited! Let the innovation begin!';
    if (hoursRemaining > 18) return 'Great start! Keep brainstorming those ideas!';
    if (hoursRemaining > 12) return 'Keep going! Stay focused and energized!';
    if (hoursRemaining > 6) return 'In the zone! Your project is taking shape!';
    if (hoursRemaining > 3) return 'Sprint mode! Time to polish your work!';
    if (hoursRemaining > 1) return 'Final hours! Get ready to present!';
    if (hoursRemaining > 0.5) return 'Last 30 minutes! Wrap up your code!';
    return '⏰ Final moments! Prepare for submission!';
  };

  if (loading) {
    return null;
  }

  if (!timerData || timeLeft === null || timeLeft <= 0) {
    return null;
  }

  const { hours, minutes, seconds } = getTimeComponents(timeLeft);
  const isLast10Seconds = timeLeft <= 10000 && timeLeft > 0;
  const isLast5Seconds = timeLeft <= 5000 && timeLeft > 0;
  const isComplete = timeLeft <= 0;

  return (
    <div className="countdown-timer-wrapper">
      <div className={`countdown-timer-container ${isComplete ? 'ended' : ''}`}>
        <div className="countdown-timer-label">TIME REMAINING</div>

        <div className="countdown-timer-display">
          <div className="time-block">
            <span className="time-value">{padZero(hours)}</span>
            <span className="time-unit">HOURS</span>
          </div>
          <span className="time-separator">:</span>
          <div className="time-block">
            <span className="time-value">{padZero(minutes)}</span>
            <span className="time-unit">MINUTES</span>
          </div>
          <span className="time-separator">:</span>
          <div className={`time-block ${isLast10Seconds ? (isLast5Seconds ? 'critical-block-red' : 'critical-block') : ''}`}>
            <span
              key={isLast10Seconds ? seconds : 'static'}
              className={`time-value ${isLast10Seconds ? (isLast5Seconds ? 'pop-animate-red' : 'pop-animate') : ''}`}
            >
              {padZero(seconds)}
            </span>
            <span className="time-unit">SECONDS</span>
          </div>
        </div>

        <div className="timer-progress-bar">
          <div
            className="timer-progress-fill"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>

        <div className="timer-status-container">
          <p className="timer-status-message">{getStatusMessage()}</p>
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

        .countdown-timer-container {
          text-align: center;
          padding: 2.5rem 4rem;
          background: ${isDark
          ? 'rgba(5, 5, 16, 0.6)'
          : 'rgba(255, 255, 255, 0.6)'};
          border: 1px solid ${isDark
          ? 'rgba(0, 243, 255, 0.3)'
          : 'rgba(139, 92, 246, 0.3)'};
          border-radius: 24px;
          backdrop-filter: blur(16px);
          box-shadow: ${isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 243, 255, 0.05), 0 0 15px rgba(0, 243, 255, 0.1)'
          : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(139, 92, 246, 0.05), 0 0 15px rgba(139, 92, 246, 0.1)'};
          position: relative;
          overflow: hidden;
        }

        /* Holographic sheen */
        .countdown-timer-container::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg,
            transparent 45%,
            ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(139, 92, 246, 0.03)'} 50%,
            transparent 55%);
          animation: sheen 6s infinite linear;
          pointer-events: none;
        }

        @keyframes sheen {
          0% {
            transform: translate(-30%, -30%) rotate(0deg);
          }
          100% {
            transform: translate(30%, 30%) rotate(0deg);
          }
        }

        .countdown-timer-label {
          font-family: 'Orbitron', monospace;
          font-size: clamp(0.9rem, 1.5vw, 1.2rem);
          color: ${isDark ? '#00f3ff' : '#8b5cf6'};
          letter-spacing: 4px;
          margin-bottom: 1rem;
          text-shadow: ${isDark ? '0 0 8px #00f3ff' : '0 0 8px #8b5cf6'};
        }

        .countdown-timer-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .time-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 2.5rem;
          background: ${isDark
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(139, 92, 246, 0.05)'};
          border-radius: 16px;
          border: 1px solid ${isDark
          ? 'rgba(0, 243, 255, 0.2)'
          : 'rgba(139, 92, 246, 0.2)'};
          min-width: 140px;
          box-shadow: ${isDark
          ? '0 0 15px rgba(0, 243, 255, 0.05)'
          : '0 0 15px rgba(139, 92, 246, 0.05)'};
          position: relative;
        }

        .time-block::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: ${isDark
          ? 'linear-gradient(135deg, #00f3ff, transparent, #a855f7)'
          : 'linear-gradient(135deg, #8b5cf6, transparent, #ec4899)'};
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .time-value {
          font-family: 'Orbitron', monospace;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          color: ${isDark ? '#fff' : '#1e293b'};
          text-shadow: ${isDark
          ? '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 40px #a855f7'
          : '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 40px #ec4899'};
          line-height: 1;
        }

        .time-unit {
          font-size: 0.8rem;
          color: ${isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)'};
          letter-spacing: 2px;
          margin-top: 0.5rem;
          text-shadow: ${isDark ? '0 0 5px #a855f7' : '0 0 5px #8b5cf6'};
        }

        .time-separator {
          font-family: 'Orbitron', monospace;
          font-size: clamp(2rem, 6vw, 4rem);
          color: ${isDark ? '#a855f7' : '#8b5cf6'};
          text-shadow: ${isDark ? '0 0 10px #a855f7' : '0 0 10px #8b5cf6'};
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .timer-progress-bar {
          margin-top: 1.5rem;
          width: 100%;
          height: 6px;
          background: ${isDark
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(139, 92, 246, 0.1)'};
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid ${isDark
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(139, 92, 246, 0.2)'};
        }

        .timer-progress-fill {
          height: 100%;
          background: ${isDark
          ? 'linear-gradient(90deg, #00f3ff, #a855f7, #ec4899)'
          : 'linear-gradient(90deg, #8b5cf6, #a855f7, #ec4899)'};
          border-radius: 3px;
          transition: width 1s linear;
          box-shadow: ${isDark
          ? '0 0 15px #00f3ff'
          : '0 0 15px #8b5cf6'};
        }

        .timer-status-container {
          margin-top: 1rem;
        }

        .timer-status-message {
          font-size: clamp(1rem, 2vw, 1.4rem);
          color: ${isDark ? '#ec4899' : '#db2777'};
          text-shadow: ${isDark ? '0 0 10px #ec4899' : '0 0 10px #db2777'};
          animation: status-pulse 2s ease-in-out infinite;
          margin: 0;
        }

        @keyframes status-pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
        }

        /* Ended state */
        .countdown-timer-container.ended {
          border-color: ${isDark ? '#ec4899' : '#db2777'};
          box-shadow: ${isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 30px rgba(236, 72, 153, 0.2)'
          : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 30px rgba(236, 72, 153, 0.3)'};
        }

        .countdown-timer-container.ended .time-value {
          text-shadow: ${isDark
          ? '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 40px #a855f7'
          : '0 0 10px #db2777, 0 0 20px #db2777, 0 0 40px #8b5cf6'};
        }

        /* Last 10 seconds pop animation */
        .pop-animate {
          display: inline-block;
          color: #ffd700 !important;
          animation: numberPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.4) forwards;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 50px rgba(255, 215, 0, 0.6), 0 0 100px rgba(255, 69, 0, 0.4) !important;
        }

        @keyframes numberPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
            filter: blur(10px);
          }
          40% {
            transform: scale(1.5);
            opacity: 1;
            filter: blur(0);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .critical-block {
          border-color: #ffd700 !important;
          box-shadow: 0 0 40px rgba(255, 215, 0, 0.3) !important;
          animation: blockCriticalPulse 1s ease-in-out infinite alternate;
          background: rgba(255, 215, 0, 0.05) !important;
        }

        .critical-block::after {
          background: linear-gradient(135deg, #ffd700, transparent, #ff4500) !important;
        }

        .critical-block .time-unit {
          color: #ffd700 !important;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        @keyframes blockCriticalPulse {
          0% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.2) !important;
            border-color: rgba(255, 215, 0, 0.5) !important;
            transform: scale(1);
          }
          100% {
            box-shadow: 0 0 60px rgba(255, 215, 0, 0.6) !important;
            border-color: #ffd700 !important;
            transform: scale(1.02);
          }
        }

        /* Last 5 seconds - RED ALERT */
        .pop-animate-red {
          display: inline-block;
          color: #ff0000 !important;
          animation: numberPopRed 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.5) forwards;
          text-shadow: 0 0 25px rgba(255, 0, 0, 0.9), 0 0 60px rgba(255, 0, 0, 0.7), 0 0 120px rgba(255, 69, 0, 0.5) !important;
        }

        @keyframes numberPopRed {
          0% {
            transform: scale(0.4);
            opacity: 0;
            filter: blur(12px);
          }
          45% {
            transform: scale(1.6);
            opacity: 1;
            filter: blur(0);
          }
          75% {
            transform: scale(0.85);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .critical-block-red {
          border-color: #ff0000 !important;
          box-shadow: 0 0 50px rgba(255, 0, 0, 0.5) !important;
          animation: blockRedPulse 0.8s ease-in-out infinite alternate;
          background: rgba(255, 0, 0, 0.08) !important;
        }

        .critical-block-red::after {
          background: linear-gradient(135deg, #ff0000, transparent, #ff4500) !important;
        }

        .critical-block-red .time-unit {
          color: #ff0000 !important;
          text-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
        }

        @keyframes blockRedPulse {
          0% {
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.4) !important;
            border-color: rgba(255, 0, 0, 0.6) !important;
            transform: scale(1);
          }
          100% {
            box-shadow: 0 0 80px rgba(255, 0, 0, 0.8) !important;
            border-color: #ff0000 !important;
            transform: scale(1.03);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .countdown-timer-container {
            padding: 1.5rem;
          }

          .time-block {
            min-width: 80px;
            padding: 0.75rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .time-block {
            min-width: 70px;
            padding: 0.5rem 0.75rem;
          }

          .time-separator {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CountdownTimer;
