import { faUser, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./header.css";
import { useEffect, useState } from "react";
import { useApp } from "../../../providers/app_provider";
import { ReloadButton } from "./reloadButton";

interface DeclutterHeaderProps {
  onOpenSettings: () => void;
  settingsButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function DeclutterHeader({
  onOpenSettings,
  settingsButtonRef,
}: DeclutterHeaderProps) {
  const { getEmailAccount } = useApp();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const email = await getEmailAccount();
      setEmail(email);
    })();
  }, [getEmailAccount]);

  return (
    <div className="declutter-header">
      <div className="header-left">
        <ReloadButton />
      </div>
      <button
        ref={settingsButtonRef}
        className="settings-button"
        onClick={onOpenSettings}
        aria-label="Settings"
        title="Settings"
      >
        <FontAwesomeIcon icon={faGear} />
      </button>
      <div className="header-icon">
        <FontAwesomeIcon icon={faUser} className="i" size="xs" />
      </div>
      <div className="email-text">{email}</div>
    </div>
  );
}
