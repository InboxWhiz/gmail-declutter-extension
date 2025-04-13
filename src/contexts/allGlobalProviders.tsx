import { ModalProvider } from "./modalContext";
import { SelectedSendersProvider } from "./selectedSendersContext";
import { SendersProvider } from "./sendersContext";

export const AllGlobalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SelectedSendersProvider>
            <SendersProvider>
                <ModalProvider>
                    {children}
                </ModalProvider>
            </SendersProvider>
        </SelectedSendersProvider>
    );
};