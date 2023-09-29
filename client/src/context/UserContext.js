import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [userData, setUserData] = useState(null);

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
