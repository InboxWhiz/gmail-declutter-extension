// import { GoogleAuthButton } from "./googleAuthButton.tsx";
// import { useActions } from "../../../_shared/providers/actionsContext.tsx";
// import { useEffect, useState } from "react";
import { useTheme } from "../../../_shared/providers/ThemeContex";
import { getAssetUrl } from "../../../_shared/utils/utils";

export function LoginPage() {
  // const { getEmailAccount } = useActions();
  // const [email, setEmail] = useState<string | null>(null);

  // useEffect(() => {
  //   getEmailAccount().then(setEmail);
  // }, []);

  const { theme } = useTheme();

  return (
    <div id="declutter-body" className={`login-container ${theme}`}>
      <img
        src={getAssetUrl("assets/logo.svg")}
        alt="InboxWhiz Logo"
        height="200px"
      />
      <span style={{ textAlign: "center" }}>
        Please sign in to Chrome with the
        <br />
        same Google account you want to
        <br />
        to use InboxWhiz with.
      </span>
      <div style={{ height: "70px" }}></div>
      {/* <GoogleAuthButton expectedEmailAddress={email ?? ""} />
      <span id="email-account">{email}</span> */}
    </div>
  );
}
