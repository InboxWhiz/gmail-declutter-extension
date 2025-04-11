import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { useSenders } from '../contexts/sendersContext';
import './reloadButton.css';

export const ReloadButton = () => {
    const { reloadSenders } = useSenders();

    return (
        <button className="reload-button" aria-label="Reload" onClick={reloadSenders}>
            <FontAwesomeIcon icon={faRotate} className="i" />
        </button>
    )
}