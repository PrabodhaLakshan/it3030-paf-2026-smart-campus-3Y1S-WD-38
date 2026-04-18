import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppRoutes from './routes/AppRoutes';
import './App.css';

// Auth guard — redirects unauthenticated users to /login
function PrivateRoute({ children }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('flexitUser') || 'null');
  } catch {
    user = null;
  }
  if (!user?.userId) return <Navigate to="/login" replace />;
  return children;
}

// Hide Navbar on auth pages
function AppLayout() {
  const location = useLocation();
  const authPaths = ['/login', '/signup'];
  const hideNavbar = authPaths.includes(location.pathname) || location.pathname.startsWith('/admin');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* All admin + user routes (protected) */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppRoutes />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;

