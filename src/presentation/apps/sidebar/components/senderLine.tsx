import "./senderLine.css";
import { useApp } from "../../../providers/app_provider";
import { useState } from "react";

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
  const { selectedSenders, setSelectedSenders, searchEmailSenders } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const isSelected = Boolean(selectedSenders[senderEmail]);

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

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={`sender-line sender-line-real ${isSelected ? "selected" : ""} ${isHovered ? "hovered" : ""} ${isPressed ? "pressed" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={selectLine}
    >
      <div className="sender-line-content">
        <div className="checkbox-container">
          <input
            type="checkbox"
            className="custom-checkbox"
            onChange={selectLine}
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="checkbox-checkmark">
            <svg viewBox="0 0 24 24" className="checkmark-icon">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>

        <div className="sender-avatar">
          <span className="avatar-text">{getInitials(senderName)}</span>
        </div>

        <div className="sender-details">
          <span className="sender-name">{senderName}</span>
          <span
            className="sender-email"
            onClick={(e) => {
              e.stopPropagation();
              searchEmailSenders([senderEmail]);
            }}
          >
            {senderEmail}
          </span>
        </div>

        <div className="email-count">
          <span className="count-badge">{senderCount}</span>
        </div>
      </div>

      <div className="selection-indicator"></div>
    </div>
  );
};
