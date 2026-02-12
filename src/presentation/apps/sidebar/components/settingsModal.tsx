import "./settingsModal.css";
import { useApp } from "../../../providers/app_provider";
import { useTheme } from "../../../providers/theme_provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTimes, faSun, faMoon, faDesktop } from "@fortawesome/free-solid-svg-icons";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { hiddenSenders, unhideSender } = useApp();
  const { setting: themeSetting, setSetting: setThemeSetting } = useTheme();

  if (!isOpen) return null;

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleUnhideAll = async () => {
    // Unhide all senders concurrently
    await Promise.all(hiddenSenders.map((email) => unhideSender(email)));
  };

  return (
    <div className="settings-modal" onClick={handleBackgroundClick}>
      <div className="settings-modal-content">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="theme-options">
            <button
              className={`theme-option ${themeSetting === "light" ? "active" : ""}`}
              onClick={() => setThemeSetting("light")}
              aria-label="Light mode"
            >
              <FontAwesomeIcon icon={faSun} />
              <span>Light</span>
            </button>
            <button
              className={`theme-option ${themeSetting === "dark" ? "active" : ""}`}
              onClick={() => setThemeSetting("dark")}
              aria-label="Dark mode"
            >
              <FontAwesomeIcon icon={faMoon} />
              <span>Dark</span>
            </button>
            <button
              className={`theme-option ${themeSetting === "system" ? "active" : ""}`}
              onClick={() => setThemeSetting("system")}
              aria-label="System theme"
            >
              <FontAwesomeIcon icon={faDesktop} />
              <span>System</span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Hidden Senders</h3>

          {hiddenSenders.length === 0 ? (
            <div className="empty-state">
              <p>No hidden senders</p>
              <p className="note">
                Use the Hide button to remove senders from your view.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden-senders-list">
                {hiddenSenders.map((email) => (
                  <div key={email} className="hidden-sender-item">
                    <span className="sender-email">{email}</span>
                    <button
                      className="unhide-button"
                      onClick={() => unhideSender(email)}
                      aria-label={`Unhide ${email}`}
                      title="Unhide"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </div>
                ))}
              </div>

              {hiddenSenders.length > 1 && (
                <button className="unhide-all-button" onClick={handleUnhideAll}>
                  Unhide All ({hiddenSenders.length})
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
