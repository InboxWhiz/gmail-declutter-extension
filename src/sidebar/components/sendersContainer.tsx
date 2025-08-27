import { SenderLine } from "./senderLine";
// import { useSenders } from "../providers/sendersContext";
// import { useMemo } from "react";
// import SenderLineSkeleton from "./senderLineSkeleton";
// import LoadingBar from "./loadingBar";
import { Sender } from "../../domain/entities/sender";
import { useState } from "react";

export const SendersContainer = () => {
  // Replace the let variable with useState
  const [sortedSenders, setSortedSenders] = useState<Sender[]>([]);

  const getSendersFromPage = async () => {
    const response = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "FETCH_SENDERS",
          }, (response) => {
            console.log(`response: ${JSON.stringify(response)}`);
            resolve(response.data);
          });
        } else {
          console.error("No active tab found.");
          resolve(null);
        }
      });
    });
    const senders = response as Sender[];
    console.log(`senders: ${senders}`);
    senders.sort((a, b) => b.emailCount - a.emailCount);
    setSortedSenders(senders);
  };

  return (
    <div id="senders">
      <button onClick={getSendersFromPage}>Get emails from page</button>
      {sortedSenders.map((sender, index) => (
        <SenderLine
          key={index}
          senderName={Array.from(sender.names)[0] || sender.email}
          senderEmail={sender.email}
          senderCount={sender.emailCount}
        />
      ))}
    </div>
  );
};

// export const SendersContainer = () => {
//   const { senders, loading } = useSenders();

//   const sortedSenders = useMemo(() => {
//     return [...senders].sort((a, b) => b.count - a.count);
//   }, [senders]);

//   return (
//     <div id="senders">
//       {loading ? (
//         <>
//           <LoadingBar />
//           {Array.from({ length: 7 }).map(() => (
//             <SenderLineSkeleton />
//           ))}
//         </>
//       ) : (
//         sortedSenders.map((sender, index) => (
//           <SenderLine
//             key={index}
//             senderName={sender.name}
//             senderEmail={sender.email}
//             senderCount={sender.count}
//           />
//         ))
//       )}
//     </div>
//   );
// };