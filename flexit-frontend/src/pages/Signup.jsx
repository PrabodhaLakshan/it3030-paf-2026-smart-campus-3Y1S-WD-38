// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { GoogleLogin } from '@react-oauth/google';
// // import { googleLogin, registerUser } from '../api/authApi';
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

// //   return 'Signup failed. Please try again.';
// // };

// // function Signup() {
// //   const navigate = useNavigate();
// //   const [formData, setFormData] = useState({
// //     fullName: '',
// //     email: '',
// //     password: '',
// //     confirmPassword: '',
// //     acceptTerms: false,
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
// //     const { name, value, type, checked } = e.target;
// //     setFormData((prev) => ({
// //       ...prev,
// //       [name]: type === 'checkbox' ? checked : value,
// //     }));
// //     setError('');
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     setError('');

// //     try {
// //       if (formData.password !== formData.confirmPassword) {
// //         setError('Passwords do not match');
// //         return;
// //       }
// //       if (!formData.acceptTerms) {
// //         setError('Please accept the terms and conditions');
// //         return;
// //       }
// //       // TODO: Connect to backend signup API
// //       if (!formData.fullName || !formData.email || !formData.password) {
// //         setError('Please fill in all fields');
// //         return;
// //       }

// //       await registerUser({
// //         fullName: formData.fullName,
// //         email: formData.email,
// //         password: formData.password,
// //       });

// //       navigate('/login');
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
// //           <h1>Create Account</h1>
// //           <p className="auth-subtitle">Join Flexit and manage resources efficiently</p>

// //           {error && <div className="error-message">{error}</div>}

// //           <form onSubmit={handleSubmit} className="auth-form">
// //             <div className="form-group">
// //               <label htmlFor="fullName">Full Name</label>
// //               <input
// //                 type="text"
// //                 id="fullName"
// //                 name="fullName"
// //                 placeholder="John Doe"
// //                 value={formData.fullName}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>

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
// //                 placeholder="Create a strong password"
// //                 value={formData.password}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>

// //             <div className="form-group">
// //               <label htmlFor="confirmPassword">Confirm Password</label>
// //               <input
// //                 type="password"
// //                 id="confirmPassword"
// //                 name="confirmPassword"
// //                 placeholder="Confirm your password"
// //                 value={formData.confirmPassword}
// //                 onChange={handleChange}
// //                 required
// //               />
// //             </div>

// //             <div className="form-group checkbox">
// //               <input
// //                 type="checkbox"
// //                 id="acceptTerms"
// //                 name="acceptTerms"
// //                 checked={formData.acceptTerms}
// //                 onChange={handleChange}
// //               />
// //               <label htmlFor="acceptTerms" className="checkbox-label">
// //                 I agree to the{' '}
// //                 <a href="#terms" onClick={(e) => e.preventDefault()}>
// //                   Terms and Conditions
// //                 </a>
// //               </label>
// //             </div>

// //             <button type="submit" className="btn-submit" disabled={loading}>
// //               {loading ? 'Creating account...' : 'Sign Up'}
// //             </button>
// //           </form>

// //           <div className="auth-divider">
// //             <span>or</span>
// //           </div>

// //           <div className="social-login">
// //             <GoogleLogin
// //               onSuccess={handleGoogleSuccess}
// //               onError={() => setError('Google authentication failed. Please try again.')}
// //               text="signup_with"
// //               shape="pill"
// //               width="100%"
// //             />
// //             <button className="btn-social github">
// //               <span>💻</span> Sign up with GitHub
// //             </button>
// //           </div>

// //           <p className="auth-footer">
// //             Already have an account?{' '}
// //             <a href="#login" onClick={(e) => {
// //               e.preventDefault();
// //               navigate('/login');
// //             }}>
// //               Login here
// //             </a>
// //           </p>
// //         </div>

// //         <div className="auth-image">
// //           <div className="auth-illustration">🎉</div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default Signup;












// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
// import { googleLogin, registerUser } from '../api/authApi';
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

//   return 'Signup failed. Please try again.';
// };

// function Signup() {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     acceptTerms: false,
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
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//     setError('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       if (formData.password !== formData.confirmPassword) {
//         setError('Passwords do not match');
//         return;
//       }
//       if (!formData.acceptTerms) {
//         setError('Please accept the terms and conditions');
//         return;
//       }
      
//       if (!formData.fullName || !formData.email || !formData.password) {
//         setError('Please fill in all fields');
//         return;
//       }

//       await registerUser({
//         fullName: formData.fullName,
//         email: formData.email,
//         password: formData.password,
//       });

//       navigate('/login');
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
//       <div className="auth-container signup-layout">
        
//         {/* Left Side - Signup Form */}
//         <div className="auth-card glass-form">
//           <h2>Create Account</h2>
//           <p className="auth-subtitle">Join Flexit and manage resources efficiently</p>

//           {error && <div className="error-message">{error}</div>}

