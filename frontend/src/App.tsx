import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import UserPage from './pages/UserPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <div className="container">
          <Routes>
            <Route path="/" element={<UserPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/user" element={<UserPage />} />
          </Routes>
        </div>
      </div>
      
      {/* <style>
        {`
        .App {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .nav {
          background: #2c3e50;
          padding: 1rem 2rem;
          display: flex;
          gap: 2rem;
        }
        
        .nav a {
          color: white;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .nav a:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .nav a.active {
          background: #3498db;
        }
        `}
      </style> */}
    </Router>
  );
};

export default App;
