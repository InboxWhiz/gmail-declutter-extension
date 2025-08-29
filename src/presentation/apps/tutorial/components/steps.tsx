import { getAssetUrl } from "../../../../utils";
import { SuccessIcon } from "./successIcon";

const openSidePanel = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.sidePanel.open({
      tabId: tabs[0]?.id,
    } as chrome.sidePanel.OpenOptions);
  });
};

const closeTutorial = () => {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id !== undefined) {
        chrome.tabs.sendMessage(tab.id, {
          action: "CLOSE_TUTORIAL",
        });
      }
    }
  );
};

export const WelcomeStep = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="step">
      <img
        src={getAssetUrl("images/icon-128.png", "../../../images/icon-128.png")}
        alt="Welcome"
        className="logo"
        height="100"
      />
      <h2 className="tutorial-header">Welcome to InboxWhiz!</h2>
      <p className="tutorial-note">Declutter your Gmail in seconds.</p>
      <button className="tutorial-btn" onClick={onNext}>
        Get started
      </button>
    </div>
  );
};

export const Step1 = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="step">
      <h2 className="tutorial-header">
        Go to Gmail and click the InboxWhiz icon
      </h2>
      <img
        src={getAssetUrl("assets/extension-button.png")}
        alt="Extension icon demo"
        className="tutorial-gif"
        width={400}
      />
      <button className="tutorial-btn" onClick={onNext}>
        Next
      </button>
    </div>
  );
};

export const Step2 = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="step">
      <h2 className="tutorial-header">See your top senders</h2>
      <img
        src={getAssetUrl("assets/top-senders.gif")}
        alt="Top Senders"
        className="tutorial-gif"
        height={400}
      />
      <button className="tutorial-btn" onClick={onNext}>
        Next
      </button>
    </div>
  );
};

export const Step3 = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="step">
      <h2 className="tutorial-header">
        Click Delete or Unsubscribe to clean up your inbox
      </h2>
      <img
        src={getAssetUrl("assets/unsubscribe.gif")}
        alt="Unsubscribe"
        className="tutorial-gif"
        height={400}
      />
      <button className="tutorial-btn" onClick={onNext}>
        Next
      </button>
    </div>
  );
};

export const Success = () => {
  return (
    <div className="step" style={{ height: "200px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ height: "10px" }}></div>
        <h2
          className="tutorial-header"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <SuccessIcon />
          You're all set!
        </h2>
      </div>
      <div style={{ height: "20px" }}></div>
      <p className="tutorial-note">You are ready to clean up your inbox.</p>

      <button className="tutorial-btn" onClick={() => { openSidePanel(); closeTutorial(); }}>
        Get Started
      </button>

      <div style={{ height: "10px" }}></div>
    </div>
  );
};

