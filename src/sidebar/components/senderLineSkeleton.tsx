import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SenderLineSkeleton = () => {
  return (
    <div className="sender-line sender-line-skeleton">
      <div className="begin">
        <div style={{ marginRight: "18px" }}></div>
        <div className="sender-details">
          <Skeleton width={100} height={10} />
          <Skeleton width={150} height={10} />
        </div>
      </div>
      <div className="email-count">
        <Skeleton width={10} height={10} />
      </div>
    </div>
  );
};

export default SenderLineSkeleton;
