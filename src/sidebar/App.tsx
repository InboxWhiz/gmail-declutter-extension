import "./App.css";
import { useEffect } from "react";
import { ActionButton } from "./components/actionButton.tsx";
import { ReloadButton } from "./components/reloadButton.tsx";
import { ModalPopup } from "./components/modalPopup.tsx";
import { SendersContainer } from "./components/sendersContainer.tsx";
import { DeclutterHeader } from "./components/header.tsx";
import { useActions } from "../_shared/providers/actionsContext.tsx";
import { LoginPage } from "./components/login-page/loginPage.tsx";
import { useLoggedIn } from "../_shared/providers/loggedInContext.tsx";
import { SelectedSendersProvider } from "./providers/selectedSendersContext.tsx";
import { SendersProvider } from "./providers/sendersContext.tsx";
import { ModalProvider } from "./providers/modalContext.tsx";

function App() {
  const { loggedIn, setLoggedIn } = useLoggedIn();
  const { isLoggedIn } = useActions();

  useEffect(() => {
    const updateSignInStatus = async () => {
      const loggedIn = await isLoggedIn();
      setLoggedIn(loggedIn);
    };

    updateSignInStatus();
  });

  if (!loggedIn) {
    return <LoginPage />;
  } else {
    return (
      <SelectedSendersProvider>
        <SendersProvider>
          <ModalProvider>
            <div id="declutter-body">
              <DeclutterHeader />

              <div className="button-bar">
                <div className="sender-actions">
                  <ActionButton id="unsubscribe-button" />
                  <ActionButton id="delete-button" />
                </div>

                <ReloadButton />
              </div>

              <SendersContainer />

              <ModalPopup />
            </div>
          </ModalProvider>
        </SendersProvider>
      </SelectedSendersProvider>
    );
  }
}

export default App;
