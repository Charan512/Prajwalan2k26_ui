import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaGamepad, FaMedal, FaCrown } from 'react-icons/fa';
import Navbar from './Navbar';
import './GameLeaderboard.css';

const GameLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
        // Refresh leaderboard every 30 seconds
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/game/leaderboard`);
            setLeaderboard(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching game leaderboard:', err);
            setError('Failed to load leaderboard');
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <FaCrown className="rank-icon gold" />;
            case 2:
                return <FaMedal className="rank-icon silver" />;
            case 3:
                return <FaMedal className="rank-icon bronze" />;
            default:
                return null;
        }
    };

    const getRankClass = (rank) => {
        if (rank === 1) return 'rank-1';
        if (rank === 2) return 'rank-2';
        if (rank === 3) return 'rank-3';
        return '';
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="page-wrapper">
                    <div className="game-leaderboard-container">
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p className="loading-text">Loading Game Leaderboard...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="page-wrapper">
                    <div className="game-leaderboard-container">
                        <div className="alert alert-error">{error}</div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="page-wrapper">
                <div className="game-leaderboard-container">
                    <div className="leaderboard-header">
                        <FaGamepad className="header-icon" />
                        <h1 className="leaderboard-title gradient-text">Game Leaderboard</h1>
                        <p className="leaderboard-subtitle">Top Teams by DOOM Game Score</p>
                    </div>

                    <div className="leaderboard-content">
                        {leaderboard.length === 0 ? (
                            <div className="no-scores glass-card">
                                <FaTrophy className="no-scores-icon" />
                                <h3>No Scores Yet</h3>
                                <p>Be the first to play and set a high score!</p>
                            </div>
                        ) : (
                            <div className="leaderboard-list">
                                {leaderboard.map((team, index) => (
                                    <div
                                        key={team._id}
                                        className={`leaderboard-item glass-card ${getRankClass(index + 1)}`}
                                    >
                                        <div className="rank-section">
                                            {getRankIcon(index + 1)}
                                            <span className="rank-number">#{index + 1}</span>
                                        </div>

                                        <div className="team-section">
                                            <div className="team-name">{team.teamName}</div>
                                        </div>

                                        <div className="scores-section">
                                            <div className="score-item">
                                                <FaTrophy className="trophy-icon" />
                                                <span className="score-value high-score">{team.highScore}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GameLeaderboard;
