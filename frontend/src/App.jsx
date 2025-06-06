import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ShowcasePage from './components/ShowcasePage';
import ViolationDetailPage from './components/ViolationDetailPage';
import UploadPage from './components/UploadPage';

import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<LoginPage></LoginPage>}/>
        <Route path="/signup" element={<SignUpPage></SignUpPage>}/>
        <Route path="/dashboard" element={<ShowcasePage></ShowcasePage>}/>
        <Route path="/violation" element={<ViolationDetailPage></ViolationDetailPage>}/>
        <Route path="/upload" element={<UploadPage></UploadPage>}/>
      </Routes>
    </Router>
  )
}
export default App;