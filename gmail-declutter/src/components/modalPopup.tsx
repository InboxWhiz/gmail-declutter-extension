import React, { useState } from 'react'
import './modalPopup.css'

interface ModalBodyProps {
    close: () => void
}

const DeleteConfirm = ({ close }: ModalBodyProps) => {
    return (
        <>
            <p>
                Are you sure you want to
                <b>delete <span id="emails-num"></span> emails</b> from
                <b><span id="senders-num"></span></b> senders?
            </p>
            <p className="note">Note: This will not block or unsubscribe.</p>

            <button className="secondary show-emails">Show all emails</button>
            <button className="primary delete-emails" onClick={() => close()}>Confirm</button>
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

const NoSender = ({ close }: ModalBodyProps) => {
    return (
        <>
            <p>Oops!</p>
            <p>You haven't selected a sender yet.</p>

            <div style={{ "height": "20px" }}></div>

            <button className="primary" onClick={() => close()}>Go back</button>
        </>
    )
}


interface ModalPopupProps {
    action?: string
    type: string
}

export const ModalPopup = ({ action, type }: ModalPopupProps) => {
    // action: delete, unsubscribe
    // type: confirm, pending, success, error, no-sender

    const id: string = action ? `${action}-${type}-modal` : `${type}-modal`

    const [visible, setVisible] = useState(false);
    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            setVisible(false);
        }
    };

    const getChild = (): React.ReactNode => {
        switch (true) {
            case action === "delete" && type === "confirm":
                return <DeleteConfirm close={() => setVisible(false)} />;
            case action === "delete" && type === "pending":
                return <DeletePending />;
            case action === "delete" && type === "success":
                return <DeleteSuccess />;
            case type === "no-sender":
                return <NoSender close={() => setVisible(false)} />;
            default:
                return <></>;
        }
    };

    return (
        <div
            id={id}
            className="modal"
            style={{ display: visible ? "block" : "none" }}
            onClick={handleBackgroundClick}
        >
            <div className="modal-content">
                {getChild()}
            </div>
        </div>
    )
}

