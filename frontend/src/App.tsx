import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { PredictPage } from './pages/PredictPage';
import { OptimizePage } from './pages/OptimizePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CropExplorerPage } from './pages/CropExplorerPage';
import { HistoryPage } from './pages/HistoryPage';
import { DataModelCenterPage } from './pages/DataModelCenterPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AccountPage } from './pages/AccountPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="flex min-h-screen flex-col bg-cream text-walnut transition-colors dark:bg-walnut-dark dark:text-cream">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/predict" element={<PredictPage />} />
                  <Route path="/optimize" element={<OptimizePage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/crops" element={<CropExplorerPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/data-model" element={<DataModelCenterPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
