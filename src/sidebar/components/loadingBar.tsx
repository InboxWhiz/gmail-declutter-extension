import { useState, useEffect } from 'react';
import { useActions } from '../providers/actionsContext';
import './loadingBar.css';

const LoadingBar = () => {
    const [progress, setProgress] = useState(0);
    const { checkFetchProgress } = useActions();

    useEffect(() => {
        // Check progress every 500ms
        const interval = setInterval(() => checkFetchProgress(setProgress), 500);

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div id="loadingContainer">
                <div
                    id="progressBar"
                    style={{
                        width: `${progress * 100}%`, // Only width is dynamic now
                    }}
                />
            </div>
        </div>
    );
};

export default LoadingBar;
