import "./actionButton.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faTrash,
  faSpinner,
  faCheck,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useModal } from "../providers/modalContext";
import { useApp } from "../../../providers/app_provider";
import { useState, useEffect } from "react";

type ButtonState = "idle" | "loading" | "success" | "error";

export const ActionButton = ({ id }: { id: string }) => {
  const text: string = id == "unsubscribe-button" ? "Unsubscribe" : "Delete";
  const icon: IconProp = id == "unsubscribe-button" ? faBan : faTrash;
  const { selectedSenders } = useApp();
  const { setModal } = useModal();
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const selectedCount = Object.keys(selectedSenders).length;
  const isDisabled = selectedCount === 0 || buttonState === "loading";

  // Reset button state when selection changes
  useEffect(() => {
    if (buttonState !== "idle" && buttonState !== "loading") {
      const timer = setTimeout(() => setButtonState("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [buttonState]);

  const handleClick = () => {
    if (isDisabled) return;

    const selectedSenderKeys: string[] = Object.keys(selectedSenders);
    if (selectedSenderKeys.length > 0) {
      setButtonState("loading");

      // Simulate processing time for demo
      setTimeout(() => {
        setButtonState("success");
      }, 1500);

      // open confirmation modal
      setModal({
        action: id === "unsubscribe-button" ? "unsubscribe" : "delete",
        type: "confirm",
        extras: {
          emailsNum: selectedSenderKeys.reduce(
            (sum, key) => sum + selectedSenders[key],
            0
          ),
          sendersNum: selectedSenderKeys.length,
        },
      });
    } else {
      // open no-senders modal
      setModal({ type: "no-sender" });
    }
  };

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <>
            <FontAwesomeIcon icon={faSpinner} className="i spinner" />
            Processing...
          </>
        );
      case "success":
        return (
          <>
            <FontAwesomeIcon icon={faCheck} className="i success-icon" />
            {id === "unsubscribe-button" ? "Unsubscribed!" : "Deleted!"}
          </>
        );
      case "error":
        return (
          <>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="i error-icon"
            />
            Failed
          </>
        );
      default:
        return (
          <>
            <FontAwesomeIcon icon={icon} className="i" />
            {selectedCount > 0 ? `${text} (${selectedCount})` : text}
          </>
        );
    }
  };

  return (
    <button
      id={id}
      className={`action-button ${buttonState} ${isDisabled ? "disabled" : ""}`}
      aria-label={text}
      onClick={handleClick}
      disabled={isDisabled}
    >
      <span className="button-content">{getButtonContent()}</span>
      <div className="button-ripple"></div>
    </button>
  );
};
