import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthToken, refreshUser } = useAuth();
  const [status, setStatus] = useState<string>('Completing Google authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
        return;
      }

      if (token) {
        try {
          setStatus('Authenticating your profile...');
          await setAuthToken(token);
          navigate('/dashboard', { replace: true });
        } catch (err) {
          console.error('Failed to set auth token:', err);
          navigate('/login?error=token_verification_failed', { replace: true });
        }
      } else {
        // In cookie-only flow, try refreshing user session from cookie
        try {
          await refreshUser();
          navigate('/dashboard', { replace: true });
        } catch {
          navigate('/login?error=no_token', { replace: true });
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuthToken, refreshUser]);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center max-w-sm w-full space-y-4">
        <LoadingSpinner size="lg" text={status} />
        <p className="text-xs text-slate-400">Please wait while we redirect you to your dashboard.</p>
      </div>
    </div>
  );
};
