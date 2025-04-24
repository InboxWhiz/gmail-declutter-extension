import React, { createContext, useContext } from "react";
import { Actions } from "../utils/actions/types";
import { realActions } from "../utils/actions/realActions";
import { mockActions } from "../utils/actions/mockActions";

const useMock = import.meta.env.VITE_USE_MOCK === "true"; // Automatically enable mock in development or test
const ActionsContext = useMock
  ? createContext<Actions>(mockActions)
  : createContext<Actions>(realActions);

export const ActionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ActionsContext.Provider value={useMock ? mockActions : realActions}>
      {children}
    </ActionsContext.Provider>
  );
};

export const useActions = () => useContext(ActionsContext);
