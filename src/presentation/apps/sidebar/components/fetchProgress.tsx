import React from "react";
import { FetchProgress } from "../../../../domain/types/progress";
import "./fetchProgress.css";

interface FetchProgressProps {
  progress: FetchProgress;
  onCancel: () => void;
}

export const FetchProgressBar: React.FC<FetchProgressProps> = ({
  progress,
  onCancel,
}) => {
  return (
    <div className="fetch-progress-container">
      <div className="fetch-progress-header">
        <h3>Scanning inbox...</h3>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <div className="progress-stats">
        <span>
          Page {progress.currentPage} of {progress.totalPages}
        </span>
        <span>
          {progress.processedEmails.toLocaleString()} emails processed
        </span>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="progress-percentage">{progress.percentage}%</div>
    </div>
  );
};
