import "./modalPopup.css";
import React, { useState } from "react";
import { useModal } from "../providers/modalContext";
import { ToggleOption } from "./toggleOption";
import { useUnsubscribeFlow } from "../utils/unsubscribeFlow";
import { useApp } from "../../../providers/app_provider";

interface ConfirmProps {
  emailsNum: number;
  sendersNum: number;
}

const UnsubscribeConfirm = ({ emailsNum, sendersNum }: ConfirmProps) => {
  const [deleteEmails, setDeleteEmails] = useState<boolean>(true);
  const [blockSenders, setBlockSenders] = useState<boolean>(false);

  const { selectedSenders, searchEmailSenders } = useApp();
  const { startUnsubscribeFlow } = useUnsubscribeFlow(
    deleteEmails,
    blockSenders
  );

  const showEmails = () => {
    searchEmailSenders(Object.keys(selectedSenders));
  };

  return (
    <>
      <p>
        Are you sure you want to <b>unsubscribe</b> from <b>{sendersNum}</b>{" "}
        selected sender(s)?
      </p>

      <div className="toggle-options">
        <ToggleOption
          label={
            <>
              Delete <b>{emailsNum} email(s)</b> from selected senders
            </>
          }
          defaultChecked={true}
          onChange={(checked) => setDeleteEmails(checked)}
        />

        <ToggleOption
          label="Also block senders"
          defaultChecked={false}
          onChange={(checked) => setBlockSenders(checked)}
        />
      </div>

      <button className="secondary" onClick={showEmails}>
        Show all emails
      </button>
      <button className="primary" onClick={startUnsubscribeFlow}>
        Confirm
      </button>
    </>
  );
};

const UnsubscribePending = ({ subtype }: { subtype: string }) => {
  let message: string;
  let step: number;

  switch (subtype) {
    case "finding-link":
      message = "Finding unsubscribe links...";
      step = 1;
      break;
    case "working":
      message = "Unsubscribing from senders...";
      step = 2;
      break;
    case "blocking":
      message = "Blocking sender...";
      step = 3;
      break;
    default:
      message = "Processing...";
      step = 1;
      break;
  }

  return (
    <>
      <p>{message}</p>
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill progress-indeterminate"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>
      <div className="modern-loader"></div>
    </>
  );
};

const UnsubscribeContinue = ({
  email,
  link,
  onContinue,
}: {
  email: string;
  link: string;
  onContinue: () => void;
}) => {
  const openLink = () => {
    window.open(link, "_blank");
  };
  return (
    <>
      <p>
        To stop getting messages from <b>{email}</b>, go to their website to
        unsubscribe.
      </p>
      <p className="note">
        Once you've finished on the website, click "Continue" to proceed.
      </p>

      <button className="primary" onClick={openLink}>
        Go to Website
      </button>
      <button className="secondary" onClick={onContinue}>
        Continue
      </button>
    </>
  );
};

const UnsubscribeError = ({
  email,
  onContinue,
}: {
  email: string;
  onContinue: () => void;
}) => {
  const { blockSender } = useApp();
  const { setModal } = useModal();

  const handleBlockSender = async () => {
    setModal({ action: "unsubscribe", type: "pending", subtype: "blocking" });
    await blockSender(email);
    onContinue(); // Continue to next sender after blocking
  };

  return (
    <>
      <p>
        Unable to unsubscribe from <b>{email}</b>.
      </p>
      <p>Block sender instead?</p>
      <button className="secondary" onClick={onContinue}>
        Don't block
      </button>
      <button className="primary" onClick={handleBlockSender}>
        Block
      </button>
    </>
  );
};

const UnsubscribeSuccess = () => {
  return (
    <>
      <div className="status-icon">✅</div>
      <p>
        <strong>Success!</strong>
      </p>
      <p>You have been unsubscribed from selected senders.</p>
      <p className="note">
        You may need to reload your browser to see changes.
      </p>
    </>
  );
};

const DeleteConfirm = ({ emailsNum, sendersNum }: ConfirmProps) => {
  const {
    reloadSenders,
    selectedSenders,
    setSelectedSenders,
    deleteSenders,
    searchEmailSenders,
  } = useApp();
  const { setModal } = useModal();

  const showEmails = () => {
    searchEmailSenders(Object.keys(selectedSenders));
  };

  const deleteEmails = async () => {
    try {
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
    } catch {
      setModal({ action: "delete", type: "error" });
    }
  };

  return (
    <>
      <p>
        Are you sure you want to <b>delete {emailsNum} email(s)</b> from{" "}
        <b>{sendersNum}</b> sender(s)?
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
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill progress-indeterminate" />
        </div>
      </div>
      <div className="modern-loader"></div>
    </>
  );
};

const DeleteSuccess = () => {
  return (
    <>
      <div className="status-icon">✅</div>
      <p>
        <strong>Success!</strong>
      </p>
      <p>Selected senders have been deleted.</p>
      <p className="note">
        You may need to reload your browser to see changes.
      </p>
    </>
  );
};

const DeleteError = () => {
  return (
    <>
      <p>❌ Error!</p>
      <p>There was an error deleting the selected senders.</p>
    </>
  );
};

const NoSender = () => {
  const { setModal } = useModal();
  return (
    <>
      <div className="status-icon">⚠️</div>
      <p>
        <strong>No Selection</strong>
      </p>
      <p>You haven't selected any senders yet.</p>
      <p className="note">Please select one or more senders to continue.</p>

      <button className="primary" onClick={() => setModal(null)}>
        Got it
      </button>
    </>
  );
};

export const ModalPopup = () => {
  const { modal, setModal } = useModal();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setModal(null);
      setIsClosing(false);
    }, 200);
  };

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClose();
    }
  }, []);

  // Add keyboard listener - must be before early return
  React.useEffect(() => {
    if (modal) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [modal, handleKeyDown]);

  if (!modal) return null;

  const { action, type, subtype, extras } = modal;
  const id: string = action ? `${action}-${type}-modal` : `${type}-modal`;

  const getChild = (): React.ReactNode => {
    switch (true) {
      case action === "unsubscribe" && type === "confirm":
        return (
          <UnsubscribeConfirm
            emailsNum={extras!.emailsNum}
            sendersNum={extras!.sendersNum}
          />
        );
      case action === "unsubscribe" && type === "pending":
        return <UnsubscribePending subtype={subtype!} />;
      case action === "unsubscribe" && type === "error":
        return (
          <UnsubscribeError
            email={extras!.email}
            onContinue={extras!.onContinue}
          />
        );
      case action === "unsubscribe" && type === "continue":
        return (
          <UnsubscribeContinue
            email={extras!.email}
            link={extras!.link}
            onContinue={extras!.onContinue}
          />
        );
      case action === "unsubscribe" && type === "success":
        return <UnsubscribeSuccess />;
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
      case action === "delete" && type === "error":
        return <DeleteError />;
      case type === "no-sender":
        return <NoSender />;
      default:
        return <></>;
    }
  };

  return (
    <div
      id={id}
      className={`modal-backdrop ${isClosing ? "closing" : ""}`}
      onClick={handleBackgroundClick}
    >
      <div className={`modal-container ${isClosing ? "closing" : ""}`}>
        <div className="modal-content">
          {/* Close button */}
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>

          {/* Modal content */}
          <div className="modal-body">{getChild()}</div>
        </div>
      </div>
    </div>
  );
};
