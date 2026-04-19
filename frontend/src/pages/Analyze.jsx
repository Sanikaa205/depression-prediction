import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import SeverityBadge from '../components/SeverityBadge';
import RiskMeter from '../components/RiskMeter';
import SuicidalAlert from '../components/SuicidalAlert';
import { useAuth } from '../context/AuthContext';

export default function Analyze() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const wordCount = text.trim().split(/\s+/).filter((word) => word.length > 0).length;

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (text.trim().length < 10) {
      setError('Please enter at least 10 characters of text for analysis.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await axiosClient.post('/analyze', { 
        text,
        user_id: user?.id
      });
      setResult(response);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Server error. Ensure the backend is running.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      {/* Background gradient effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 min-h-screen py-8 sm:py-12">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white mb-2 sm:mb-3">Analyze Your Text</h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-400">
            Share your thoughts and let our AI analyze your emotional state
          </p>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleAnalyze} className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl hover:border-violet-500/30 transition-all duration-300">
          <label htmlFor="text-input" className="block text-lg font-semibold text-white mb-4">
            Enter Your Text
          </label>

          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text to analyze emotional and depression indicators..."
            rows={8}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Word Count */}
          <div className="mt-4 text-right">
            <span className="text-sm text-slate-400">
              Word count: <span className="text-violet-400 font-semibold">{wordCount}</span>
            </span>
          </div>

          {/* Analyze Button */}
          <button
            type="submit"
            disabled={isLoading || text.trim().length < 10}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/50 disabled:shadow-none inline-flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <span>Analyze</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="backdrop-blur-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 p-6 rounded-lg mb-8 animate-fade-in">
            <p className="text-red-300 font-semibold">Error</p>
            <p className="text-red-200 mt-2">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Severity Badge Card */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-semibold text-white mb-6">Analysis Results</h2>
              <SeverityBadge severity={result.severity} />
            </div>

            {/* Risk Meter Card */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-semibold text-white mb-8">Assessment Scores</h2>
              <RiskMeter riskScore={result.risk_score} confidenceScore={result.confidence_score} />
            </div>

            {/* Suicidal Alert Card */}
            {result.suicidal_risk && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                <SuicidalAlert show={result.suicidal_risk} />
              </div>
            )}

            {/* Coping Suggestions Card */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-6">Coping Suggestions</h3>
              <ul className="space-y-4">
                {result.coping_suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-full flex items-center justify-center text-violet-300 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <p className="text-slate-200 text-base leading-relaxed pt-1">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Resources Button */}
            <Link
              to="/support"
              className="block backdrop-blur-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 hover:border-violet-400/50 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300"
            >
              <p className="text-slate-300 mb-4">Need more resources and support?</p>
              <button className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2">
                Visit Support Page <span>→</span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
