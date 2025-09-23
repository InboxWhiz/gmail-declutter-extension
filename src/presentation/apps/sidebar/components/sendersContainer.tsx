import { SenderLine } from "./senderLine";
import { useApp } from "../../../providers/app_provider";
import SenderLineSkeleton from "./senderLineSkeleton";
import { EmptySenders } from "./emptySenders";

export const SendersContainer = () => {
  const { filteredSenders, loading, searchTerm } = useApp();

  return (
    <div id="senders">
      {loading ? (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <SenderLineSkeleton key={i} />
          ))}
        </>
      ) : filteredSenders.length === 0 ? (
        searchTerm ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--text-secondary)",
            }}
          >
            <p>No senders match "{searchTerm}"</p>
          </div>
        ) : (
          <EmptySenders />
        )
      ) : (
        filteredSenders.map((sender, _index) => (
          <SenderLine
            key={sender.email}
            senderName={Array.from(sender.names)[0] || sender.email}
            senderEmail={sender.email}
            senderCount={sender.emailCount}
          />
        ))
      )}
    </div>
  );
};
