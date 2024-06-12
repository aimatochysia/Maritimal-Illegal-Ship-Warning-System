import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import ViewPage from './ViewPage';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/view" element={<ViewPage />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;