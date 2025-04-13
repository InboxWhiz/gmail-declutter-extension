import React, { createContext, useContext, useState } from "react";

type SelectedSendersType = Record<string, number>;

interface SelectedSendersContextType {
  selectedSenders: SelectedSendersType;
  setSelectedSenders: React.Dispatch<React.SetStateAction<SelectedSendersType>>;
}

const SelectedSendersContext = createContext<
  SelectedSendersContextType | undefined
>(undefined);

export const useSelectedSenders = () => {
  const context = useContext(SelectedSendersContext);
  if (!context) {
    throw new Error(
      "useSelectedSenders must be used within a SelectedSendersProvider",
    );
  }
  return context;
};

export const SelectedSendersProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedSenders, setSelectedSenders] = useState<SelectedSendersType>(
    {},
  );

  return (
    <SelectedSendersContext.Provider
      value={{ selectedSenders, setSelectedSenders }}
    >
      {children}
    </SelectedSendersContext.Provider>
  );
};
