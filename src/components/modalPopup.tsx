import "./modalPopup.css";
import { useState } from "react";
import { useModal } from "../providers/modalContext";
import { useSelectedSenders } from "../providers/selectedSendersContext";
import { useSenders } from "../providers/sendersContext";
import { useActions } from "../providers/actionsContext";
import { ToggleOption } from "./toggleOption";

function useUnsubscribeFlow(deleteEmails: boolean, blockSenders: boolean) {
  const { getUnsubscribeLink, deleteSenders, blockSender } = useActions();
  const { setModal } = useModal();
  const { reloadSenders } = useSenders();
  const { selectedSenders, clearSelectedSenders } = useSelectedSenders();

  // Kick off the flow
  const startUnsubscribeFlow = () => {
    processNext(0);
  };

  // End the flow
  const endUnsubscribeFlow = async () => {
    // Delete senders if needed
    if (deleteEmails) {
      setModal({ action: "delete", type: "pending" });
      await deleteSenders(Object.keys(selectedSenders));
    }

    // Block senders if needed
    if (blockSenders) {
      setModal({ action: "unsubscribe", type: "pending", subtype: "blocking" });
      for (const email of Object.keys(selectedSenders)) {
        await blockSender(email);
      }
    }

    // Deselect all senders
    clearSelectedSenders();

    // Show success modal and refresh senders
    setModal({ action: "unsubscribe", type: "success" });
    reloadSenders();
  };

  // Process one sender at `i`
  const processNext = async (i: number) => {
    const senders = Object.keys(selectedSenders);

    if (i >= senders.length) {
      endUnsubscribeFlow();
      return;
    }

    const email = senders[i];
    try {
      setModal({
        action: "unsubscribe",
        type: "pending",
        subtype: "finding-link",
      });
      const link = await getUnsubscribeLink(email);

      if (link) {
        window.open(link, "_blank");
        setModal({
          action: "unsubscribe",
          type: "continue",
          extras: {
            email,
            link,
            onContinue: () => {
              processNext(i + 1);
            },
          },
        });
      } else {
        throw new Error("No link");
      }
    } catch {
      setModal({
        action: "unsubscribe",
        type: "error",
        extras: {
          email,
          onContinue: () => {
            processNext(i + 1);
          },
        },
      });
    }
  };

  return { startUnsubscribeFlow: startUnsubscribeFlow };
}

interface ConfirmProps {
  emailsNum: number;
  sendersNum: number;
}

const UnsubscribeConfirm = ({ emailsNum, sendersNum }: ConfirmProps) => {
  const [deleteEmails, setDeleteEmails] = useState<boolean>(true);
  const [blockSenders, setBlockSenders] = useState<boolean>(false);

  const { searchEmailSenders } = useActions();
  const { selectedSenders } = useSelectedSenders();
  const { startUnsubscribeFlow } = useUnsubscribeFlow(deleteEmails, blockSenders);

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
          label={<>Delete <b>{emailsNum} email(s)</b> from selected senders</>}
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
  const message =
    subtype === "finding-link"
      ? "Finding unsubscribe links..."
      : "Blocking sender...";
  return (
    <>
      <p>{message}</p>
      <div style={{ height: "5px" }}></div>
      <div className="loader"></div>
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
  const reopenLink = () => {
    window.open(link, "_blank");
  };
  return (
    <>
      <p>
        Unsubscribe link for <b>{email}</b> found.
      </p>
      <p className="note">
        To stop getting messages from <b>{email}</b>, go to their website to unsubscribe.
      </p>

      <button className="secondary" onClick={reopenLink}>
        Reopen Link
      </button>
      <button className="primary" onClick={onContinue}>
        Continue
      </button>
    </>
  );
};

const UnsubscribeSuccess = () => {
  return (
    <>
      <p>✅ Success!</p>
      <p>You have been unsubscribed from selected senders.</p>
      <p className="note">
        Note: You may need to reload your browser to see changes.
      </p>
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
  const { blockSender } = useActions();
  const { setModal } = useModal();

  const handleBlockSender = async () => {
    setModal({ action: "unsubscribe", type: "pending", subtype: "blocking" });
    await blockSender(email);
    onContinue(); // Continue to next sender after blocking
  };

  return (
    <>
      <p>
        Unable to find unsubscribe link for <b>{email}</b>.
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

const DeleteConfirm = ({ emailsNum, sendersNum }: ConfirmProps) => {
  const { searchEmailSenders, deleteSenders } = useActions();
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

  const { action, type, subtype, extras } = modal;
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
