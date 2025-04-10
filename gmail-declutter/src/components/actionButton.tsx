import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan, faTrash } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import './actionButton.css'

export const ActionButton = ({ id }: { id: string }) => {
    const text: string = id == "unsubscribe-button" ? "Unsubscribe" : "Delete"
    const icon: IconProp = id == "unsubscribe-button" ? faBan : faTrash

    return (
        <button id={id} className="action-button" aria-label={text}>
            <FontAwesomeIcon icon={icon} className="i" />
            {text}
        </button>
    )
}