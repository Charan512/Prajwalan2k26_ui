import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Boxes } from '../../components/ui/background-boxes';

const AdminDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [expandedDomains, setExpandedDomains] = useState({});
  const navigate = useNavigate();

  const TEAMS_PER_PAGE = 6; // Show 6 teams initially

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

  const handleTeamClick = (teamId) => {
    navigate(`/admin/team/${teamId}`);
  };

  const toggleDomainExpansion = (domain) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domain]: !prev[domain]
    }));
  };


  if (loading) {
    return (
      <>
        <Navbar />
        {/* Background Layer */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <Boxes />
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

  return (
    <>
      <Navbar />
      {/* Background Layer - Fixed to viewport */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <Boxes className="opacity-20" />
      </div>

      <div className="page-wrapper" style={{ position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">
              <span className="gradient-text">Admin Dashboard</span>
            </h1>
            <p className="page-subtitle">Manage {teams.length} Teams • Assign Tasks • View Scores</p>
          </div>

          {/* Search and Filter Section */}
          <div className="search-filter-container">
            {/* Search Bar */}
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

            {/* Domain Filter Buttons */}
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

          {teams.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl text-gray-400">No teams found.</h3>
              <p className="text-gray-500">Run the seeder or add teams manually.</p>
            </div>
          ) : (
            (() => {
              // Filter teams based on search query and selected domain
              const filteredTeams = teams.filter(team => {
                // Search filter
                const matchesSearch = searchQuery === '' ||
                  team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  team.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  team.leadEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (team.domain && team.domain.toLowerCase().includes(searchQuery.toLowerCase()));

                // Domain filter
                const matchesDomain = selectedDomain === 'All' || team.domain === selectedDomain;

                return matchesSearch && matchesDomain;
              });

              // Show message if no teams match filters
              if (filteredTeams.length === 0) {
                return (
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
                );
              }

              // Group filtered teams by domain
              const teamsByDomain = filteredTeams.reduce((acc, team) => {
                const domain = team.domain || 'Uncategorized';
                if (!acc[domain]) acc[domain] = [];
                acc[domain].push(team);
                return acc;
              }, {});

              // Define domain colors for visual distinction
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

              // Sort domains alphabetically
              const sortedDomains = Object.entries(teamsByDomain).sort((a, b) =>
                a[0].localeCompare(b[0])
              );

              return sortedDomains.map(([domain, domainTeams]) => {
                const isExpanded = expandedDomains[domain];
                const hasMore = domainTeams.length > TEAMS_PER_PAGE;
                const displayedTeams = isExpanded ? domainTeams : domainTeams.slice(0, TEAMS_PER_PAGE);
                const hiddenCount = domainTeams.length - TEAMS_PER_PAGE;

                return (
                  <div key={domain} className="domain-section fade-in">
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

                    <div className="cards-grid">
                      {displayedTeams.map((team, index) => (
                        <div
                          key={team._id}
                          className="glass-card team-card fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                          onClick={() => handleTeamClick(team._id)}
                        >
                          <div className="team-card-header">
                            <span className="team-number">#{team.teamNumber}</span>
                            {team.isFlashRoundSelected && (
                              <span className="flash-badge">⚡ FLASH</span>
                            )}
                          </div>

                          <h3 className="team-name">{team.teamName}</h3>

                          <div className="scores-row">
                            <span className="score-badge round1">
                              R1: {team.scores?.round1?.score ?? '-'}/{team.scores?.round1?.maxScore}
                            </span>
                            <span className="score-badge round2">
                              R2: {team.scores?.round2?.score ?? '-'}/{team.scores?.round2?.maxScore}
                            </span>
                            <span className="score-badge round3">
                              R3: {team.scores?.round3?.score ?? '-'}/{team.scores?.round3?.maxScore}
                            </span>
                          </div>

                          <div className="team-card-footer">
                            <span className="score-badge total">
                              Total: {team.totalScore}/100
                            </span>
                          </div>
                        </div>
                      ))}
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
              });
            })()
          )}
        </div>
      </div>

      <style>{`
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

        .page-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .page-title {
          font-size: 36px;
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
        }

        .scores-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 16px 0;
        }

        .team-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 11px;
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

        .clear-search-btn:active {
          transform: translateY(-50%) scale(0.95);
          background: rgba(139, 92, 246, 0.3);
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
          position: relative;
          overflow: hidden;
        }

        .filter-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s ease;
        }

        .filter-btn:hover::before {
          left: 100%;
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
            0 2px 8px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(167, 139, 250, 0.2) inset;
        }

        .filter-btn.active:hover {
          background: linear-gradient(135deg, #9d6fff 0%, #8b5cf6 100%);
          transform: translateY(-2px);
          box-shadow: 
            0 6px 20px rgba(139, 92, 246, 0.5),
            0 4px 12px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(167, 139, 250, 0.3) inset;
        }

        .filter-btn:active {
          transform: translateY(0);
        }

        /* Show More/Less Button */
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
          letter-spacing: 0.3px;
        }

        .show-more-btn svg {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .show-more-btn:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
          color: #a78bfa;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        .show-more-btn:hover svg {
          transform: translateY(2px);
        }

        .show-more-btn:active {
          transform: translateY(0);
          background: rgba(139, 92, 246, 0.2);
        }

        .showing-count {
          color: rgba(167, 139, 250, 0.7);
          font-size: 13px;
          font-weight: 500;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .search-bar {
            max-width: 100%;
          }

          .filter-buttons {
            padding: 0 8px;
          }

          .filter-btn {
            padding: 8px 16px;
            font-size: 13px;
          }

          .search-input {
            padding: 12px 40px 12px 40px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminDashboard;
