import React, { createContext, useContext, useState } from "react";

type ModalState = null | {
  action?: "delete" | "unsubscribe";
  type: "confirm" | "pending" | "continue" | "success" | "error" | "no-sender";
  subtype?: "finding-link" | "blocking";
  extras?: any;
};

interface ModalContextType {
  modal: ModalState;
  setModal: React.Dispatch<React.SetStateAction<ModalState>>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modal, setModal] = useState<ModalState>(null);

  return (
    <ModalContext.Provider value={{ modal, setModal }}>
      {children}
    </ModalContext.Provider>
  );
};
