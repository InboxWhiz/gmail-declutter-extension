import { useActions } from "../../_shared/providers/actionsContext";
import { ManualUnsubscribeData } from "../../_shared/types/types";
import { useModal } from "../providers/modalContext";
import { useSelectedSenders } from "../providers/selectedSendersContext";
import { useSenders } from "../providers/sendersContext";

export function useUnsubscribeFlow(
  deleteEmails: boolean,
  blockSenders: boolean,
) {
  const { deleteSenders, blockSender, unsubscribeSendersAuto } = useActions();
  const { setModal } = useModal();
  const { reloadSenders } = useSenders();
  const { selectedSenders, clearSelectedSenders } = useSelectedSenders();

  let linkOnlySenders: [string, string][] = []; // List of senders that require manual unsubscribe via link, and their links to click
  let noUnsubscribeOptionSenders: string[] = []; // List of senders with no unsubscribe option

  // Kick off the flow
  const startUnsubscribeFlow = async () => {
    // Set modal to pending state
    setModal({
      action: "unsubscribe",
      type: "pending",
      subtype: "working",
    });

    // Attempt to unsubscribe all senders automatically
    const unsubscribeResults: ManualUnsubscribeData =
      await unsubscribeSendersAuto(Object.keys(selectedSenders));
    linkOnlySenders = unsubscribeResults.linkOnlySenders;
    noUnsubscribeOptionSenders = unsubscribeResults.noUnsubscribeOptionSenders;

    // Start processing link-only senders
    processNextLink(0);
  };

  // End the flow
  const endUnsubscribeFlow = async () => {
    // Delete senders if needed
    if (deleteEmails) {
      setModal({ action: "delete", type: "pending" });
      await deleteSenders(Object.keys(selectedSenders));
    }

    // Block senders if needed
    if (blockSenders) {
      setModal({ action: "unsubscribe", type: "pending", subtype: "blocking" });
      for (const email of Object.keys(selectedSenders)) {
        await blockSender(email);
      }
    }

    // Deselect all senders
    clearSelectedSenders();

    // Show success modal and refresh senders
    setModal({ action: "unsubscribe", type: "success" });
    reloadSenders();
  };

  // Process one link-only sender at `i`
  const processNextLink = async (i: number) => {
    if (i >= linkOnlySenders.length) {
      processNextBlock(0);
      return;
    }

    const [email, link] = linkOnlySenders[i];

    setModal({
      action: "unsubscribe",
      type: "continue",
      extras: {
        email,
        link,
        onContinue: () => {
          processNextLink(i + 1);
        },
      },
    });
  };

  // Process one block-only sender at `i`
  const processNextBlock = async (i: number) => {
    if (i >= noUnsubscribeOptionSenders.length) {
      endUnsubscribeFlow();
      return;
    }

    const email = noUnsubscribeOptionSenders[i];

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
