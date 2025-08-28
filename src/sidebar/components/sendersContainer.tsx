import { SenderLine } from "./senderLine";
import { useApp } from "../../presentation/providers/app_provider";
import SenderLineSkeleton from "./senderLineSkeleton";
// import LoadingBar from "./loadingBar";

export const SendersContainer = () => {
  const { senders, loading } = useApp();

  return (
    <div id="senders">
      {loading ? (
        <>
          {/* <LoadingBar /> */}
          {Array.from({ length: 7 }).map(() => (
            <SenderLineSkeleton />
          ))}
        </>
      ) : (
        senders.map((sender, index) => (
          <SenderLine
            key={index}
            senderName={Array.from(sender.names)[0] || sender.email}
            senderEmail={sender.email}
            senderCount={sender.emailCount}
          />)
        )
      )}
    </div>
  );
};