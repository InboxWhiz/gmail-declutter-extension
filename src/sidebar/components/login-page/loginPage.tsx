import { GoogleAuthButton } from "./googleAuthButton.tsx";

export function LoginPage() {
  return (
      <div id="declutter-body" className="login">
        <div style={{ height: "70px" }}></div>
        <img src="./assets/logo.svg" alt="InboxWhiz Logo" height="200px"/>
        <span style={{ textAlign: "center"}}>Please sign in to your Google account<br/>to use InboxWhiz.</span>
        <div style={{ height: "30px" }}></div>
        <GoogleAuthButton onAuthSuccess={() => {}} />
        <span id="email-account">happyasme11@gmail.com</span>
      </div>
  );
}