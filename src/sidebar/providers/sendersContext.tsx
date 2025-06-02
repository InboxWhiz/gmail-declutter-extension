import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Sender } from "../../_shared/types/types";
import { useActions } from "../../_shared/providers/actionsContext";
import { useLoggedIn } from "../../_shared/providers/loggedInContext";

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
  const { getAllSenders } = useActions();
  const { setLoggedIn } = useLoggedIn();

  const reloadSenders = useCallback(async (fetchNew = false) => {
    try {
      setLoading(true);
      const data = await getAllSenders(fetchNew);
      setSenders(data);
      setLoading(false);
    } catch (error: Error | any) {
      // If the user fails to go through the OAuth flow, we set loggedIn to false
      if (error.message == "The user did not approve access.") {
        setLoggedIn(false);
      }
      setLoading(false);
    }
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
