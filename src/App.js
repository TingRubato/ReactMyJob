import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import JobList from './JobList';
import JobDetail from './JobDetail';
import Login from './Login';
import Register from './Register';

/**
 * Renders the application with the defined routes.
 * @returns {JSX.Element} The rendered application.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect the default route to the login page */}
        <Route path="/" element={<Navigate replace to="/login" />} />

        {/* Route for the login page */}
        <Route path="/login" element={<Login />} />

        {/* Route for the register page */}
        <Route path="/register" element={<Register />} />

        {/* Protected route for the list of jobs */}
        <Route path="/jobs" element={<JobList />} />

        {/* Route for job details */}
        <Route path="/jobs/:job_jk" element={<JobDetail />} />

        {/* Fallback for any other route */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
