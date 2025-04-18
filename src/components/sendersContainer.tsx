import { SenderLine } from "./senderLine";
import { useSenders } from "../providers/sendersContext";
import { useMemo } from "react";

export const SendersContainer = () => {
  const { senders, loading } = useSenders();

  const sortedSenders = useMemo(() => {
    return [...senders].sort((a, b) => b.count - a.count);
  }, [senders]);

  return (
    <div id="senders">
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading messages...</p>
      ) : (
        sortedSenders.map((sender, index) => (
          <SenderLine
            key={index}
            senderName={sender.name}
            senderEmail={sender.email}
            senderCount={sender.count}
          />
        ))
      )}
    </div>
  );
};
