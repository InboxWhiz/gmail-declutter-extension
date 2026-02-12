import "./actionButton.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faTrash, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useModal } from "../providers/modalContext";
import { useApp } from "../../../providers/app_provider";

export const ActionButton = ({ id }: { id: string }) => {
  let text: string;
  let icon: IconProp;
  let action: "unsubscribe" | "delete" | "hide";

  if (id === "unsubscribe-button") {
    text = "Unsubscribe";
    icon = faBan;
    action = "unsubscribe";
  } else if (id === "delete-button") {
    text = "Delete";
    icon = faTrash;
    action = "delete";
  } else {
    text = "Hide";
    icon = faEyeSlash;
    action = "hide";
  }

  const { selectedSenders, hideSenders } = useApp();
  const { setModal } = useModal();

  const handleClick = async () => {
    const selectedSenderKeys: string[] = Object.keys(selectedSenders);
    if (selectedSenderKeys.length > 0) {
      if (action === "hide") {
        // Hide doesn't need confirmation - just hide directly
        await hideSenders(selectedSenderKeys);
      } else {
        // Open confirmation modal for destructive actions
        setModal({
          action: action,
          type: "confirm",
          extras: {
            emailsNum: selectedSenderKeys.reduce(
              (sum, key) => sum + selectedSenders[key],
              0,
            ),
            sendersNum: selectedSenderKeys.length,
          },
        });
      }
    } else {
      // open no-senders modal
      setModal({ type: "no-sender" });
    }
  };

  return (
    <button
      id={id}
      className="action-button"
      aria-label={text}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={icon} className="i" />
      {text}
    </button>
  );
};
