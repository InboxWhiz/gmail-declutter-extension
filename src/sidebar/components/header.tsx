import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./header.css";
import { useActions } from "../../_shared/providers/actionsContext";
import { useEffect, useState } from "react";
import ThemeToggle from "./themeToggle";

export function DeclutterHeader() {
  const { getEmailAccount } = useActions();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getEmailAccount().then(setEmail);
  }, []); // Added empty dependency array to run only once

  return (
    <div className="declutter-header">
      <div className="header-left">
        <div className="header-icon">
          <FontAwesomeIcon icon={faUser} className="i" size="xs" />
        </div>
        <span className="email-text">{email}</span>
      </div>

      <div className="header-right">
        <ThemeToggle />
      </div>
    </div>
  );
}
