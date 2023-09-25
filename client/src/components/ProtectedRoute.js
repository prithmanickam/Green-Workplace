import React from 'react';
import { Navigate} from 'react-router-dom';

function ProtectedRoute({ element, isLoggedIn }) {
  // If the user is logged in, render the element, otherwise redirect to the login page
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
