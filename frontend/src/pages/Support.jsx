import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Support() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [videos, setVideos] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);

  const severityQueries = {
    Severe: 'depression recovery help therapy mental health crisis support',
    Moderate: 'stress relief mindfulness meditation breathing exercises',
    Mild: 'motivation mental health journaling habits positivity',
    Minimal: 'positive habits daily routine self improvement happiness',
  };

  const severityColors = {
    Minimal: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300',
    Mild: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300',
    Moderate: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-300',
    Severe: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-300',
  };

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/latest-result');
        const resultSeverity = response.data.severity;
        setSeverity(resultSeverity);
        await fetchVideos(resultSeverity);
      } catch (err) {
        setError(null);
        setSeverity(null);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  const fetchVideos = async (sev) => {
    try {
      setVideoLoading(true);
      const query = severityQueries[sev] || severityQueries.Minimal;
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=6&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos from YouTube');
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const videosList = data.items.map((item) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
        }));
        setVideos(videosList);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Unable to load videos. Please try again.');
      setVideos([]);
    } finally {
      setVideoLoading(false);
    }
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

  if (!severity) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12">
      {/* Background gradient effects */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white">Support Resources</h1>
          <Link
            to="/analyze"
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold rounded-lg transition-all text-center"
          >
            Back to Analyze
          </Link>
        </div>

        {/* Severity Badge */}
        {severity && (
          <div className="mb-6 sm:mb-8">
            <div
              className={`inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-bold bg-gradient-to-br border backdrop-blur-lg ${severityColors[severity]}`}
            >
              Current Severity: {severity}
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-slate-400 text-sm sm:text-base md:text-lg mb-8 sm:mb-12">
          Based on your recent analysis, here are helpful resources and support videos for you.
        </p>

        {/* Error State */}
        {error && (
          <div className="backdrop-blur-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 p-6 rounded-lg mb-8">
            <p className="text-red-300 font-semibold">Unable to load videos. Please try again.</p>
          </div>
        )}

        {/* Video Grid */}
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
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {videos.map((video) => (
              <div
                key={video.videoId}
                className="backdrop-blur-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-violet-500/20"
              >
                <div className="aspect-video bg-slate-900/80">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${video.videoId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-t-2xl"
                  ></iframe>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-200 line-clamp-2 text-sm">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-8 text-center mb-16">
            <p className="text-amber-300 font-semibold text-lg">
              No videos found. Please try again later.
            </p>
          </div>
        )}

        {/* Crisis Resources Section */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-light text-white mb-6 sm:mb-8">Crisis Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all">
              <h3 className="text-base sm:text-lg font-semibold text-red-300 mb-2 sm:mb-3">National Suicide Prevention Lifeline</h3>
              <p className="text-slate-300 mb-2 sm:mb-3 text-sm sm:text-base">
                <a href="tel:988" className="font-bold text-red-400 hover:text-red-300">
                  Call or text 988
                </a>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">Available 24/7 for emotional support</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all">
              <h3 className="text-base sm:text-lg font-semibold text-red-300 mb-2 sm:mb-3">Crisis Text Line</h3>
              <p className="text-slate-300 mb-2 sm:mb-3 text-sm sm:text-base">
                Text <span className="font-bold text-red-400">HOME</span> to <span className="font-bold text-red-400">741741</span>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">Free crisis support via text message</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all">
              <h3 className="text-base sm:text-lg font-semibold text-red-300 mb-2 sm:mb-3">Emergency Services</h3>
              <p className="text-slate-300 mb-2 sm:mb-3 text-sm sm:text-base">
                <a href="tel:911" className="font-bold text-red-400 hover:text-red-300">
                  Call 911
                </a>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">For immediate life-threatening emergencies</p>
            </div>

            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/30 rounded-2xl p-4 sm:p-6 hover:border-red-500/50 transition-all">
              <h3 className="text-base sm:text-lg font-semibold text-red-300 mb-2 sm:mb-3">International Crisis Lines</h3>
              <p className="text-slate-300 mb-2 sm:mb-3 text-sm sm:text-base">
                <a
                  href="https://www.iasp.info/resources/Crisis_Centres/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 font-semibold"
                >
                  Find helplines worldwide
                </a>
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">Global crisis support directory</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="backdrop-blur-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/30 rounded-2xl p-4 sm:p-8">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Important Disclaimer</h3>
          <p className="text-slate-300 leading-relaxed text-xs sm:text-sm md:text-base">
            MindSight is an AI-powered informational tool and is not a substitute for professional
            medical advice, diagnosis, or treatment. Mental health conditions are complex and require
            professional expertise. If you're experiencing suicidal thoughts or severe depression, please
            reach out to a mental health professional or crisis helpline immediately.
          </p>
        </section>
      </div>
    </div>
  );
}
