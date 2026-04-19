import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import SeverityBadge from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [user, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📚 Fetching history for user:', user);
      const url = `/history?user_id=${user.id}`;
      console.log('📚 API URL:', url);
      const data = await axiosClient.get(url);
      console.log('✓ History response (after interceptor):', data);
      console.log('✓ Type of response:', typeof data);
      console.log('✓ Is array?', Array.isArray(data));
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ History error:', err);
      setError('Failed to load history. Please try again.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score) => {
    if (score < 30) return 'text-emerald-400 bg-emerald-500/20';
    if (score < 60) return 'text-amber-400 bg-amber-500/20';
    if (score < 80) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const calculateStats = () => {
    if (history.length === 0) {
      return {
        total: 0,
        highestRisk: 0,
        mostCommon: 'N/A',
      };
    }

    const total = history.length;
    const highestRisk = Math.max(...history.map((item) => item.risk_score));
    const severityCounts = history.reduce((acc, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    }, {});
    const mostCommon = Object.entries(severityCounts).sort(([, a], [, b]) => b - a)[0][0];

    return { total, highestRisk, mostCommon };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-violet-500 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-slate-300 text-lg">Loading history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      {/* Background gradient effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white mb-1 sm:mb-2">Analysis History</h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-400">Your past depression severity analyses</p>
          </div>
          <button
            onClick={fetchHistory}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:shadow-violet-500/50 inline-flex items-center justify-center gap-2"
          >
            <span>Refresh</span>
          </button>
        </div>

        {/* Count Badge */}
        <div className="mb-6 sm:mb-8">
          <span className="inline-block px-3 sm:px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 font-semibold rounded-full text-sm">
            {history.length} {history.length === 1 ? 'analysis' : 'analyses'} found
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="backdrop-blur-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 p-6 rounded-lg mb-8">
            <p className="text-red-300 font-semibold">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {history.length === 0 && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-16 text-center">
            <p className="text-slate-300 text-xl mb-6">No analyses yet. Go to the Analyze page to get started.</p>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl hover:shadow-violet-500/50"
            >
              Go to Analyze <span>→</span>
            </Link>
          </div>
        )}

        {/* Stats Cards */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-violet-500/50 rounded-2xl p-4 sm:p-6 transition-all">
              <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-2">Total Analyses</p>
              <p className="text-3xl sm:text-4xl font-bold text-violet-400">{stats.total}</p>
            </div>
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-red-500/50 rounded-2xl p-4 sm:p-6 transition-all">
              <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-2">Highest Risk Score</p>
              <p className="text-3xl sm:text-4xl font-bold text-red-400">{stats.highestRisk.toFixed(1)}%</p>
            </div>
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-orange-500/50 rounded-2xl p-4 sm:p-6 transition-all">
              <p className="text-slate-400 text-xs sm:text-sm font-semibold mb-2">Most Common Severity</p>
              <p className="text-3xl sm:text-4xl font-bold text-orange-400">{stats.mostCommon}</p>
            </div>
          </div>
        )}

        {/* Table */}
        {history.length > 0 && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                {/* Table Header */}
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-700/50">
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-200">#</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-200">Date/Time</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-200">Text</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-200">Severity</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-slate-200">Risk</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-slate-200">Confidence</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {history.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`border-t border-slate-700/30 hover:bg-slate-800/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/20'
                      }`}
                    >
                      {/* Row Number */}
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold text-slate-300">{idx + 1}</td>

                      {/* Date/Time */}
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-slate-400 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>

                      {/* Text Preview */}
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-slate-300 max-w-xs">
                        <div className="group relative cursor-pointer truncate">
                          {item.text.length > 40 ? `${item.text.slice(0, 40)}...` : item.text}
                          {item.text.length > 40 && (
                            <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-slate-800 border border-slate-700 text-slate-300 text-xs p-3 rounded-lg z-20 w-48 sm:w-64 break-words shadow-xl">
                              {item.text}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Severity Badge */}
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                        <SeverityBadge severity={item.severity} />
                      </td>

                      {/* Risk Score */}
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-center">
                        <span className={`inline-block px-2 sm:px-3 py-1 rounded-full font-semibold text-xs ${getRiskScoreColor(item.risk_score)}`}>
                          {item.risk_score.toFixed(0)}%
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-center">
                        <span className="inline-block px-2 sm:px-3 py-1 rounded-full font-semibold text-xs text-violet-400 bg-violet-500/20">
                          {item.confidence_score.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
