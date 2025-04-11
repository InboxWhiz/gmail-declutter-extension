import './modalPopup.css'
import { useModal } from '../contexts/modalContext'
import { useSelectedSenders } from '../contexts/selectedSendersContext'
import { searchEmailSenders } from '../utils/actions'

interface DeleteConfirmProps {
    close: () => void
    emailsNum: number
    sendersNum: number
}

const DeleteConfirm = ({ close, emailsNum, sendersNum }: DeleteConfirmProps) => {
    const { selectedSenders } = useSelectedSenders();
    const showEmails = () => { searchEmailSenders(Object.keys(selectedSenders)) }

    return (
        <>
            <p>
                Are you sure you want to <b>delete {emailsNum} emails</b> from <b>{sendersNum}</b> senders?
            </p>
            <p className="note">Note: This will not block or unsubscribe.</p>

            <button className="secondary" onClick={showEmails}>Show all emails</button>
            <button className="primary delete-emails" onClick={close}>Confirm</button>
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

const NoSender = ({ close }: { close: () => void }) => {
    return (
        <>
            <p>Oops!</p>
            <p>You haven't selected a sender yet.</p>

            <div style={{ "height": "20px" }}></div>

            <button className="primary" onClick={() => close()}>Go back</button>
        </>
    )
}


export const ModalPopup = () => {
    const { modal, setModal } = useModal();
    if (!modal) return null;

    const { action, type, extras } = modal;
    const id: string = action ? `${action}-${type}-modal` : `${type}-modal`

    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            setModal(null);
        }
    };

    const getChild = (): React.ReactNode => {
        switch (true) {
            case action === "delete" && type === "confirm":
                return <DeleteConfirm
                    close={() => setModal(null)}
                    emailsNum={extras!.emailsNum}
                    sendersNum={extras!.sendersNum}
                />;
            case action === "delete" && type === "pending":
                return <DeletePending />;
            case action === "delete" && type === "success":
                return <DeleteSuccess />;
            case type === "no-sender":
                return <NoSender close={() => setModal(null)} />;
            default:
                return <></>;
        }
    };

    return (
        <div
            id={id}
            className="modal"
            style={{ display: "block" }}
            onClick={handleBackgroundClick}
        >
            <div className="modal-content">
                {getChild()}
            </div>
        </div>
    )
}

