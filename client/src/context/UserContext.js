import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('userData'));

    if (data) {
      setUserData(data);
    }
  }, []);
 
  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook for using the UserContext
export function useUser() {
  return useContext(UserContext);
}
