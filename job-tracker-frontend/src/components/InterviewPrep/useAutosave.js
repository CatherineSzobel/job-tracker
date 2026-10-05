import { useCallback, useEffect, useRef, useState } from "react";

const AUTOSAVE_DELAY_MS = 800;

// Saving while you type: schedule(value) saves it after a short pause, one request at a time and
// always the latest value (last write wins). Whatever is still waiting is sent when the page unmounts,
// and closing the tab asks first while something is unsaved. After a failed save, retry() resends.
// status: "idle" | "saving" | "saved" | "error"
export default function useAutosave(save) {
  const [status, setStatus] = useState("idle");
  const saveRef = useRef(save);
  // { value } waiting to be sent, or null
  const pending = useRef(null);
  const inFlight = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    saveRef.current = save;
  });

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    // A save in progress sends whatever is pending when it finishes
    if (inFlight.current || !pending.current) return;
    inFlight.current = true;
    while (pending.current) {
      const { value } = pending.current;
      pending.current = null;
      setStatus("saving");
      try {
        await saveRef.current(value);
      } catch (err) {
        console.error(err);
        // Keep it for retry(), unless something newer is already waiting
        pending.current ??= { value };
        inFlight.current = false;
        setStatus("error");
        return;
      }
    }
    inFlight.current = false;
    setStatus("saved");
  }, []);

  const schedule = useCallback(
    (value) => {
      pending.current = { value };
      setStatus("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, AUTOSAVE_DELAY_MS);
    },
    [flush]
  );

  // Leaving the page (another route) sends what's still waiting
  useEffect(() => () => flush(), [flush]);

  useEffect(() => {
    const warnIfUnsaved = (event) => {
      if (pending.current || inFlight.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warnIfUnsaved);
    return () => window.removeEventListener("beforeunload", warnIfUnsaved);
  }, []);

  return { status, schedule, retry: flush };
}

const STATUS_PRIORITY = ["error", "saving", "saved"];

// One status line for several autosaves: an error wins, then saving, then saved
export function combineAutosaves(autosaves) {
  const status = STATUS_PRIORITY.find((candidate) => autosaves.some((autosave) => autosave.status === candidate)) ?? "idle";
  const retry = () => autosaves.filter((autosave) => autosave.status === "error").forEach((autosave) => autosave.retry());
  return { status, retry };
}
