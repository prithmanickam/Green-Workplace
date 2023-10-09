import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AccountPage from './pages/AccountPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import AddTeamsPage from './pages/AddTeamsPage';
import AddEmployeesPage from './pages/AddEmployeesPage';
import SetCarbonFootprintPage from './pages/SetCarbonFootprintPage';
import FootprintMapPage from './pages/FootprintMapPage';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
import CompanyAdminFunctionsPage from './pages/CompanyAdminFunctionsPage';
import YourDashboardPage from './pages/YourDashboardPage';
import { ThemeContextProvider } from './context/ThemeContext';
import { UserContextProvider } from './context/UserContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const isLoggedIn = window.localStorage.getItem('loggedIn') === 'true';

  // If the user is logged in, log them out and redirect to the login page
  const LoginPageLoggedOut = () => {
    if (isLoggedIn) {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('loggedIn');
      return <LoginPage />;
    } else {
      return <LoginPage />;
    }
  };
  
  // If the user is logged in, log them out and redirect to the registration page
  const RegistrationPageLoggedOut = () => {
    if (isLoggedIn) {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('loggedIn');
      return <RegistrationPage />;
    } else {
      return <RegistrationPage />;
    }
  };

  return (
    <ThemeContextProvider>
      <UserContextProvider>
        <BrowserRouter>
          <>
            <Routes>
              {/* Public Routes */}
              <Route path="/home" element={<LoginPage />} />
              <Route path="/login" element={<LoginPageLoggedOut />} />
              <Route path="/register/:registrationtoken" element={<RegistrationPageLoggedOut />} />

              {/* For testing purposes to create mock accounts */}
              {/* <Route path="/register" element={<RegistrationPage />} /> */}

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
              <Route
                path="/SetCarbonFootprint"
                element={<ProtectedRoute element={<SetCarbonFootprintPage />} isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/SetCarbonFootprint/UseMap"
                element={<ProtectedRoute element={<FootprintMapPage />} isLoggedIn={isLoggedIn} />}
              />
              <Route
                path="/YourDashboard"
                element={<ProtectedRoute element={<YourDashboardPage />} isLoggedIn={isLoggedIn} />}
              />
              
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={2500}
              hideProgressBar
              closeOnClick
              rtl={false}
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover={false}
              theme="light"
            />
          </>
        </BrowserRouter>
      </UserContextProvider>
    </ThemeContextProvider>
  );
};

export default App;