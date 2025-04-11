import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import './reloadButton.css'

export const ReloadButton = () => {

    return (
        <button className="reload-button" aria-label="Reload">
            <FontAwesomeIcon icon={faRotate} className="i" />
        </button>
    )
}