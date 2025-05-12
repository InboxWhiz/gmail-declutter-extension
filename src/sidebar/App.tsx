import "./App.css";
import { ActionButton } from "./components/actionButton.tsx";
import { ReloadButton } from "./components/reloadButton.tsx";
import { ModalPopup } from "./components/modalPopup.tsx";
import { SendersContainer } from "./components/sendersContainer.tsx";
import { AllGlobalProviders } from "./providers/allGlobalProviders.tsx";
import { DeclutterHeader } from "./components/header.tsx";
import { GoogleAuthButton } from "./components/login-page/googleAuthButton.tsx";
import { LoginPage } from "./components/login-page/loginPage.tsx";

function App() {
  return (
    <AllGlobalProviders>
      {/* <div id="declutter-body">
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
      </div> */}
      <LoginPage />
    </AllGlobalProviders >
  );
}

export default App;
