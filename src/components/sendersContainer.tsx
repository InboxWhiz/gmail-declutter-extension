import { SenderLine } from "./senderLine";
import { useSenders } from "../providers/sendersContext";
import { useMemo } from "react";
import SenderLineSkeleton from "./senderLineSkeleton";

export const SendersContainer = () => {
  const { senders, loading } = useSenders();

  const sortedSenders = useMemo(() => {
    return [...senders].sort((a, b) => b.count - a.count);
  }, [senders]);

  return (
    <div id="senders">
      {loading
        ? Array.from({ length: 9 }).map(() => <SenderLineSkeleton />)
        : sortedSenders.map((sender, index) => (
            <SenderLine
              key={index}
              senderName={sender.name}
              senderEmail={sender.email}
              senderCount={sender.count}
            />
          ))}
    </div>
  );
};
