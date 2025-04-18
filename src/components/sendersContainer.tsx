import { SenderLine } from "./senderLine";
import { useSenders } from "../providers/sendersContext";

export const SendersContainer = () => {
  const { senders, loading } = useSenders();

  return (
    <div id="senders">
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading messages...</p>
      ) : (
        senders.map((sender, index) => (
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
