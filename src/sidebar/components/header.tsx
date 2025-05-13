import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./header.css";
import { useActions } from "../providers/actionsContext";
import { useEffect, useState } from "react";

export function DeclutterHeader() {
  const { getEmailAccount } = useActions();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getEmailAccount().then(setEmail);
  }, []);

  return (
    <div className="declutter-header">
      <div className="header-icon">
        <FontAwesomeIcon icon={faUser} className="i" size="xs" />
      </div>
      {email}
    </div>
  );
}
