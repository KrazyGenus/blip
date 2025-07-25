// src/router/index.js
import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../components/LoginPage'; // Your existing LoginPage
import SignUpPage from '../components/SignUpPage'; // Your existing RegisterPage
import DashboardPage from '../components/DashboardPage'; // The new dashboard layout

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />, // Default route, directs to Login
    errorElement: <NotFoundPage />, // Fallback for unmatched routes/errors at root level
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/dashboard',
    element: (
      // Protect the entire dashboard section
      <ProtectedRoute>
        <DashboardPage /> {/* DashboardLayout renders the Sidebar and the Outlet */}
      </ProtectedRoute>
    ),
  },
  {
    path: '*', // Catch-all for any routes not matched above
    element: <NotFoundPage />,
  },
]);

export default router;