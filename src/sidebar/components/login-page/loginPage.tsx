import { GoogleAuthButton } from "./googleAuthButton.tsx";
import { getAssetUrl } from "../../../_shared/utils/utils";
import { useActions } from "../../providers/actionsContext.tsx";
import { useEffect, useState } from "react";

export function LoginPage() {
  const { getEmailAccount } = useActions();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getEmailAccount().then(setEmail);
  }, []);

  return (
    <div id="declutter-body" className="login">
      <div style={{ height: "70px" }}></div>
      <img
        src={getAssetUrl("assets/logo.svg")}
        alt="InboxWhiz Logo"
        height="200px"
      />
      <span style={{ textAlign: "center" }}>
        Please sign in to your Google account
        <br />
        to use InboxWhiz.
      </span>
      <div style={{ height: "30px" }}></div>
      <GoogleAuthButton onAuthSuccess={() => {}} />
      <span id="email-account">{email}</span>
    </div>
  );
}
