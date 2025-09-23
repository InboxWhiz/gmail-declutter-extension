import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo, // ADD THIS IMPORT
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
  // Add new search-related properties
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredSenders: Sender[];
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
  const [searchTerm, setSearchTerm] = useState<string>("");

  // - REPOS -

  const useMock = import.meta.env.VITE_USE_MOCK === "true";

  const emailRepo: EmailRepo = useMemo(
    () => (useMock ? new MockEmailRepo() : new BrowserEmailRepo()),
    [useMock]
  );
  const storageRepo: StorageRepo = useMemo(
    () => (useMock ? new MockStorageRepo() : new ChromeLocalStorageRepo()),
    [useMock]
  );
  const pageInteractionRepo: PageInteractionRepo = useMemo(
    () =>
      useMock ? new MockPageInteractionRepo() : new ChromePageInteractionRepo(),
    [useMock]
  );

  // - METHODS -

  const reloadSenders = useCallback(
    async (fetchNew = false) => {
      setLoading(true);
      try {
        const accountEmail =
          await pageInteractionRepo.getActiveTabEmailAccount();

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
    },
    [emailRepo, pageInteractionRepo, storageRepo]
  );

  const clearSelectedSenders = useCallback(() => {
    setSelectedSenders({});
  }, []);

  const searchEmailSenders = useCallback(
    (emails: string[]) => {
      pageInteractionRepo.searchEmailSenders(emails);
    },
    [pageInteractionRepo]
  );

  const getEmailAccount = useCallback(async (): Promise<string | null> => {
    const accountEmail = await pageInteractionRepo.getActiveTabEmailAccount();
    return accountEmail;
  }, [pageInteractionRepo]);

  const deleteSenders = useCallback(
    async (senderEmails: string[]) => {
      const accountEmail = await pageInteractionRepo.getActiveTabEmailAccount();
      await emailRepo.deleteSenders(senderEmails);
      await storageRepo.deleteSenders(senderEmails, accountEmail);
      setSenders((prevSenders) =>
        prevSenders.filter((sender) => !senderEmails.includes(sender.email))
      );
    },
    [emailRepo, pageInteractionRepo, storageRepo]
  );

  const unsubscribeSenders = useCallback(async (senderEmails: string[]) => {
    return await emailRepo.unsubscribeSenders(senderEmails);
  }, [emailRepo]);

  const blockSender = useCallback(async (senderEmail: string) => {
    await emailRepo.blockSender(senderEmail);
  }, [emailRepo]);

  // Add filtered senders computation
  const filteredSenders = useMemo(() => {
    if (!searchTerm.trim()) {
      return senders;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return senders.filter((sender) => {
      const matchesEmail = sender.email.toLowerCase().includes(lowerSearchTerm);
      const matchesName = Array.from(sender.names).some((name) =>
        name.toLowerCase().includes(lowerSearchTerm)
      );
      return matchesEmail || matchesName;
    });
  }, [senders, searchTerm]);

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
        searchTerm,
        setSearchTerm,
        filteredSenders,
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
