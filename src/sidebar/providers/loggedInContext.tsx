import React, { createContext, useContext, useState } from "react";

interface LoggedInContextType {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
}

const LoggedInContext = createContext<LoggedInContextType | undefined>(undefined);

export const LoggedInProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  return (
    <LoggedInContext.Provider value={{ loggedIn, setLoggedIn }}>
      {children}
    </LoggedInContext.Provider>
  );
};

export const useLoggedIn = (): LoggedInContextType => {
  const context = useContext(LoggedInContext);
  if (!context) {
    throw new Error("useLoggedIn must be used within a LoggedInProvider");
  }
  return context;
};
