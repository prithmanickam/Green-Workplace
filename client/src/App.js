import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import BrowserRouter
import TopNavbar from "./components/TopNavbar";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";

const App = () => {
  const isLoggedIn = window.localStorage.getItem("loggedIn");

  return (
    <Router> 
      <>
        <TopNavbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/home" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />

          <Route
            exact
            path="/"
            element={
              isLoggedIn === "true" ? <AccountPage /> : <LoginPage />
            }
          />
        </Routes>
      </>
    </Router>
  );
};

export default App;
