import { ActionsProvider } from "./actionsContext";
import { LoggedInProvider } from "./loggedInContext";
import { ModalProvider } from "./modalContext";
import { SelectedSendersProvider } from "./selectedSendersContext";
import { SendersProvider } from "./sendersContext";

export const AllGlobalProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <LoggedInProvider>
      <ActionsProvider>
        <SelectedSendersProvider>
          <SendersProvider>
            <ModalProvider>{children}</ModalProvider>
          </SendersProvider>
        </SelectedSendersProvider>
      </ActionsProvider>
    </LoggedInProvider>
  );
};
