import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./header.css";
import { useEffect, useState } from "react";
import { useApp } from "../../presentation/providers/app_provider";

export function DeclutterHeader() {
  const { getEmailAccount } = useApp();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    getEmailAccount().then(setEmail);
  });

  return (
    <div className="declutter-header">
      <div className="header-icon">
        <FontAwesomeIcon icon={faUser} className="i" size="xs" />
      </div>
      {email}
    </div>
  );
}
