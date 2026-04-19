import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  const scrollToSection = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      title: 'Advanced Analysis',
      description: 'AI-powered RoBERTa model analyzes emotional patterns and depression indicators',
    },
    {
      title: 'Risk Assessment',
      description: 'Real-time risk scoring and confidence metrics for accurate predictions',
    },
    {
      title: 'Personalized Support',
      description: 'Tailored coping strategies and resources based on severity assessment',
    },
  ];

  const severityLevels = [
    {
      label: 'Minimal',
      description: 'Healthy emotional state with no significant concerns',
      color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
      textColor: 'text-emerald-300',
    },
    {
      label: 'Mild',
      description: 'Occasional low mood or stress patterns detected',
      color: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
      textColor: 'text-amber-300',
    },
    {
      label: 'Moderate',
      description: 'Noticeable symptoms requiring attention',
      color: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
      textColor: 'text-orange-300',
    },
    {
      label: 'Severe',
      description: 'Significant indicators requiring professional intervention',
      color: 'from-red-500/20 to-red-500/5 border-red-500/30',
      textColor: 'text-red-300',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-3 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="max-w-4xl mx-auto text-center z-10 w-full">
          <div className="mb-4 sm:mb-6 animate-fade-in">
            <span className="text-xs sm:text-sm font-semibold text-violet-400 uppercase tracking-widest">
              Mental Health Analysis Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light mb-4 sm:mb-6 leading-tight animate-fade-in animation-delay-100">
            AI-Powered Depression Severity Detection
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-slate-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            Analyze emotional patterns from your text with advanced machine learning. Get personalized insights and support recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto animate-fade-in animation-delay-300">
            {isAuthenticated ? (
              <Link
                to="/analyze"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105"
              >
                Start Analysis
              </Link>
            ) : (
              <Link
                to="/signup"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105"
              >
                Sign Up to Get Started
              </Link>
            )}

            <button
              onClick={scrollToSection}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-slate-500 hover:border-violet-400 text-slate-100 hover:text-white font-semibold rounded-xl transition-all duration-300 hover:bg-slate-800/50"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-12 sm:py-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-2 sm:mb-4">How It Works</h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-400">Three simple steps to understand your mental health</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 hover:border-violet-500/50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 hover:scale-105"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                  {idx + 1}
                </div>

                <h3 className="text-xl font-semibold mb-3 group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>

                {idx < 2 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Severity Levels Section */}
      <section className="relative py-12 sm:py-20 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-2 sm:mb-4">Severity Assessment Levels</h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-400">Understand where you stand on the severity scale</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {severityLevels.map((level, idx) => (
              <div
                key={idx}
                className={`backdrop-blur-lg bg-gradient-to-br ${level.color} border rounded-2xl p-6 hover:scale-105 transition-transform duration-300`}
              >
                <h3 className={`text-2xl font-semibold mb-2 ${level.textColor}`}>{level.label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{level.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-4 text-amber-300">Important Notice</h3>
            <p className="text-slate-300 leading-relaxed">
              This tool is for informational purposes only and is not a substitute for professional mental health diagnosis or treatment. If you or someone you know is experiencing suicidal thoughts or severe depression, please reach out to a mental health professional or crisis helpline immediately.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-8">Ready to Begin?</h2>
          <p className="text-lg text-slate-400 mb-8">Start your analysis and receive personalized support recommendations.</p>
          <Link
            to="/analyze"
            className="inline-block px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105"
          >
            Analyze Now
          </Link>
        </div>
      </section>
    </div>
  );
}
