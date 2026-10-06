import { useState } from "react";
import { showToast } from "../../stores/useToastStore";
import { mergeBatchResult } from "./batchUpdate";

// Sends a batch request for an applications list (Applications or Archive). sendBatch(sendRequest):
// sendRequest() resolves to the updated applications. Success puts them into the list (dropping those that
// left it) and runs onDone (ending select mode, which drops the saved changes); failure shows a toast and
// keeps the selection and unsaved changes, so it can be tried again. busy: a request is running.
export default function useSendBatch({ setJobs, listShowsArchived, onDone }) {
  const [busy, setBusy] = useState(false);

  const sendBatch = async (sendRequest) => {
    setBusy(true);
    try {
      const updatedJobs = await sendRequest();
      setJobs((currentJobs) => mergeBatchResult(currentJobs, updatedJobs, listShowsArchived));
      onDone();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update the selected applications");
    } finally {
      setBusy(false);
    }
  };

  return { sendBatch, busy };
}
