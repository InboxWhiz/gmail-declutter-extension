import { GoogleAuthButton } from "./googleAuthButton";

export const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="step">
            <img src="../images/icon-128.png" alt="Welcome" className="logo" height="100" />
            <h2 className="tutorial-header">Welcome to InboxWhiz!</h2>
            <p className="tutorial-note">Declutter your Gmail in seconds.</p>
            <button className="tutorial-btn primary" onClick={onNext}>Get started</button>
        </div>
    );
}

export const Step1 = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="step">
            <h2 className="tutorial-header">Go to Gmail and click the InboxWhiz icon</h2>
            <img src="./assets/extension-button.png" alt="Gmail Icon" className="tutorial-gif" width={400} />
            <button className="tutorial-btn primary" onClick={onNext}>Next</button>
        </div>
    );
}

export const Step2 = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="step">
            <h2 className="tutorial-header">See your top senders</h2>
            <img src="./assets/top-senders.gif" alt="Top Senders" className="tutorial-gif" height={400} />
            <button className="tutorial-btn primary" onClick={onNext}>Next</button>
        </div>
    );
}

export const Step3 = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="step">
            <h2 className="tutorial-header">Click Delete or Unsubscribe to clean up your inbox</h2>
            <img src="./assets/unsubscribe.gif" alt="Unsubscribe" className="tutorial-gif" height={400} />
            <button className="tutorial-btn primary" onClick={onNext}>Next</button>
        </div>
    );
}

export const Step4 = ({ onNext }: { onNext: () => void }) => {
    return (
        <div className="step">
            <img src="../images/icon-128.png" alt="Welcome" className="logo" height="100" />
            <h2 className="tutorial-header">Sign in to get started</h2>
            <GoogleAuthButton onAuthSuccess={onNext} />
        </div>
    );
}

export const Success = () => {
    return (
        <div className="step">
            <h2 className="tutorial-header">✅ Success!</h2>
            <p className="tutorial-note">You are ready to clean up your inbox.</p>
            <div style={{ height: "10px" }}></div>
        </div>
    );
}