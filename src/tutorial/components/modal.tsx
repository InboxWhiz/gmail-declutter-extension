import { ReactNode, MouseEvent } from "react";
import "./modal.css";

export const Modal = ({ children, isOpen, onClose }: { children: ReactNode; isOpen: boolean; onClose: () => void }) => {
    const handleBackgroundClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal"
            onClick={handleBackgroundClick}
            style={{ display: isOpen ? "block" : "none" }}
        >
            {children}
        </div>
    );
};