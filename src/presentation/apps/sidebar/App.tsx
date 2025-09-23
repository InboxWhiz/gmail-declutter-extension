import "./App.css";
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
