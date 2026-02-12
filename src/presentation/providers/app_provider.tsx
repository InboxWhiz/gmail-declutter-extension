// src/presentation/providers/app_provider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Sender } from "../../domain/entities/sender";
import { ChromeLocalStorageRepo } from "../../data/repositories/chrome_local_storage_repo";
import { BrowserEmailRepo } from "../../data/repositories/browser_email_repo";
import { ChromePageInteractionRepo } from "../../data/repositories/chrome_page_interaction_repo";
// NOTE: Assuming FetchProgress is correctly exported from "../../domain/repositories/email_repo"
import { EmailRepo } from "../../domain/repositories/email_repo";
import { FetchProgress } from "../../domain/types/progress";
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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredSenders: Sender[];
  fetchProgress: FetchProgress | null;
  cancelFetch: () => void;
  hiddenSenders: string[];
  hideSenders: (emails: string[]) => Promise<void>;
  unhideSender: (email: string) => Promise<void>;
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
  const [fetchProgress, setFetchProgress] = useState<FetchProgress | null>(
    null,
  );
  const [hiddenSenders, setHiddenSenders] = useState<string[]>([]);

  // - REPOS -
  const useMock = import.meta.env.VITE_USE_MOCK === "true";

  const emailRepo: EmailRepo = useMemo(() => {
    const repo = useMock ? new MockEmailRepo() : new BrowserEmailRepo();

    // Set up progress callback for both mock and production
    if (repo.setProgressCallback) {
      repo.setProgressCallback((progress) => {
        setFetchProgress(progress);
      });
    }
    return repo;
  }, [useMock]);

  const storageRepo: StorageRepo = useMemo(
    () => (useMock ? new MockStorageRepo() : new ChromeLocalStorageRepo()),
    [useMock],
  );
  const pageInteractionRepo: PageInteractionRepo = useMemo(
    () =>
      useMock ? new MockPageInteractionRepo() : new ChromePageInteractionRepo(),
    [useMock],
  );

  // - METHODS -

  const reloadSenders = useCallback(
    async (fetchNew = false) => {
      setLoading(true);
      setFetchProgress(null);
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
        setFetchProgress(null);
      }
    },
    [emailRepo, pageInteractionRepo, storageRepo],
  );

  const cancelFetch = useCallback(() => {
    if (emailRepo.cancelFetch) {
      emailRepo.cancelFetch();
    }
    setFetchProgress(null);
  }, [emailRepo]);

  const clearSelectedSenders = useCallback(() => {
    setSelectedSenders({});
  }, []);

  const searchEmailSenders = useCallback(
    (emails: string[]) => {
      pageInteractionRepo.searchEmailSenders(emails);
    },
    [pageInteractionRepo],
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
        prevSenders.filter((sender) => !senderEmails.includes(sender.email)),
      );
    },
    [emailRepo, pageInteractionRepo, storageRepo],
  );

  const unsubscribeSenders = useCallback(
    async (senderEmails: string[]) => {
      return await emailRepo.unsubscribeSenders(senderEmails);
    },
    [emailRepo],
  );

  const blockSender = useCallback(
    async (senderEmail: string) => {
      await emailRepo.blockSender(senderEmail);
    },
    [emailRepo],
  );

  const hideSenders = useCallback(
    async (emails: string[]) => {
      const accountEmail = await pageInteractionRepo.getActiveTabEmailAccount();
      await storageRepo.storeHiddenSenders(emails, accountEmail);
      setHiddenSenders((prev) => Array.from(new Set([...prev, ...emails])));
      // Clear selection after hiding
      setSelectedSenders({});
    },
    [pageInteractionRepo, storageRepo],
  );

  const unhideSender = useCallback(
    async (email: string) => {
      const accountEmail = await pageInteractionRepo.getActiveTabEmailAccount();
      await storageRepo.removeHiddenSenders([email], accountEmail);
      setHiddenSenders((prev) => prev.filter((e) => e !== email));
    },
    [pageInteractionRepo, storageRepo],
  );

  // Add filtered senders computation
  const filteredSenders = useMemo(() => {
    let result = senders;

    // Always filter out hidden senders
    if (hiddenSenders.length > 0) {
      result = result.filter((sender) => !hiddenSenders.includes(sender.email));
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((sender) => {
        const matchesEmail = sender.email
          .toLowerCase()
          .includes(lowerSearchTerm);
        const matchesName = Array.from(sender.names).some((name) =>
          name.toLowerCase().includes(lowerSearchTerm),
        );
        return matchesEmail || matchesName;
      });
    }

    return result;
  }, [senders, searchTerm, hiddenSenders]);

  // Automatically load senders from storage when the component mounts
  useEffect(() => {
    reloadSenders();
  }, [reloadSenders]);

  // Load hidden senders when the component mounts
  useEffect(() => {
    const loadHiddenSenders = async () => {
      try {
        const accountEmail =
          await pageInteractionRepo.getActiveTabEmailAccount();
        const hidden = await storageRepo.readHiddenSenders(accountEmail);
        setHiddenSenders(hidden);
      } catch (error) {
        console.error("Failed to load hidden senders:", error);
      }
    };
    loadHiddenSenders();
  }, [pageInteractionRepo, storageRepo]);

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
        fetchProgress,
        cancelFetch,
        hiddenSenders,
        hideSenders,
        unhideSender,
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
