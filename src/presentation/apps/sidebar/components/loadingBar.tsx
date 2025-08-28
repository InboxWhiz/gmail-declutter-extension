import { useState, useEffect } from "react";
import { useActions } from "../../../../_shared/providers/actionsContext";
import "./loadingBar.css";

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const { checkFetchProgress } = useActions();

  useEffect(() => {
    // Check progress every 500ms
    const interval = setInterval(() => checkFetchProgress(setProgress), 500);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  });

  return (
    <div>
      <div id="loading-container">
        <div
          id="progress-bar"
          style={{
            width: `${progress * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export default LoadingBar;
