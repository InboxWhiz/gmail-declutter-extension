import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./header.css";
import { useActions } from "../providers/actionsContext";

export function DeclutterHeader() {
    const { getEmailAccount } = useActions();
    
    return (
        <div className="declutter-header">
            <div className="header-icon">
                <FontAwesomeIcon
                    icon={faUser}
                    className="i"
                    size="xs"
                />
            </div>
            {getEmailAccount()}
        </div>
    );
}
