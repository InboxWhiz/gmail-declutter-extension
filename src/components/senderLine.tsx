import "./senderLine.css";
import { useState } from "react";
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
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const { selectedSenders, setSelectedSenders } = useSelectedSenders();
  const { searchEmailSenders } = useActions();

  const selectLine = () => {
    setIsSelected(!isSelected);

    setSelectedSenders((prev) => {
      const newSelected = { ...prev };
      if (!isSelected) {
        newSelected[senderEmail] = senderCount;
      } else {
        delete newSelected[senderEmail];
      }
      return newSelected;
    });
  };

  return (
    <div className={Boolean(selectedSenders[senderEmail]) ? "sender-line selected" : "sender-line"}>
      <div className="begin">
        <div>
          <input type="checkbox" onChange={selectLine} checked={Boolean(selectedSenders[senderEmail])} />
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
