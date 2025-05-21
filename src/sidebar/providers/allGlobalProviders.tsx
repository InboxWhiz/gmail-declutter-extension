import { ActionsProvider } from "../../_shared/providers/actionsContext";
import { LoggedInProvider } from "./loggedInContext";
// import { ModalProvider } from "./modalContext";
// import { SelectedSendersProvider } from "./selectedSendersContext";
// import { SendersProvider } from "./sendersContext";

export const AllGlobalProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <LoggedInProvider>
      <ActionsProvider>{children}</ActionsProvider>
    </LoggedInProvider>
  );
};
