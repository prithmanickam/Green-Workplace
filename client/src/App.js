import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TopNavbar from './components/TopNavbar';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const isLoggedIn = window.localStorage.getItem('loggedIn') === 'true';

  return (
    <Router>
      <>
        <TopNavbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/home" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Route */}
          <Route
            path="/homepage"
            element={<ProtectedRoute element={<HomePage />} isLoggedIn={isLoggedIn} />}
          />
          <Route
            path="/account"
            element={<ProtectedRoute element={<AccountPage />} isLoggedIn={isLoggedIn} />}
          />

          <Route
            exact
            path="/"
            element={isLoggedIn === true ? <HomePage /> : <LoginPage />}
          />
        </Routes>
      </>
    </Router>
  );
};

export default App;
