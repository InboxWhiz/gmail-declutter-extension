import { ActionsProvider } from "../../_shared/providers/actionsContext";
import { LoggedInProvider } from "../../_shared/providers/loggedInContext";
import { ThemeProvider } from "../../_shared/providers/ThemeProvider";

export const AllGlobalProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeProvider>
      <LoggedInProvider>
        <ActionsProvider>{children}</ActionsProvider>
      </LoggedInProvider>
    </ThemeProvider>
  );
};
