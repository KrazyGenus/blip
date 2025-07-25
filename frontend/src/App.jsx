import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import DashboardPage from './components/DashboardPage';

import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext'; // Import your auth provider
import ProtectedRoute from './components/ProtectedRoute'; // Import your protected route

const App = () => {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<LoginPage></LoginPage>}/>
        <Route path="/signup" element={<SignUpPage></SignUpPage>}/>
        {/* Protected Routes Group */}
        <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />}/>      
        </Route>
       
      </Routes>
      </AuthProvider>
    </Router>
  )
}
export default App;