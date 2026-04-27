// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { GoogleLogin } from '@react-oauth/google';
// // import { googleLogin, loginUser } from '../api/authApi';
// // import './Auth.css';

// // const getErrorMessage = (err) => {
// //   if (err.response?.data?.message) {
// //     const message = err.response.data.message;
// //     if (typeof message === 'string') {
// //       return message;
// //     }
// //     if (typeof message === 'object') {
// //       return Object.values(message).join(', ');
// //     }
// //   }

// //   if (err.message === 'Network Error') {
// //     return 'Cannot reach backend server. Please start Spring Boot backend on port 8080.';
// //   }

// //   return 'Login failed. Please try again.';
// // };

// // function Login() {
// //   const navigate = useNavigate();
// //   const [formData, setFormData] = useState({
// //     email: '',
// //     password: '',
// //   });
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   const handleAuthSuccess = (data) => {
// //     localStorage.setItem('flexitUser', JSON.stringify(data));
// //     if (data.role === 'ADMIN') {
// //       navigate('/admin-dashboard');
// //     } else {
// //       navigate('/resources');
// //     }
// //   };

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({
// //       ...prev,
// //       [name]: value,
// //     }));
// //     setError('');
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError('');

// //     try {
// //       if (!formData.email || !formData.password) {
// //         setError('Please fill in all fields');
// //         return;
// //       }

// //       const data = await loginUser({
// //         email: formData.email,
// //         password: formData.password,
// //       });

// //       handleAuthSuccess(data);
// //     } catch (err) {
// //       setError(getErrorMessage(err));
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleGoogleSuccess = async (credentialResponse) => {
// //     if (!credentialResponse?.credential) {
// //       setError('Google authentication failed. Please try again.');
// //       return;
// //     }

// //     setLoading(true);
// //     setError('');

// //     try {
// //       const data = await googleLogin({ idToken: credentialResponse.credential });
// //       handleAuthSuccess(data);
// //     } catch (err) {
// //       setError(getErrorMessage(err));
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="auth-page">
// //       <div className="auth-container">
// //         <div className="auth-card">
// //           <h1>Welcome Back</h1>
// //           <p className="auth-subtitle">Login to your Flexit account</p>

// //           {error && <div className="error-message">{error}</div>}

// //           <form onSubmit={handleSubmit} className="auth-form">
// //             <div className="form-group">
// //               <label htmlFor="email">Email</label>
// //               <input
// //                 type="email"
// //                 id="email"
// //                 name="email"
// //                 placeholder="your@email.com"
// //                 value={formData.email}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>

// //             <div className="form-group">
// //               <label htmlFor="password">Password</label>
// //               <input
// //                 type="password"
// //                 id="password"
// //                 name="password"
// //                 placeholder="Enter your password"
// //                 value={formData.password}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>

// //             <button type="submit" className="btn-submit" disabled={loading}>
// //               {loading ? 'Logging in...' : 'Login'}
// //             </button>
// //           </form>

// //           <div className="auth-divider">
// //             <span>or</span>
// //           </div>

// //           <div className="social-login">
// //             <GoogleLogin
// //               onSuccess={handleGoogleSuccess}
// //               onError={() => setError('Google authentication failed. Please try again.')}
// //               text="signin_with"
// //               shape="pill"
// //               width="100%"
// //             />
// //             <button className="btn-social github">
// //               <span>💻</span> Login with GitHub
// //             </button>
// //           </div>

// //           <p className="auth-footer">
// //             Don't have an account?{' '}
// //             <a href="#signup" onClick={(e) => {
// //               e.preventDefault();
// //               navigate('/signup');
// //             }}>
// //               Sign up here
// //             </a>
// //           </p>
// //         </div>

// //         <div className="auth-image">
// //           <div className="auth-illustration">🔐</div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Login;







// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
// import { googleLogin, loginUser } from '../api/authApi';
// import './Auth.css';

// const getErrorMessage = (err) => {
//   if (err.response?.data?.message) {
//     const message = err.response.data.message;
//     if (typeof message === 'string') {
//       return message;
//     }
//     if (typeof message === 'object') {
//       return Object.values(message).join(', ');
//     }
//   }

//   if (err.message === 'Network Error') {
//     return 'Cannot reach backend server. Please start Spring Boot backend on port 8080.';
//   }

//   return 'Login failed. Please try again.';
// };

// function Login() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleAuthSuccess = (data) => {
//     localStorage.setItem('flexitUser', JSON.stringify(data));
//     if (data.role === 'ADMIN') {
//       navigate('/admin-dashboard');
//     } else {
//       navigate('/resources');
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       if (!formData.email || !formData.password) {
//         setError('Please fill in all fields');
//         return;
//       }

//       const data = await loginUser({
//         email: formData.email,
//         password: formData.password,
//       });

//       handleAuthSuccess(data);
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSuccess = async (credentialResponse) => {
//     if (!credentialResponse?.credential) {
//       setError('Google authentication failed. Please try again.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const data = await googleLogin({ idToken: credentialResponse.credential });
//       handleAuthSuccess(data);
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-container login-layout">
        
//         {/* Left Side - Content */}
//         <div className="auth-info-section">
//           <h1 className="info-title">Welcome to Flexit</h1>
//           <p className="info-desc">
//             Empower your workflow with our advanced resource management platform. Sign in to continue your journey.
//           </p>
          
//           <div className="mini-cards-container">
//             <div className="mini-card glass-panel">
//               <div className="mini-card-icon">🚀</div>
//               <div className="mini-card-text">
//                 <h3>Fast Performance</h3>
//                 <p>Lightning quick responses for your tasks.</p>
//               </div>
//             </div>
            
//             <div className="mini-card glass-panel">
//               <div className="mini-card-icon">🛡️</div>
//               <div className="mini-card-text">
//                 <h3>Secure Access</h3>
//                 <p>Enterprise-grade security for your data.</p>
//               </div>
//             </div>

//             <div className="mini-card glass-panel">
//               <div className="mini-card-icon">📊</div>
//               <div className="mini-card-text">
//                 <h3>Smart Analytics</h3>
//                 <p>Real-time insights at your fingertips.</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Login Form */}
//         <div className="auth-card glass-form">
//           <h2>Welcome Back</h2>
//           <p className="auth-subtitle">Login to your Flexit account</p>

//           {error && <div className="error-message">{error}</div>}

//           <form onSubmit={handleSubmit} className="auth-form">
//             <div className="form-group">
//               <label htmlFor="email">Email</label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 placeholder="your@email.com"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 name="password"
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <button type="submit" className="btn-submit" disabled={loading}>
//               {loading ? 'Logging in...' : 'Login'}
//             </button>
//           </form>

//           <div className="auth-divider">
//             <span>or</span>
//           </div>

//           <div className="social-login">
//             <GoogleLogin
//               onSuccess={handleGoogleSuccess}
//               onError={() => setError('Google authentication failed. Please try again.')}
//               text="signin_with"
//               shape="pill"
//               width="100%"
//             />
//             <button className="btn-social github">
//               <span>💻</span> Login with GitHub
//             </button>
//           </div>

//           <p className="auth-footer">
//             Don't have an account?{' '}
//             <a href="#signup" onClick={(e) => {
//               e.preventDefault();
//               navigate('/signup');
//             }}>
//               Sign up here
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;






import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin, loginUser, updateUserPresence } from '../api/authApi';
import { createLoginNotification } from '../api/notificationApi';
import './Auth.css';

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
    return 'Cannot reach backend server. Please start Spring Boot backend on port 8080.';
  }

  return 'Login failed. Please try again.';
};

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = async (data) => {
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
      }).catch((error) => {
        console.error('Failed to create login notification:', error);
      });
    }

    const presenceUserId = resolvedUserId || resolvedUserCode;
    if (presenceUserId) {
      await updateUserPresence({ userId: presenceUserId, online: true }).catch((error) => {
        console.error('Failed to update user presence:', error);
      });
    }

    if (resolvedRole === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (resolvedRole === 'TECHNICIAN') {
      navigate('/technician/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      await handleAuthSuccess(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google authentication failed. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await googleLogin({ idToken: credentialResponse.credential });
      await handleAuthSuccess(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = () => {
    const githubClientId = (import.meta.env.VITE_GITHUB_CLIENT_ID || '').trim();
    const redirectUri = (
      import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/github/callback`
    ).trim();

    if (!githubClientId) {
      setError('GitHub Client ID is missing. Please configure VITE_GITHUB_CLIENT_ID.');
      return;
    }

    const state =
      window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    sessionStorage.setItem('github_oauth_state', state);

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', githubClientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'read:user user:email');
    url.searchParams.set('state', state);

    window.location.href = url.toString();
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container login-layout">
        
        {/* Left Side - Content */}
        <div className="auth-info-section">
          <div className="logo-section">
            <img src="/images/flexit_logo_Darkbg1.png" alt="Flexit Logo" className="flexit-logo" />
          </div>
          <h1 className="info-title">Welcome to Flexit</h1>
          <p className="info-desc">
            Empower your workflow with our advanced resource management platform. Sign in to continue your journey.
          </p>
          
          <div className="mini-cards-container">
            <div className="mini-card glass-panel">
              <div className="mini-card-icon">🚀</div>
              <div className="mini-card-text">
                <h3>Fast Performance</h3>
                <p>Lightning quick responses for your tasks.</p>
              </div>
            </div>
            
            <div className="mini-card glass-panel">
              <div className="mini-card-icon">🛡️</div>
              <div className="mini-card-text">
                <h3>Secure Access</h3>
                <p>Enterprise-grade security for your data.</p>
              </div>
            </div>

            <div className="mini-card glass-panel">
              <div className="mini-card-icon">📊</div>
              <div className="mini-card-text">
                <h3>Smart Analytics</h3>
                <p>Real-time insights at your fingertips.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-card glass-form">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Login to your Flexit account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-login">
            <div className="social-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google authentication failed. Please try again.')}
                text="signin_with"
                shape="pill"
                width="100%"
              />
            </div>
            <button type="button" className="btn-social github" onClick={handleGithubLogin}>
              <svg className="github-logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M12 .297a12 12 0 0 0-3.795 23.385c.6.111.82-.258.82-.577v-2.234c-3.338.726-4.043-1.61-4.043-1.61a3.176 3.176 0 0 0-1.334-1.758c-1.09-.744.083-.729.083-.729a2.52 2.52 0 0 1 1.838 1.237 2.551 2.551 0 0 0 3.49.995 2.55 2.55 0 0 1 .76-1.6c-2.665-.3-5.467-1.334-5.467-5.932a4.64 4.64 0 0 1 1.235-3.219 4.31 4.31 0 0 1 .117-3.176s1.008-.322 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.552 3.297-1.23 3.297-1.23a4.31 4.31 0 0 1 .12 3.176 4.63 4.63 0 0 1 1.233 3.219c0 4.609-2.807 5.628-5.48 5.922a2.86 2.86 0 0 1 .817 2.22v3.293c0 .322.216.694.825.576A12 12 0 0 0 12 .297"
                />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account?{' '}
            <a href="#signup" onClick={(e) => {
              e.preventDefault();
              navigate('/signup');
            }}>
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
