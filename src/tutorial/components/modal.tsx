import { ReactNode, MouseEvent } from "react";
import "./modal.css";

export const Modal = ({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) => {
  const handleBackgroundClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal"
      onClick={handleBackgroundClick}
    >
      {children}
    </div>
  );
};
