import { SenderLine } from "./senderLine";
import { useApp } from "../../../providers/app_provider";
import SenderLineSkeleton from "./senderLineSkeleton";
import { EmptySenders } from "./emptySenders";

export const SendersContainer = () => {
  const { senders, loading } = useApp();

  return (
    <div id="senders">
      {loading ? (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <SenderLineSkeleton key={i} />
          ))}
        </>
      ) : senders.length === 0 ? (
        <EmptySenders />
      ) : (
        senders.map((sender, index) => (
          <SenderLine
            key={index}
            senderName={Array.from(sender.names)[0] || sender.email}
            senderEmail={sender.email}
            senderCount={sender.emailCount}
          />
        ))
      )}
    </div>
  );
};
