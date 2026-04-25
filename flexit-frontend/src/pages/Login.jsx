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
import { googleLogin, loginUser } from '../api/authApi';
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
                width="320"
              />
            </div>
            <button className="btn-social github">
              <span>💻</span> GitHub
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
