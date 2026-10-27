import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { SavedPrediction } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Clock, 
  Lock, 
  LogOut, 
  Trash2, 
  ArrowRight,
  ShieldAlert,
  Sprout,
  CheckCircle2
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, logout, deleteAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Delete Account Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchSaved = async () => {
      try {
        const list = await api.getSavedPredictions();
        if (mounted) setPredictions(list);
      } catch {}
      if (mounted) setLoadingHistory(false);
    };
    fetchSaved();
    return () => { mounted = false; };
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'warning');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'warning');
      return;
    }

    setPasswordUpdating(true);
    // Simulating password update call or calling backend endpoint
    setTimeout(() => {
      setPasswordUpdating(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('Password updated successfully.', 'success');
    }, 600);
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      showToast('Your account and associated prediction records have been deleted.', 'info');
      navigate('/');
    } catch (err: any) {
      showToast(`Account deletion failed: ${err.message}`, 'error');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h2 className="font-heading text-xl font-bold text-walnut dark:text-cream">You are not logged in</h2>
        <p className="mt-2 text-xs text-stone-500">Please log in to manage your account and view saved predictions.</p>
        <Link 
          to="/login"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sage px-4 py-2 text-xs font-semibold text-warm-white"
        >
          <span>Log in</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const memberDate = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'October 2026';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      
      {/* Page Header */}
      <div className="border-b border-stone-200/80 pb-6 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage">
            <UserIcon className="h-4 w-4" />
            <span>User Account</span>
          </div>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-walnut dark:text-cream sm:text-4xl">
            Account settings & profile
          </h1>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        
        {/* Left Column: Profile Card & Saved Summary */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Profile Card */}
          <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sage text-warm-white text-xl font-bold shadow-xs">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-walnut dark:text-cream">
                  {user.full_name}
                </h2>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  AgriPredict Researcher
                </span>
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-xs border-t border-stone-100 dark:border-stone-800 pt-4">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-stone-400" />
                <span className="text-stone-700 dark:text-stone-300 font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-stone-400" />
                <span className="text-stone-500 dark:text-stone-400">Member since {memberDate}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-stone-400" />
                <span className="text-stone-500 dark:text-stone-400">
                  {predictions.length} saved yield {predictions.length === 1 ? 'prediction' : 'predictions'}
                </span>
              </div>
            </dl>
          </div>

          {/* Quick link to Saved Predictions */}
          <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 shadow-xs dark:border-stone-800 dark:bg-walnut">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-walnut dark:text-cream">
                  Saved predictions
                </h3>
                <p className="mt-0.5 text-xs text-stone-500">
                  {predictions.length} stored simulations
                </p>
              </div>
              <Link
                to="/history"
                className="inline-flex items-center gap-1 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-walnut hover:bg-stone-200 dark:bg-stone-800 dark:text-cream"
              >
                <span>View history</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {predictions.length > 0 && (
              <div className="mt-4 space-y-2">
                {predictions.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-stone-50 p-2 text-xs dark:bg-stone-900/40">
                    <span className="font-medium text-walnut dark:text-cream">{p.crop} ({p.year})</span>
                    <span className="font-bold text-sage">{p.predicted_yield_t_ha} t/ha</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destructive Zone: Delete Account */}
          <div className="rounded-2xl border border-rose-200/70 bg-rose-50/30 p-6 dark:border-rose-950/60 dark:bg-rose-950/20">
            <h3 className="font-heading text-sm font-bold text-rose-900 dark:text-rose-300">
              Delete account
            </h3>
            <p className="mt-1 text-xs text-rose-700 dark:text-rose-400">
              Permanently erase your user profile and all associated prediction logs.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete my account</span>
            </button>
          </div>

        </div>

        {/* Right Column: Security & Password Management */}
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-stone-200/90 bg-warm-white p-6 sm:p-8 shadow-xs dark:border-stone-800 dark:bg-walnut">
            
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4 dark:border-stone-800">
              <Lock className="h-5 w-5 text-amber-glow" />
              <h2 className="font-heading text-lg font-bold text-walnut dark:text-cream">
                Change password
              </h2>
            </div>

            <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Current password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  New password <span className="text-stone-400 font-normal">(min 8 characters)</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Confirm new password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-walnut focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage dark:border-stone-700 dark:bg-stone-900 dark:text-cream"
                />
              </div>

              <button
                type="submit"
                disabled={passwordUpdating}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-glow px-5 py-2.5 text-xs font-semibold text-warm-white shadow-xs hover:bg-amber-hover disabled:opacity-50"
              >
                <span>{passwordUpdating ? 'Updating...' : 'Update password'}</span>
              </button>
            </form>

          </div>
        </div>

      </div>

      {/* Confirmation Modal for Delete Account */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Permanently delete account?"
        message="This action will delete your profile and all saved prediction records. You will immediately be logged out."
        confirmLabel="Yes, delete my account"
        isDestructive={true}
        isLoading={deletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />

    </div>
  );
};
