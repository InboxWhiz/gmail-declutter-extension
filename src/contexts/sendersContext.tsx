import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Sender } from "../types/types";
import { getAllSenders } from "../utils/actions";

interface SendersContextType {
  senders: Sender[];
  loading: boolean;
  reloadSenders: (fetchNew?: boolean) => void;
}

const SendersContext = createContext<SendersContextType | undefined>(undefined);

export const SendersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reloadSenders = useCallback(async (fetchNew = false) => {
    setLoading(true);
    const data = await getAllSenders(fetchNew);
    setSenders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reloadSenders();
  }, [reloadSenders]);

  return (
    <SendersContext.Provider value={{ senders, loading, reloadSenders }}>
      {children}
    </SendersContext.Provider>
  );
};

export const useSenders = (): SendersContextType => {
  const context = useContext(SendersContext);
  if (!context) {
    throw new Error("useSenders must be used within a SendersProvider");
  }
  return context;
};
