import "./senderLine.css";
import { useSelectedSenders } from "../providers/selectedSendersContext";
import { useActions } from "../providers/actionsContext";

interface SenderLineProps {
  senderName: string;
  senderEmail: string;
  senderCount: number;
}

export const SenderLine = ({
  senderName,
  senderEmail,
  senderCount,
}: SenderLineProps) => {
  const { selectedSenders, setSelectedSenders } = useSelectedSenders();
  const { searchEmailSenders } = useActions();

  const selectLine = () => {
    setSelectedSenders((prev) => {
      const newSelected = { ...prev };
      if (!(senderEmail in newSelected)) {
        newSelected[senderEmail] = senderCount;
      } else {
        delete newSelected[senderEmail];
      }
      return newSelected;
    });
  };

  return (
    <div
      className={
        selectedSenders[senderEmail] ? "sender-line selected" : "sender-line"
      }
    >
      <div className="begin">
        <div>
          <input
            type="checkbox"
            onChange={selectLine}
            checked={Boolean(selectedSenders[senderEmail])}
          />
        </div>
        <div className="sender-details">
          <span className="sender-name">{senderName}</span>
          <span
            className="sender-email"
            onClick={() => searchEmailSenders([senderEmail])}
          >
            {senderEmail}
          </span>
        </div>
      </div>
      <div className="email-count">
        <span>{senderCount}</span>
      </div>
    </div>
  );
};
