import { ReactNode } from "react";
import "./modal.css";

export const Modal = ({ children }: { children: ReactNode }) => {
  return <div className="modal">{children}</div>;
};
