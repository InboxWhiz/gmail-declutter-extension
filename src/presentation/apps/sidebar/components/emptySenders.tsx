import { useApp } from "../../../../presentation/providers/app_provider";
import "./emptySenders.css";

export const EmptySenders = () => {
  const { reloadSenders } = useApp();
  return (
    <div className="e-container">
      <div className="e-card">
        <h2 className="e-title">No senders yet</h2>
        <p className="e-subtitle">Load senders to get started</p>
        <div className="e-buttons">
          <button id="load-senders" className="btn" onClick={() => reloadSenders(true)}>
            Load senders
          </button>
        </div>
      </div>
    </div>
  );
};
