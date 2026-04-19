import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-b from-slate-950/80 to-slate-950/40 border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-light tracking-wider text-white">
              Depression Severity Analyzer
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium transition-all duration-300 relative group ${
                  isActive
                    ? 'text-violet-400'
                    : 'text-slate-300 hover:text-slate-100'
                }`
              }
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"></span>
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/analyze"
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium transition-all duration-300 relative group ${
                      isActive
                        ? 'text-violet-400'
                        : 'text-slate-300 hover:text-slate-100'
                    }`
                  }
                >
                  Analyze
                  <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"></span>
                </NavLink>

                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium transition-all duration-300 relative group ${
                      isActive
                        ? 'text-violet-400'
                        : 'text-slate-300 hover:text-slate-100'
                    }`
                  }
                >
                  History
                  <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"></span>
                </NavLink>

                <NavLink
                  to="/support"
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-medium transition-all duration-300 relative group ${
                      isActive
                        ? 'text-violet-400'
                        : 'text-slate-300 hover:text-slate-100'
                    }`
                  }
                >
                  Support
                  <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"></span>
                </NavLink>
              </>
            )}
          </div>

          {/* Auth Buttons / User Info */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-300">
                  Welcome, <span className="text-violet-400 font-medium">{user?.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-violet-400 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all duration-300"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col space-y-1.5 focus:outline-none group"
            aria-label="Toggle menu"
          >
            <div className={`w-6 h-0.5 bg-slate-300 group-hover:bg-violet-400 transition-all duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}></div>
            <div className={`w-6 h-0.5 bg-slate-300 group-hover:bg-violet-400 transition-all duration-300 ${
              isMenuOpen ? 'opacity-0' : ''
            }`}></div>
            <div className={`w-6 h-0.5 bg-slate-300 group-hover:bg-violet-400 transition-all duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}></div>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`
              }
            >
              Home
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/analyze"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`
                  }
                >
                  Analyze
                </NavLink>

                <NavLink
                  to="/history"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`
                  }
                >
                  History
                </NavLink>

                <NavLink
                  to="/support"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`
                  }
                >
                  Support
                </NavLink>
              </>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm font-medium text-slate-300 hover:text-violet-400 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all duration-300 text-center"
                >
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
