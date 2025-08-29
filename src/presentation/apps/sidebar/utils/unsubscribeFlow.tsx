import { useApp } from "../../../providers/app_provider";
import { useModal } from "../providers/modalContext";

export function useUnsubscribeFlow(
  deleteEmails: boolean,
  blockSenders: boolean,
) {
  const { setModal } = useModal();
  const { reloadSenders } = useApp();
  const { selectedSenders, clearSelectedSenders, unsubscribeSenders, deleteSenders } = useApp();

  let failedSenders: string[];

  // Kick off the flow
  const startUnsubscribeFlow = async () => {
    // Set modal to pending state
    setModal({
      action: "unsubscribe",
      type: "pending",
      subtype: "working",
    });

    // Attempt to unsubscribe all senders automatically
    failedSenders = await unsubscribeSenders(Object.keys(selectedSenders));

    // Start processing failed senders by optionally blocking
    processNextBlock(0);

  };

  // End the flow
  const endUnsubscribeFlow = async () => {
    // Delete senders if needed
    if (deleteEmails) {
      setModal({ action: "delete", type: "pending" });
      await deleteSenders(Object.keys(selectedSenders));
    }

    // // TODO: Block senders if needed
    // if (blockSenders) {
    //   setModal({ action: "unsubscribe", type: "pending", subtype: "blocking" });
    //   for (const email of Object.keys(selectedSenders)) {
    //     if (!noUnsubscribeOptionSenders.includes(email)) {
    //       await blockSender(email);
    //     }
    //   }
    // }
    blockSenders;

    // Deselect all senders
    clearSelectedSenders();

    // Show success modal and refresh senders
    setModal({ action: "unsubscribe", type: "success" });
    reloadSenders();
  };

  // Process one block-only sender at `i`
  const processNextBlock = async (i: number) => {
    if (i >= failedSenders.length) {
      endUnsubscribeFlow();
      return;
    }

    const email = failedSenders[i];

    setModal({
      action: "unsubscribe",
      type: "error",
      extras: {
        email,
        onContinue: () => {
          processNextBlock(i + 1);
        },
      },
    });
  };

  return { startUnsubscribeFlow };
}
