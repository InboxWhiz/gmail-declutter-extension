import "./App.css";
import { useState } from 'react';
import { useTheme } from "../../providers/theme_provider.tsx";
import { ActionButton } from "./components/actionButton.tsx";
import { ReloadButton } from "./components/reloadButton.tsx";
import { ModalPopup } from "./components/modalPopup.tsx";
import { SendersContainer } from "./components/sendersContainer.tsx";
import { DeclutterHeader } from "./components/header.tsx";
import { ModalProvider } from "./providers/modalContext.tsx";
import ThemeToggle from "./components/themeToggle.tsx";
import { AppProvider } from "../../providers/app_provider.tsx";
import { ThemeProvider } from "../../providers/theme_provider.tsx";
import { SearchInput } from "./components/searchInput.tsx";
import { useApp } from "../../providers/app_provider.tsx";

function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </AppProvider>
  );
}

const handleArchive = async (sender: string) => {
  setIsArchiving(true);
  setArchiveStatus('');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'archiveEmails',
      data: { sender }
    });

    if (response.success) {
      setArchiveStatus(`Successfully archived ${response.result.archivedCount} emails`);
      // Optionally refresh the sender list
      await refreshSenders();
    } else {
      setArchiveStatus(`Error: ${response.error}`);
    }
  } catch (error) {
    console.error('Archive error:', error);
    setArchiveStatus('Failed to archive emails');
  } finally {
    setIsArchiving(false);
  }
};

// Add Archive button in your table row JSX
// (Next to your Delete/Unsubscribe buttons)
<button
  onClick={() => handleArchive(sender.email)}
  disabled={isArchiving}
  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm disabled:opacity-50"
  title="Archive all emails from this sender"
>
  {isArchiving ? (
    
      
        
        
      
      Archiving...
    
  ) : (
    '📦 Archive'
  )}


function AppWithTheme() {
  const { theme } = useTheme();
  const { searchTerm, setSearchTerm } = useApp();

  return (
    <ModalProvider>
      <div id="declutter-body" className={theme}>
        <DeclutterHeader />

        <div className="button-bar">
          <div className="sender-actions">
            <ActionButton id="unsubscribe-button" />
            <ActionButton id="delete-button" />
          </div>

          <div style={{ display: "flex" }}>
            <ReloadButton />
            <ThemeToggle />
          </div>
        </div>

        <SearchInput value={searchTerm} onChange={setSearchTerm} />

        <SendersContainer />

        <ModalPopup />
      </div>
    </ModalProvider>
  );
}

export default App;
