import "./App.css";
import { useContext } from "react";
// import { ActionButton } from "./components/actionButton.tsx";
import { ReloadButton } from "./components/reloadButton.tsx";
// import { ModalPopup } from "./components/modalPopup.tsx";
import { SendersContainer } from "./components/sendersContainer.tsx";
import { DeclutterHeader } from "./components/header.tsx";
// import { useActions } from "../_shared/providers/actionsContext.tsx";
// import { LoginPage } from "./components/login-page/loginPage.tsx";
// import { useLoggedIn } from "../_shared/providers/loggedInContext.tsx";
import { SelectedSendersProvider } from "./providers/selectedSendersContext.tsx";
// import { SendersProvider } from "./providers/sendersContext.tsx";
// import { ModalProvider } from "./providers/modalContext.tsx";
import { ThemeContext } from "../_shared/providers/themeContext.ts";
import ThemeToggle from "./components/themeToggle.tsx";
import { AppProvider } from "../presentation/providers/app_provider.tsx";

function App() {
  // const { loggedIn, setLoggedIn } = useLoggedIn();
  // const { isLoggedIn } = useActions();
  const { theme } = useContext(ThemeContext);

  // useEffect(() => {
  //   const updateSignInStatus = async () => {
  //     const loggedIn = await isLoggedIn();
  //     setLoggedIn(loggedIn);
  //   };

  //   updateSignInStatus();
  // });

  // if (!loggedIn) {
  //   return <LoginPage />;
  // } else {
  return (
    <AppProvider>
      <SelectedSendersProvider>
        {/* <SendersProvider> */}
        {/* <ModalProvider> */}
        <div id="declutter-body" className={theme}>
          <DeclutterHeader />

          <div className="button-bar">
            <div className="sender-actions">
              {/* <ActionButton id="unsubscribe-button" />
                <ActionButton id="delete-button" /> */}
            </div>

            <div style={{ display: "flex" }}>
              <ReloadButton />
              <ThemeToggle />
            </div>
          </div>

          <SendersContainer />

          {/* <ModalPopup /> */}
        </div>
        {/* </ModalProvider> */}
        {/* </SendersProvider> */}
      </SelectedSendersProvider>
    </AppProvider>
  );
  // }
}

export default App;
