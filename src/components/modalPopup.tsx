import "./modalPopup.css";
import { useModal } from "../contexts/modalContext";
import { useSelectedSenders } from "../contexts/selectedSendersContext";
import { useSenders } from "../contexts/sendersContext";
import { searchEmailSenders, deleteSenders } from "../utils/actions";
import { ToggleSwitch } from "./toggleSwitch";
import { useState } from "react";

interface ConfirmProps {
  emailsNum: number;
  sendersNum: number;
}

const UnsubscribeConfirm = ({ emailsNum, sendersNum }: ConfirmProps) => {
  const { selectedSenders } = useSelectedSenders();
  const { reloadSenders } = useSenders();
  const { setModal } = useModal();

  const [deleteEmails, setDeleteEmails] = useState(true);

  const showEmails = () => {
    searchEmailSenders(Object.keys(selectedSenders));
  };

  const unsubscribeSenders = async () => {
    // Set modal to pending state
    setModal({ action: "unsubscribe", type: "pending" });

    // // Delete senders and remove them from selectedSenders
    // await deleteSenders(Object.keys(selectedSenders));
    // for (const senderEmail in selectedSenders) {
    //   setSelectedSenders((prev) => {
    //     const newSelected = { ...prev };
    //     delete newSelected[senderEmail];
    //     return newSelected;
    //   });
    // }

    // Set modal to success state
    setModal({ action: "unsubscribe", type: "success" });

    // Wait 1 sec then reload senders
    setTimeout(() => {
      reloadSenders();
    }, 1000);
  };

  return (
    <>
      <p>
        Are you sure you want to <b>unsubscribe</b> from <b>{sendersNum}</b> selected sender(s)?
      </p>

      <div className='delete-option'>
        <ToggleSwitch defaultChecked={true} onChange={setDeleteEmails} />
        <div style={{ "width": "10px" }}></div>
        <p className="note">Delete <b>{emailsNum} email(s)</b> from selected senders</p>
      </div>

      <button className="secondary" onClick={showEmails}>
        Show all emails
      </button>
      <button className="primary" onClick={unsubscribeSenders}>
        Confirm
      </button>
    </>
  );
};

const DeleteConfirm = ({ emailsNum, sendersNum }: ConfirmProps) => {
  const { selectedSenders, setSelectedSenders } = useSelectedSenders();
  const { reloadSenders } = useSenders();
  const { setModal } = useModal();

  const showEmails = () => {
    searchEmailSenders(Object.keys(selectedSenders));
  };

  const deleteEmails = async () => {
    // Set modal to pending state
    setModal({ action: "delete", type: "pending" });

    // Delete senders and remove them from selectedSenders
    await deleteSenders(Object.keys(selectedSenders));
    for (const senderEmail in selectedSenders) {
      setSelectedSenders((prev) => {
        const newSelected = { ...prev };
        delete newSelected[senderEmail];
        return newSelected;
      });
    }

    // Set modal to success state
    setModal({ action: "delete", type: "success" });

    // Wait 1 sec then reload senders
    setTimeout(() => {
      reloadSenders();
    }, 1000);
  };

  return (
    <>
      <p>
        Are you sure you want to <b>delete {emailsNum} emails</b> from{" "}
        <b>{sendersNum}</b> senders?
      </p>
      <p className="note">Note: This will not block or unsubscribe.</p>

      <button className="secondary" onClick={showEmails}>
        Show all emails
      </button>
      <button className="primary" onClick={deleteEmails}>
        Confirm
      </button>
    </>
  );
};

const DeletePending = () => {
  return (
    <>
      <p>Deleting emails...</p>
      <div style={{ height: "5px" }}></div>
      <div className="loader"></div>
    </>
  );
};

const DeleteSuccess = () => {
  return (
    <>
      <p>✅ Success!</p>
      <p>Selected senders have been deleted.</p>
      <p className="note">
        Note: You may need to reload your browser to see changes.
      </p>
    </>
  );
};

const NoSender = () => {
  const { setModal } = useModal();
  return (
    <>
      <p>Oops!</p>
      <p>You haven't selected a sender yet.</p>

      <div style={{ height: "20px" }}></div>

      <button className="primary" onClick={() => setModal(null)}>
        Go back
      </button>
    </>
  );
};

export const ModalPopup = () => {
  const { modal, setModal } = useModal();
  if (!modal) return null;

  const { action, type, extras } = modal;
  const id: string = action ? `${action}-${type}-modal` : `${type}-modal`;

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setModal(null);
    }
  };

  const getChild = (): React.ReactNode => {
    switch (true) {
      case action === "unsubscribe" && type === "confirm":
        return (
          <UnsubscribeConfirm
            emailsNum={extras!.emailsNum}
            sendersNum={extras!.sendersNum}
          />
        );
      case action === "delete" && type === "confirm":
        return (
          <DeleteConfirm
            emailsNum={extras!.emailsNum}
            sendersNum={extras!.sendersNum}
          />
        );
      case action === "delete" && type === "pending":
        return <DeletePending />;
      case action === "delete" && type === "success":
        return <DeleteSuccess />;
      case type === "no-sender":
        return <NoSender />;
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
      <div className="modal-content">{getChild()}</div>
    </div>
  );
};
