import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sprout, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User as UserIcon, 
  LineChart, 
  Sliders, 
  Layers, 
  Clock, 
  Database, 
  Info,
  ChevronRight
} from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Predict', path: '/predict' },
    { name: 'Optimize', path: '/optimize' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Crops', path: '/crops' },
    { name: 'History', path: '/history' },
    { name: 'Data and Model', path: '/data-model' },
    { name: 'About', path: '/about' },
  ];

  const firstName = user?.full_name ? user.full_name.trim().split(' ')[0] : 'User';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-warm-white/90 backdrop-blur-md transition-colors dark:border-stone-800/80 dark:bg-walnut-dark/90">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded-lg p-1"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage text-warm-white shadow-sm">
            <Sprout className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-xl font-bold tracking-tight text-walnut dark:text-cream">
              AgriPredict <span className="text-sage">AI</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Yield Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sage/15 text-walnut font-semibold dark:bg-sage/20 dark:text-cream shadow-xs'
                    : 'text-stone-600 hover:text-walnut hover:bg-stone-100/70 dark:text-stone-300 dark:hover:text-cream dark:hover:bg-stone-800/60'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Bar: Theme Button & Auth */}
        <div className="flex items-center gap-3">
          
          {/* Theme Icon Button (Round, no 'Theme' text, accessible label) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-700 shadow-xs transition-colors hover:bg-stone-100 hover:text-walnut focus:outline-none focus-visible:ring-2 focus-visible:ring-sage dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 transition-transform duration-200 hover:rotate-12" />
            ) : (
              <Sun className="h-5 w-5 transition-transform duration-200 hover:rotate-45 text-amber-glow" />
            )}
          </button>

          {/* User Auth State */}
          <div className="hidden sm:flex items-center gap-2">
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-100/80 px-3.5 py-1.5 text-sm font-medium text-walnut transition-all hover:bg-stone-200/70 hover:shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sage dark:border-stone-700 dark:bg-stone-800 dark:text-cream dark:hover:bg-stone-700"
                aria-label={`Open account profile for ${firstName}`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sage text-warm-white text-xs font-bold">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <span>{firstName}</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-walnut transition-colors hover:text-stone-900 hover:bg-stone-100/60 dark:text-cream dark:hover:bg-stone-800/60"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-amber-glow px-4 py-2 text-sm font-medium text-warm-white shadow-xs transition-all hover:bg-amber-hover hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-700 lg:hidden hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-200 bg-warm-white px-4 pt-3 pb-6 shadow-xl transition-all dark:border-stone-800 dark:bg-walnut-dark">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3.5 py-2.5 text-base font-medium ${
                    isActive
                      ? 'bg-sage/15 text-walnut font-semibold dark:bg-sage/20 dark:text-cream'
                      : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                  }`
                }
              >
                <span>{link.name}</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 border-t border-stone-200 pt-4 dark:border-stone-800">
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-2">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg bg-stone-100 p-3 text-walnut dark:bg-stone-800 dark:text-cream font-medium"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-warm-white font-bold">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{user.full_name}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">{user.email}</div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg border border-stone-300 py-2.5 text-center text-sm font-medium text-walnut dark:border-stone-700 dark:text-cream"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg bg-amber-glow py-2.5 text-center text-sm font-medium text-warm-white shadow"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
