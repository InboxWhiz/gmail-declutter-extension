import "./settingsModal.css";
import { useApp } from "../../../providers/app_provider";
import { useTheme } from "../../../providers/theme_provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTimes,
  faSun,
  faMoon,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  triggerRef,
}: SettingsModalProps) => {
  const { hiddenSenders, unhideSender } = useApp();
  const { setting: themeSetting, setSetting: setThemeSetting } = useTheme();
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && modalContentRef.current) {
      // When modal opens, focus the modal content
      modalContentRef.current.focus();
    } else if (!isOpen && triggerRef?.current) {
      // When modal closes, return focus to the trigger button
      triggerRef.current.focus();
    }
  }, [isOpen, triggerRef]);

  // Keyboard accessibility - close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
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
      <div
        className="settings-modal-content"
        ref={modalContentRef}
        tabIndex={-1}
      >
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
