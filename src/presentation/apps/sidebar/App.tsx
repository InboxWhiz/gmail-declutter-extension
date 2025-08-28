import "./App.css";
import { useContext } from "react";
import { ActionButton } from "./components/actionButton.tsx";
import { ReloadButton } from "./components/reloadButton.tsx";
import { ModalPopup } from "./components/modalPopup.tsx";
import { SendersContainer } from "./components/sendersContainer.tsx";
import { DeclutterHeader } from "./components/header.tsx";
import { ModalProvider } from "./providers/modalContext.tsx";
import ThemeToggle from "./components/themeToggle.tsx";
import { AppProvider } from "../../providers/app_provider.tsx";
import { ThemeProvider } from "../../providers/ThemeProvider.tsx";
import { ActionsProvider } from "../../../_shared/providers/actionsContext.tsx";
import { ThemeContext } from "../../providers/themeContext.ts";

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <AppProvider>
      <ActionsProvider>
        <ThemeProvider>
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

              <SendersContainer />

              <ModalPopup />
            </div>
          </ModalProvider>
        </ThemeProvider>
      </ActionsProvider>
    </AppProvider>
  );
}

export default App;
