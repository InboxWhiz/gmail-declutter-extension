import { ActionsProvider } from "../../_shared/providers/actionsContext";
import { ThemeProvider } from "../../_shared/providers/ThemeProvider";

export const AllGlobalProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeProvider>
        <ActionsProvider>{children}</ActionsProvider>
    </ThemeProvider>
  );
};