//           <form onSubmit={handleSubmit} className="auth-form">
//             <div className="form-group">
//               <label htmlFor="fullName">Full Name</label>
//               <input
//                 type="text"
//                 id="fullName"
//                 name="fullName"
//                 placeholder="John Doe"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

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
//                 placeholder="Create a strong password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="confirmPassword">Confirm Password</label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 placeholder="Confirm your password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group checkbox">
//               <input
//                 type="checkbox"
//                 id="acceptTerms"
//                 name="acceptTerms"
//                 checked={formData.acceptTerms}
//                 onChange={handleChange}
//               />
//               <label htmlFor="acceptTerms" className="checkbox-label">
//                 I agree to the{' '}
//                 <a href="#terms" onClick={(e) => e.preventDefault()}>
//                   Terms and Conditions
//                 </a>
//               </label>
//             </div>

//             <button type="submit" className="btn-submit" disabled={loading}>
//               {loading ? 'Creating account...' : 'Sign Up'}
//             </button>
//           </form>

//           <div className="auth-divider">
//             <span>or</span>
//           </div>

//           <div className="social-login">
//             <GoogleLogin
//               onSuccess={handleGoogleSuccess}
//               onError={() => setError('Google authentication failed. Please try again.')}
//               text="signup_with"
//               shape="pill"
//               width="100%"
//             />
//             <button className="btn-social github">
//               <span>💻</span> Sign up with GitHub
//             </button>
//           </div>

//           <p className="auth-footer">
//             Already have an account?{' '}
//             <a href="#login" onClick={(e) => {
//               e.preventDefault();
//               navigate('/login');
//             }}>
//               Login here
//             </a>
//           </p>
//         </div>

//         {/* Right Side - Content */}
//         <div className="auth-info-section">
//           <h1 className="info-title">Join the Community</h1>
//           <p className="info-desc">
//             Start your journey with us today. Create an account to unlock premium features and tools.
//           </p>
          
//           <div className="mini-cards-container">
//             <div className="mini-card glass-panel">
//               <div className="mini-card-icon">✨</div>
//               <div className="mini-card-text">
//                 <h3>Easy Setup</h3>
//                 <p>Get started in just a few minutes.</p>
//               </div>
//             </div>
            
//             <div className="mini-card glass-panel">
//               <div className="mini-card-icon">🤝</div>
//               <div className="mini-card-text">
//                 <h3>Community Support</h3>
//                 <p>Connect with other professionals.</p>
//               </div>
//             </div>

//             <div className="mini-card glass-panel">
//               <div className="mini-card-icon">🛠️</div>
//               <div className="mini-card-text">
//                 <h3>Smart Tools</h3>
//                 <p>Access our suite of modern applications.</p>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Signup;










import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin, registerUser } from '../api/authApi';
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

  return 'Signup failed. Please try again.';
};

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = (data) => {
    localStorage.setItem('flexitUser', JSON.stringify(data));
    if (data.role === 'ADMIN') {
      navigate('/admin-dashboard');
    } else {
      navigate('/resources');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!formData.acceptTerms) {
        setError('Please accept the terms and conditions');
        return;
      }
      
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }

      await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      navigate('/login');
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
      handleAuthSuccess(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container signup-layout">
        
        {/* Left Side - Signup Form */}
        <div className="auth-card glass-form">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join Flexit and manage resources efficiently</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

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

            {/* Password Fields Side-by-Side */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
              <label htmlFor="acceptTerms" className="checkbox-label">
                I agree to the{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()}>
                  Terms and Conditions
                </a>
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
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
                text="signup_with"
                shape="pill"
                width="100%"
              />
            </div>
            <button className="btn-social github">
              <span>💻</span> GitHub
            </button>
          </div>

          <p className="auth-footer">
            Already have an account?{' '}
            <a href="#login" onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}>
              Login here
            </a>
          </p>
        </div>

        {/* Right Side - Content */}
        <div className="auth-info-section">
          <div className="logo-section">
            <img src="/images/flexit_logo_Darkbg1.png" alt="Flexit Logo" className="flexit-logo" />
          </div>
          <h1 className="info-title">Join the Community</h1>
          <p className="info-desc">
            Start your journey with us today. Create an account to unlock premium features and tools.
          </p>
          
          <div className="mini-cards-container">
            <div className="mini-card glass-panel">
              <div className="mini-card-icon">✨</div>
              <div className="mini-card-text">
                <h3>Easy Setup</h3>
                <p>Get started in just a few minutes.</p>
              </div>
            </div>
            
            <div className="mini-card glass-panel">
              <div className="mini-card-icon">🤝</div>
              <div className="mini-card-text">
                <h3>Community Support</h3>
                <p>Connect with other professionals.</p>
              </div>
            </div>

            <div className="mini-card glass-panel">
              <div className="mini-card-icon">🛠️</div>
              <div className="mini-card-text">
                <h3>Smart Tools</h3>
                <p>Access our suite of modern applications.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;