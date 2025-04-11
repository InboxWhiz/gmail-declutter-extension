import React from 'react'
import './modalPopup.css'

const DeleteConfirm = () => {
    return (
        <>
            <p>
                Are you sure you want to
                <b>delete <span id="emails-num"></span> emails</b> from
                <b><span id="senders-num"></span></b> senders?
            </p>
            <p className="note">Note: This will not block or unsubscribe.</p>

            <button className="secondary show-emails">Show all emails</button>
            <button className="primary delete-emails close-modal">Confirm</button>
        </>
    )
}

const DeletePending = () => {
    return (
        <>
            <p>Deleting...</p>
            <div style={{ "height": "5px" }}></div>
            <div className="loader"></div>
        </>
    )
}

const DeleteSuccess = () => {
    return (
        <>
            <p>✅ Success!</p>
            <p>Selected senders have been deleted.</p>
            <p className="note">
                Note: You may need to reload your browser to see changes.
            </p>
        </>
    )
}

const noSender = () => {
    return (
        <>
            <p>Oops!</p>
            <p>You haven't selected a sender yet.</p>

            <div style={{ "height": "20px" }}></div>

            <button className="primary close-modal">Go back</button>
        </>
    )
}


interface ModalPopupProps {
    action?: string
    type: string
    children?: React.ReactNode

}

export const ModalPopup = ({ action, type }: ModalPopupProps) => {
    // action: delete, unsubscribe
    // type: confirm, pending, success, error, no-sender

    const id: string = action ? `${action}-${type}-modal` : `${type}-modal`
    let child: React.ReactNode;
    if (action === "delete" && type === "confirm") {
        child = <DeleteConfirm />
    } else if (action === "delete" && type === "pending") {
        child = <DeletePending />
    } else if (action === "delete" && type === "success") {
        child = <DeleteSuccess />
    } else if (type === "no-sender") {
        child = noSender()
    } else {
        child = <></>
    }


    return (
        <div id={id} className="modal">
            <div className="modal-content">
                {child}
            </div>
        </div>
    )
}

