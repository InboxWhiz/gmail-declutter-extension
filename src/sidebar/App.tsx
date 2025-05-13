import "./App.css";
import { useState, useEffect } from "react";
import { ActionButton } from "./components/actionButton.tsx";
import { ReloadButton } from "./components/reloadButton.tsx";
import { ModalPopup } from "./components/modalPopup.tsx";
import { SendersContainer } from "./components/sendersContainer.tsx";
import { DeclutterHeader } from "./components/header.tsx";
import { useActions } from "./providers/actionsContext.tsx";
import { LoginPage } from "./components/login-page/loginPage.tsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const { isLoggedIn: checkLoggedIn } = useActions();

  useEffect(() => {
    const updateSignInStatus = async () => {
      const loggedIn = await checkLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    updateSignInStatus();
  }, [checkLoggedIn]);

  if (!isLoggedIn) {
    return <LoginPage />;
  } else {
    return (
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
    );
  }
}

export default App;
