import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [genericError, setGenericError] = useState<string | null>(null);

  // Check redirect query param
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenericError(null);

    if (!email.trim() || !password) {
      setGenericError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      showToast('Logged in successfully!', 'success');
      navigate(redirectPath);
    } catch (err: any) {
      // Must show generic error message as required in Section 4: "Generic error message ("Email or password is incorrect")"
      setGenericError('Email or password is incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-stone-200/90 bg-warm-white p-8 shadow-sm dark:border-stone-800 dark:bg-walnut">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage text-warm-white shadow-xs">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight text-walnut dark:text-cream">
            Log in to AgriPredict AI
          </h1>
          <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
            Access your saved predictions, customized scenarios, and export features.
          </p>
        </div>

        {/* Generic Error Notice */}
        {genericError && (
          <div 
            role="alert" 
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{genericError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Email address
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-glow py-3 text-sm font-semibold text-warm-white shadow-xs transition-all hover:bg-amber-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow disabled:opacity-50"
          >
            <span>{loading ? 'Verifying...' : 'Log in'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Link to Sign up */}
        <div className="text-center pt-2 border-t border-stone-100 dark:border-stone-800">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            New to AgriPredict AI?{' '}
            <Link 
              to={`/signup${location.search}`}
              className="font-semibold text-amber-glow hover:underline dark:text-amber-light"
            >
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
