import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AccountPage from './pages/AccountPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import AddTeamsPage from './pages/AddTeamsPage';
import AddEmployeesPage from './pages/AddEmployeesPage';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
import CompanyAdminFunctionsPage from './pages/CompanyAdminFunctionsPage';
import { ThemeContextProvider } from './context/ThemeContext';
import { UserContextProvider } from './context/UserContext';

const App = () => {
  const isLoggedIn = window.localStorage.getItem('loggedIn') === 'true';

  return (
    <ThemeContextProvider>
      <UserContextProvider>
        <BrowserRouter>
          <>
            <Routes>
              {/* Public Routes */}
              <Route path="/home" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register/:token" element={<RegistrationPage />} />
              <Route path="/register" element={<RegistrationPage />} />

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

              <Route
                path="/AddEmployees"
                element={<ProtectedRoute element={<AddEmployeesPage />} isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/AddTeams"
                element={<ProtectedRoute element={<AddTeamsPage />} isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/CompanyAdminFunctions"
                element={<ProtectedRoute element={<CompanyAdminFunctionsPage />} isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/CompanyDashboard"
                element={<ProtectedRoute element={<CompanyDashboardPage />} isLoggedIn={isLoggedIn} />}
              />
            </Routes>

          </>
        </BrowserRouter>
      </UserContextProvider>
    </ThemeContextProvider>
  );
};

export default App;