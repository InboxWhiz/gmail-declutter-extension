import "./actionButton.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useSelectedSenders } from "../contexts/selectedSendersContext";
import { useModal } from "../contexts/modalContext";

export const ActionButton = ({ id }: { id: string }) => {
  const text: string = id == "unsubscribe-button" ? "Unsubscribe" : "Delete";
  const icon: IconProp = id == "unsubscribe-button" ? faBan : faTrash;
  const { selectedSenders } = useSelectedSenders();
  const { setModal } = useModal();

  const handleClick = () => {
    const selectedSenderKeys: string[] = Object.keys(selectedSenders);
    if (selectedSenderKeys.length > 0) {
      // open confirmation modal
      setModal({
        action: id === "unsubscribe-button" ? "unsubscribe" : "delete",
        type: "confirm",
        extras: {
          emailsNum: selectedSenderKeys.reduce(
            (sum, key) => sum + selectedSenders[key],
            0,
          ),
          sendersNum: selectedSenderKeys.length,
        },
      });
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
