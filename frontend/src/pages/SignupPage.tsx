import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Sprout, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/';

  // Inline Validation
  const errors: Record<string, string> = {};
  if (touched.fullName && !fullName.trim()) {
    errors.fullName = 'Full name is required';
  }
  if (touched.email) {
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
  }
  if (touched.password) {
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  }
  if (touched.confirmPassword) {
    if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!fullName.trim() || !email.trim() || password.length < 8 || password !== confirmPassword) {
      showToast('Please fix the indicated validation errors.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await signup(fullName.trim(), email.trim(), password);
      showToast('Account created successfully! Welcome to AgriPredict AI.', 'success');
      navigate(redirectPath);
    } catch (err: any) {
      showToast(`Signup failed: ${err.message}`, 'error');
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
            Create your account
          </h1>
          <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
            Sign up to save predictions, run custom farm scenarios, and export audit trails.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Full name
            </label>
            <div className="relative mt-1.5">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Dr. Eleanor Vance"
                className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-walnut focus:outline-none focus:ring-1 dark:bg-stone-900 dark:text-cream ${
                  errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-stone-300 focus:border-sage focus:ring-sage dark:border-stone-700'
                }`}
              />
            </div>
            {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>}
          </div>

          {/* Email */}
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
                onBlur={() => handleBlur('email')}
                placeholder="eleanor@agro-analytics.org"
                className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-walnut focus:outline-none focus:ring-1 dark:bg-stone-900 dark:text-cream ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-stone-300 focus:border-sage focus:ring-sage dark:border-stone-700'
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
          </div>

          {/* Password (min 8 characters) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Password <span className="text-stone-400 font-normal">(min 8 characters)</span>
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-walnut focus:outline-none focus:ring-1 dark:bg-stone-900 dark:text-cream ${
                  errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-stone-300 focus:border-sage focus:ring-sage dark:border-stone-700'
                }`}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Confirm password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-walnut focus:outline-none focus:ring-1 dark:bg-stone-900 dark:text-cream ${
                  errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-stone-300 focus:border-sage focus:ring-sage dark:border-stone-700'
                }`}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-glow py-3 text-sm font-semibold text-warm-white shadow-xs transition-all hover:bg-amber-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow disabled:opacity-50"
          >
            <span>{loading ? 'Registering...' : 'Create free account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Link to Log in */}
        <div className="text-center pt-2 border-t border-stone-100 dark:border-stone-800">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Already have an account?{' '}
            <Link 
              to={`/login${location.search}`}
              className="font-semibold text-amber-glow hover:underline dark:text-amber-light"
            >
              Log in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
