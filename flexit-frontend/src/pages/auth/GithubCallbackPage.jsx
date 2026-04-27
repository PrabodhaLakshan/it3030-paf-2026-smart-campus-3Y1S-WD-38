import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createLoginNotification } from '../../api/notificationApi';
import { githubLogin, updateUserPresence } from '../../api/authApi';

const getErrorMessage = (err) => {
  if (err.response?.data?.message) {
    const message = err.response.data.message;
    if (typeof message === 'string') {
      return message;
    }
    if (typeof message === 'object') {
      return Object.values(message).join(', ');
    }
  }

  if (err.message === 'Network Error') {
    return 'Cannot reach backend server. Please start Spring Boot backend on port 8081.';
  }

  return 'GitHub login failed. Please try again.';
};

function GithubCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const completeGithubLogin = async () => {
      const code = (searchParams.get('code') || '').trim();
      const returnedState = (searchParams.get('state') || '').trim();
      const storedState = (sessionStorage.getItem('github_oauth_state') || '').trim();

      if (!code) {
        setError('Missing GitHub authorization code. Please try again.');
        return;
      }

      if (!returnedState || !storedState || returnedState !== storedState) {
        setError('GitHub login state validation failed. Please try again.');
        return;
      }

      sessionStorage.removeItem('github_oauth_state');

      try {
        const data = await githubLogin({ code });
        localStorage.setItem('flexitUser', JSON.stringify(data));

        const resolvedRole = String(data.role || '').toUpperCase();
        const resolvedUserId = data.userId || data.id;
        const resolvedUserCode = data.userCode;
        const resolvedName = data.fullName || data.userName || data.name || 'User';
        const notificationRecipientId =
          resolvedRole === 'USER' ? (resolvedUserCode || resolvedUserId) : resolvedUserId;

        if (notificationRecipientId) {
          await createLoginNotification({
            userId: notificationRecipientId,
            role: resolvedRole,
            fullName: resolvedName,
          }).catch(() => {});
        }

        const presenceUserId = resolvedUserId || resolvedUserCode;
        if (presenceUserId) {
          await updateUserPresence({ userId: presenceUserId, online: true }).catch(() => {});
        }

        if (resolvedRole === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }

        if (resolvedRole === 'TECHNICIAN') {
          navigate('/technician/dashboard', { replace: true });
          return;
        }

        navigate('/user/dashboard', { replace: true });
      } catch (err) {
        setError(getErrorMessage(err));
      }
    };

    completeGithubLogin();
  }, [navigate, searchParams]);

  return (
    <div className="auth-page login-page">
      <div className="auth-container" style={{ maxWidth: 560 }}>
        <div className="auth-card glass-form" style={{ width: '100%' }}>
          <h2>GitHub Sign In</h2>
          {error ? (
            <>
              <div className="error-message">{error}</div>
              <button
                type="button"
                className="btn-submit"
                onClick={() => navigate('/login', { replace: true })}
              >
                Back to Login
              </button>
            </>
          ) : (
            <p className="auth-subtitle">Completing GitHub authentication...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GithubCallbackPage;
