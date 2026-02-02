import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if we're not already on the login page
            // This prevents reload when entering wrong credentials
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    getMe: () => api.get('/auth/me')
};

// Admin API
export const adminAPI = {
    getTeams: () => api.get('/admin/teams'),
    getTeam: (teamId) => api.get(`/admin/teams/${teamId}`),
    updateTasks: (teamId, round, tasks) => api.put(`/admin/teams/${teamId}/tasks/${round}`, { tasks }),
    publishTasks: (teamId, round) => api.post(`/admin/teams/${teamId}/publish/${round}`),
    publishAll: (round) => api.post('/admin/publish-all', { round }),
    selectFlashRound: (teamId, maxScore) => api.post(`/admin/teams/${teamId}/flash-round`, { maxScore }),
    removeFlashRound: (teamId) => api.delete(`/admin/teams/${teamId}/flash-round`),
    getLeaderboard: () => api.get('/admin/leaderboard')
};

// Evaluator API
export const evaluatorAPI = {
    getProfile: () => api.get('/evaluator/profile'),
    getTeams: () => api.get('/evaluator/teams'),
    getTeam: (teamId) => api.get(`/evaluator/teams/${teamId}`),
    searchTeam: (teamNumber) => api.get(`/evaluator/search/${teamNumber}`),
    submitScore: (teamId, round, score, feedback) => api.post(`/evaluator/teams/${teamId}/score/${round}`, { score, feedback }),
    getFlashRoundTeams: () => api.get('/evaluator/flash-round-teams')
};

// Team Lead API
export const teamLeadAPI = {
    getDashboard: () => api.get('/teamlead/dashboard'),
    getTasks: () => api.get('/teamlead/tasks')
};

// Timer API
export const timerAPI = {
    getActiveTimer: () => api.get('/timer/active'),
    getTimerHistory: () => api.get('/timer/history')
};

export default api;
