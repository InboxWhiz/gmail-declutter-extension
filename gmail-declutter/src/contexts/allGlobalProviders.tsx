import { ModalProvider } from "./modalContext";
import { SelectedSendersProvider } from "./selectedSendersContext";

export const AllGlobalProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SelectedSendersProvider>
            <ModalProvider>
                {children}
            </ModalProvider>
        </SelectedSendersProvider>
    );
};