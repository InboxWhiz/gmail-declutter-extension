import "./App.css";
import { useTheme } from "../../providers/theme_provider.tsx";
import { ActionButton } from "./components/actionButton.tsx";
import { ModalPopup } from "./components/modalPopup.tsx";
import { SendersContainer } from "./components/sendersContainer.tsx";
import { DeclutterHeader } from "./components/header.tsx";
import { ModalProvider } from "./providers/modalContext.tsx";
import { AppProvider } from "../../providers/app_provider.tsx";
import { ThemeProvider } from "../../providers/theme_provider.tsx";
import { SearchInput } from "./components/searchInput.tsx";
import { useApp } from "../../providers/app_provider.tsx";
import { SettingsModal } from "./components/settingsModal.tsx";
import { useState, useRef } from "react";

function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </AppProvider>
  );
}

function AppWithTheme() {
  const { theme } = useTheme();
  const { searchTerm, setSearchTerm } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <ModalProvider>
      <div id="declutter-body" className={theme}>
        <DeclutterHeader
          onOpenSettings={() => setIsSettingsOpen(true)}
          settingsButtonRef={settingsButtonRef}
        />

        <div className="button-bar">
          <div className="sender-actions">
            <ActionButton id="unsubscribe-button" />
            <ActionButton id="delete-button" />
            <ActionButton id="hide-button" />
          </div>
        </div>

        <SearchInput value={searchTerm} onChange={setSearchTerm} />

        <SendersContainer />

        <ModalPopup />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          triggerRef={settingsButtonRef}
        />
      </div>
    </ModalProvider>
  );
}

export default App;
