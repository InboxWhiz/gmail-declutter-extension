import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Sender } from '../../domain/entities/sender';
import { ChromeLocalStorageRepo } from '../../data/repositories/chrome_local_storage_repo';
import { BrowserAuthRepo } from '../../data/repositories/browser_auth_repo';

type AppContextType = {
  senders: Sender[];
  selectedSenders: Record<string, number>;
  loading: boolean;
  reloadSenders: (fetchNew?: boolean) => void;
  setSelectedSenders: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  clearSelectedSenders: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [selectedSenders, setSelectedSenders] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const storageRepo = new ChromeLocalStorageRepo();
  const authRepo = new BrowserAuthRepo();

  const reloadSenders = useCallback(async (fetchNew = false) => {
    setLoading(true);
    try {
      const accountEmail = await authRepo.getActiveTabEmailAccount();

      if (fetchNew) {
        const fetchedSenders = await _getSendersFromPage();
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


  // Automatically load senders from storage when the component mounts
  useEffect(() => {
    reloadSenders();
  }, [reloadSenders]);

  const _getSendersFromPage = async () => {
    const response = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "FETCH_SENDERS",
          }, (response) => {
            console.log(`response: ${JSON.stringify(response)}`);
            resolve(response.data);
          });
        } else {
          console.error("No active tab found.");
          resolve(null);
        }
      });
    });
    const senders = response as Sender[];
    console.log(`senders: ${senders}`);
    senders.sort((a, b) => b.emailCount - a.emailCount);
    return senders;
  };

  return (
    <AppContext.Provider value={{ senders, selectedSenders, loading, reloadSenders, setSelectedSenders, clearSelectedSenders }}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
