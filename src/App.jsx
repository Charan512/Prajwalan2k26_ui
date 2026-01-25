import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminTeamDetail from './pages/admin/AdminTeamDetail';
import EvaluatorDashboard from './pages/evaluator/EvaluatorDashboard';
import EvaluatorTeamDetail from './pages/evaluator/EvaluatorTeamDetail';
import FlashRound from './pages/evaluator/FlashRound';
import TeamLeadDashboard from './pages/teamlead/TeamLeadDashboard';

import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--accent-success)',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--accent-error)',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Router>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leaderboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLeaderboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/team/:teamId"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminTeamDetail />
                  </ProtectedRoute>
                }
              />

              {/* Evaluator Routes */}
              <Route
                path="/evaluator"
                element={
                  <ProtectedRoute allowedRoles={['evaluator']}>
                    <EvaluatorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluator/flash-round"
                element={
                  <ProtectedRoute allowedRoles={['evaluator']}>
                    <FlashRound />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluator/team/:teamId"
                element={
                  <ProtectedRoute allowedRoles={['evaluator']}>
                    <EvaluatorTeamDetail />
                  </ProtectedRoute>
                }
              />

              {/* Team Lead Routes */}
              <Route
                path="/team"
                element={
                  <ProtectedRoute allowedRoles={['team_lead']}>
                    <TeamLeadDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
