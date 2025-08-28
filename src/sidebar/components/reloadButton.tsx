import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../../presentation/providers/app_provider";
import "./reloadButton.css";

export const ReloadButton = () => {
  const { reloadSenders } = useApp();

  return (
    <button
      className="reload-button"
      aria-label="Reload"
      onClick={() => reloadSenders(true)}
    >
      <FontAwesomeIcon icon={faRotate} className="i" />
    </button>
  );
};
