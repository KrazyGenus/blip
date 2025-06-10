import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ShowcasePage from './components/ShowcasePage';
import ViolationDetailPage from './components/ViolationDetailPage';
import UploadPage from './components/UploadPage';

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

        <Route path="/dashboard" element={<ShowcasePage />}/>
        <Route path="/violation" element={<ViolationDetailPage />}/>
        <Route path="/upload" element={<UploadPage />}/>
        
        </Route>
       
      </Routes>
      </AuthProvider>
    </Router>
  )
}
export default App;