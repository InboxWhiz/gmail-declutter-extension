import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./header.css";

export function DeclutterHeader() {
    return (
        <div className="declutter-header">
            <div className="header-icon">
                <FontAwesomeIcon
                    icon={faUser}
                    className="i"
                    size="xs"
                />
            </div>
            happyasme11@email.com
        </div>
    );
}
