import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  FiVideo,
  FiBookmark,
  FiSearch,
  FiFilter,
  FiPlay,
  FiUser,
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiCalendar,
  FiHeart,
  FiStar,
  FiChevronRight,
  FiMessageCircle,
  FiAlertTriangle,
  FiGlobe,
} from 'react-icons/fi';

export default function Support() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [videos, setVideos] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [bookmarkedVideos, setBookmarkedVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const videoCategories = {
    all: { label: 'All Videos', icon: FiVideo },
    therapy: { label: 'Therapy & Counseling', icon: FiUser },
    meditation: { label: 'Meditation & Mindfulness', icon: FiActivity },
    coping: { label: 'Coping Strategies', icon: FiAward },
    motivation: { label: 'Motivation & Positivity', icon: FiTrendingUp },
    habits: { label: 'Daily Habits', icon: FiCalendar },
  };

  const severityQueries = {
    Severe: {
      therapy: 'depression recovery therapy mental health crisis intervention counseling',
      meditation: 'guided meditation anxiety relief panic attacks breathing exercises',
      coping: 'crisis coping strategies depression help DBT cognitive behavioral therapy',
      motivation: 'suicide prevention mental health awareness hope recovery stories',
      habits: 'daily routine mental health exercise sleep depression recovery habits',
    },
    Moderate: {
      therapy: 'depression therapy counseling mental health support sessions',
      meditation: 'mindfulness meditation stress relief breathing techniques',
      coping: 'coping strategies stress management anxiety relief techniques',
      motivation: 'self improvement motivation mental health motivation videos',
      habits: 'healthy daily habits routine building productivity mental wellness',
    },
    Mild: {
      therapy: 'mental health awareness therapy benefits counseling',
      meditation: 'relaxation meditation stress relief mindfulness practice',
      coping: 'stress management techniques healthy coping mechanisms',
      motivation: 'motivation self improvement personal growth positivity',
      habits: 'daily routine habits productivity wellness lifestyle',
    },
    Minimal: {
      therapy: 'mental health wellness coaching personal development',
      meditation: 'relaxation techniques meditation for beginners wellness',
      coping: 'healthy habits stress management wellness techniques',
      motivation: 'motivation inspiration positive thinking self help',
      habits: 'healthy lifestyle habits productivity routine building',
    },
  };

  const severityColors = {
    Minimal: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300',
    Mild: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300',
    Moderate: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-300',
    Severe: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-300',
  };

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('supportBookmarks');
    if (saved) {
      try {
        setBookmarkedVideos(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading bookmarks:', e);
      }
    }
  }, []);

  // Fetch latest analysis
  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        setLoading(true);
        console.log('Support.jsx: Fetching latest analysis from /latest-result...');
        const response = await axiosClient.get('/latest-result');
        console.log('Support.jsx: Successfully received analysis:', response);
        setAnalysis(response);
        await fetchAllCategoryVideos(response.severity);
      } catch (err) {
        console.error('Support.jsx: Error fetching latest analysis:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url,
        });
        // 404 means no analysis found - that's OK, just show the "go analyze" message
        if (err.response?.status === 404) {
          console.info('Support.jsx: No analysis found in database (404) - user needs to analyze text first');
        }
        setError(null);
        setAnalysis(null);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  // Fetch videos for all categories
  const fetchAllCategoryVideos = async (severity) => {
    try {
      setVideoLoading(true);
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      
      if (!apiKey || apiKey === 'your_youtube_api_key_here') {
        console.warn('Support.jsx: YouTube API key not configured');
        setError('YouTube API key not configured. Please set VITE_YOUTUBE_API_KEY in .env file.');
        setVideos({});
        return;
      }
      
      const categoryQueries = severityQueries[severity] || severityQueries.Minimal;
      
      const allVideos = {};
      
      for (const [category, query] of Object.entries(categoryQueries)) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=8&key=${apiKey}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
              allVideos[category] = data.items.map((item) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.medium.url,
                category: category,
              }));
            }
          } else {
            const errorData = await response.json();
            console.error(`YouTube API error for ${category}:`, errorData);
            if (errorData.error?.message) {
              setError(`YouTube API Error: ${errorData.error.message}`);
            }
          }
        } catch (err) {
          console.error(`Error fetching ${category} videos:`, err);
        }
      }
      
      setVideos(allVideos);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Unable to load videos. Please try again.');
      setVideos([]);
    } finally {
      setVideoLoading(false);
    }
  };

  const toggleBookmark = (video) => {
    setBookmarkedVideos((prev) => {
      const isBookmarked = prev.some((v) => v.videoId === video.videoId);
      let updated;
      if (isBookmarked) {
        updated = prev.filter((v) => v.videoId !== video.videoId);
      } else {
        updated = [...prev, video];
      }
      localStorage.setItem('supportBookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (videoId) => bookmarkedVideos.some((v) => v.videoId === videoId);

  const getFilteredVideos = () => {
    let filtered = [];
    
    if (selectedCategory === 'all') {
      Object.values(videos).forEach((categoryVideos) => {
        filtered = [...filtered, ...categoryVideos];
      });
    } else if (videos[selectedCategory]) {
      filtered = videos[selectedCategory];
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
              <p className="text-slate-300 text-lg">Loading resources...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/30 rounded-2xl p-12 text-center">
            <p className="text-slate-300 font-semibold text-lg mb-8">
              No analysis found. Please analyze text first.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl hover:shadow-violet-500/50"
            >
              Go to Analyze <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredVideos = getFilteredVideos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      {/* Background gradient effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white flex items-center gap-3">
            <FiHeart className="w-10 h-10 text-violet-400" />
            Support Resources
          </h1>
          <Link
            to="/analyze"
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-2"
          >
            <FiVideo className="w-5 h-5" />
            New Analysis
          </Link>
        </div>

        {/* Analysis Summary Card */}
        {analysis && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Severity Badge */}
              <div className="flex flex-col items-start">
                <p className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                  Severity Level
                </p>
                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm sm:text-base font-bold bg-gradient-to-br border backdrop-blur-lg ${severityColors[analysis.severity]}`}
                >
                  {analysis.severity}
                </div>
              </div>

              {/* Risk Score */}
              <div className="flex flex-col items-start">
                <p className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4" />
                  Risk Score
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-violet-400">
                    {analysis.risk_score.toFixed(1)}
                  </span>
                  <span className="text-slate-400 text-sm">/100</span>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="flex flex-col items-start">
                <p className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                  <FiAward className="w-4 h-4" />
                  Confidence
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                    {analysis.confidence_score.toFixed(1)}
                  </span>
                  <span className="text-slate-400 text-sm">/100</span>
                </div>
              </div>

              {/* Analysis Date */}
              <div className="flex flex-col items-start">
                <p className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  Analysis Date
                </p>
                <p className="text-slate-200 text-sm">{formatDate(analysis.created_at)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Coping Suggestions Section */}
        {analysis && analysis.coping_suggestions && analysis.coping_suggestions.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-6 flex items-center gap-3">
              <FiHeart className="w-8 h-8 text-red-400" />
              Personalized Suggestions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {analysis.coping_suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/30 rounded-xl p-4 sm:p-6 hover:border-violet-500/50 transition-all"
                >
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-6 flex items-center gap-3">
            <FiVideo className="w-8 h-8 text-violet-400" />
            Recommended Videos
          </h2>

          {/* Error Display */}
          {error && (
            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <FiAlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-red-300 font-semibold mb-2">
                    {error.includes('YouTube API') ? 'YouTube API Configuration Needed' : 'Error Loading Videos'}
                  </h3>
                  <p className="text-slate-300 text-sm mb-3">{error}</p>
                  {error.includes('not configured') && (
                    <p className="text-slate-400 text-xs">
                      To enable YouTube video recommendations:
                      <ol className="mt-2 ml-4 list-decimal space-y-1">
                        <li>Get a free YouTube API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Google Cloud Console</a></li>
                        <li>Enable YouTube Data API v3</li>
                        <li>Create an API key and add it to <code className="bg-slate-800 px-2 py-1 rounded text-xs">.env</code> file</li>
                      </ol>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 sm:pr-6 py-3 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
            {Object.entries(videoCategories).map(([key, { label, icon: IconComponent }]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                  selectedCategory === key
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/50'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-200 hover:border-violet-500/50'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>

          {/* Bookmarked Videos Section */}
          {bookmarkedVideos.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FiBookmark className="w-5 h-5 text-amber-400" />
                Saved Videos ({bookmarkedVideos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {bookmarkedVideos.map((video) => (
                  <div
                    key={video.videoId}
                    className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-amber-500/30 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all shadow-lg"
                  >
                    <div className="relative aspect-video bg-slate-900/80">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => toggleBookmark(video)}
                        className="absolute top-2 right-2 p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-all shadow-lg"
                        title="Remove from saved"
                      >
                        <FiBookmark className="w-5 h-5" fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-200 line-clamp-2 text-sm mb-2">
                        {video.title}
                      </h3>
                      <p className="text-slate-400 text-xs mb-3">{video.channelTitle}</p>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full text-center px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded transition-all flex items-center justify-center gap-2"
                      >
                        <FiPlay className="w-4 h-4" />
                        Watch Now
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {videoLoading ? (
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
                <p className="text-slate-300 text-lg">Loading resources...</p>
              </div>
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16">
              {filteredVideos.map((video) => (
                <div
                  key={video.videoId}
                  className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-violet-500/20 group"
                >
                  <div className="relative aspect-video bg-slate-900/80">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <button
                      onClick={() => toggleBookmark(video)}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all shadow-lg ${
                        isBookmarked(video.videoId)
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                      }`}
                      title={isBookmarked(video.videoId) ? 'Remove from saved' : 'Save video'}
                    >
                      <FiBookmark className="w-5 h-5" fill={isBookmarked(video.videoId) ? 'currentColor' : 'none'} />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <a
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                      >
                        <FiPlay className="w-5 h-5" fill="currentColor" />
                        Watch
                      </a>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-200 line-clamp-2 text-sm mb-2">
                      {video.title}
                    </h3>
                    <p className="text-slate-400 text-xs mb-3">{video.channelTitle}</p>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-3">{video.description}</p>
                    <span className="inline-block px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded font-medium flex items-center gap-1">
                      {videoCategories[video.category]?.label || video.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-8 text-center mb-16">
              <p className="text-amber-300 font-semibold text-lg">
                {searchQuery
                  ? 'No videos found matching your search. Try different keywords.'
                  : 'No videos found. Please try again later.'}
              </p>
            </div>
          )}
        </div>

        {/* Crisis Resources Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-6 sm:mb-8 flex items-center gap-3">
            <FiHeart className="w-8 h-8 text-red-400" />
            Crisis Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <FiHeart className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
                <h3 className="text-base sm:text-lg font-semibold text-red-300">National Suicide Prevention Lifeline</h3>
              </div>
              <p className="text-slate-300 mb-2 sm:mb-3 text-sm sm:text-base">
                <a href="tel:988" className="font-bold text-red-400 hover:text-red-300">
                  Call or text 988
                </a>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">Available 24/7 for emotional support</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <FiMessageCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
                <h3 className="text-base sm:text-lg font-semibold text-red-300">Crisis Text Line</h3>
              </div>
              <p className="text-slate-300 mb-2 sm:mb-3 text-sm sm:text-base">
                Text <span className="font-bold text-red-400">HOME</span> to <span className="font-bold text-red-400">741741</span>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">Free crisis support via text message</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <FiAlertTriangle className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
                <h3 className="text-base sm:text-lg font-semibold text-red-300">Emergency Services</h3>
              </div>
              <p className="text-slate-300 mb-2 sm:mb-3 text-sm sm:text-base">
                <a href="tel:911" className="font-bold text-red-400 hover:text-red-300">
                  Call 911
                </a>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">For immediate life-threatening emergencies</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <FiGlobe className="w-6 h-6 text-red-300 flex-shrink-0 mt-1" />
                <h3 className="text-base sm:text-lg font-semibold text-red-300">International Crisis Lines</h3>
              </div>
              <p className="text-slate-300 mb-2 sm:mb-3 text-sm sm:text-base">
                <a
                  href="https://www.iasp.info/resources/Crisis_Centres/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-2"
                >
                  Find helplines worldwide
                  <FiChevronRight className="w-4 h-4" />
                </a>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">Global crisis support directory</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="backdrop-blur-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/30 rounded-2xl p-4 sm:p-8">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Important Disclaimer</h3>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm md:text-base">
                MindSight is an AI-powered informational tool and is not a substitute for professional
                medical advice, diagnosis, or treatment. Mental health conditions are complex and require
                professional expertise. If you're experiencing suicidal thoughts or severe depression, please
                reach out to a mental health professional or crisis helpline immediately.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
