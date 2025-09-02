import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Sender } from "../../domain/entities/sender";
import { ChromeLocalStorageRepo } from "../../data/repositories/chrome_local_storage_repo";
import { BrowserEmailRepo } from "../../data/repositories/browser_email_repo";
import { ChromePageInteractionRepo } from "../../data/repositories/chrome_page_interaction_repo";
import { EmailRepo } from "../../domain/repositories/email_repo";
import { StorageRepo } from "../../domain/repositories/storage_repo";
import { PageInteractionRepo } from "../../domain/repositories/page_interaction_repo";

// Mock repositories
import { MockEmailRepo } from "../../data/repositories/mocks/mock_email_repo";
import { MockStorageRepo } from "../../data/repositories/mocks/mock_storage_repo";
import { MockPageInteractionRepo } from "../../data/repositories/mocks/mock_page_interaction_repo";

type AppContextType = {
  senders: Sender[];
  selectedSenders: Record<string, number>;
  loading: boolean;
  reloadSenders: (fetchNew?: boolean) => void;
  setSelectedSenders: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  clearSelectedSenders: () => void;
  searchEmailSenders: (emails: string[]) => void;
  getEmailAccount: () => Promise<string | null>;
  deleteSenders: (senderEmails: string[]) => Promise<void>;
  unsubscribeSenders: (senderEmails: string[]) => Promise<string[]>;
  blockSender: (senderEmail: string) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [selectedSenders, setSelectedSenders] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState<boolean>(false);

  // - REPOS -

  const useMock = import.meta.env.VITE_USE_MOCK === "true";

  const emailRepo: EmailRepo = useMock
    ? new MockEmailRepo()
    : new BrowserEmailRepo();
  const storageRepo: StorageRepo = useMock
    ? new MockStorageRepo()
    : new ChromeLocalStorageRepo();
  const pageInteractionRepo: PageInteractionRepo = useMock
    ? new MockPageInteractionRepo()
    : new ChromePageInteractionRepo();

  // - METHODS -

  const reloadSenders = useCallback(async (fetchNew = false) => {
    setLoading(true);
    try {
      const accountEmail = await pageInteractionRepo.getActiveTabEmailAccount();

      if (fetchNew) {
        const fetchedSenders = await emailRepo.fetchSenders();
        storageRepo.storeSenders(fetchedSenders, accountEmail);
        setSenders(fetchedSenders);
      } else {
        const storedData = await storageRepo.readSenders(accountEmail);
        setSenders(storedData);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSelectedSenders = useCallback(() => {
    setSelectedSenders({});
  }, []);

  const searchEmailSenders = useCallback((emails: string[]) => {
    pageInteractionRepo.searchEmailSenders(emails);
  }, []);

  const getEmailAccount = useCallback(async (): Promise<string | null> => {
    const accountEmail = await pageInteractionRepo.getActiveTabEmailAccount();
    return accountEmail;
  }, []);

  const deleteSenders = useCallback(async (senderEmails: string[]) => {
    const accountEmail = await pageInteractionRepo.getActiveTabEmailAccount();
    await emailRepo.deleteSenders(senderEmails);
    await storageRepo.deleteSenders(senderEmails, accountEmail);
    setSenders((prevSenders) =>
      prevSenders.filter((sender) => !senderEmails.includes(sender.email))
    );
  }, []);

  const unsubscribeSenders = useCallback(async (senderEmails: string[]) => {
    return await emailRepo.unsubscribeSenders(senderEmails);
  }, []);

  const blockSender = useCallback(async (senderEmail: string) => {
    await emailRepo.blockSender(senderEmail);
  }, []);

  // Automatically load senders from storage when the component mounts
  useEffect(() => {
    reloadSenders();
  }, [reloadSenders]);

  return (
    <AppContext.Provider
      value={{
        senders,
        selectedSenders,
        loading,
        reloadSenders,
        setSelectedSenders,
        clearSelectedSenders,
        searchEmailSenders,
        getEmailAccount,
        deleteSenders,
        unsubscribeSenders,
        blockSender,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
