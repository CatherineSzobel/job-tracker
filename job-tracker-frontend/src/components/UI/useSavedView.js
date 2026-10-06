import { useState } from "react";

const VIEWS = ["grid", "grouped"];

// A stored value that isn't a known view (e.g. from an older version) counts as "grid"
function readSavedView(storageKey) {
  try {
    const savedView = localStorage.getItem(storageKey);
    return VIEWS.includes(savedView) ? savedView : "grid";
  } catch {
    return "grid";
  }
}

// "grid" or "grouped", remembered per browser under storageKey. localStorage can throw
// (private windows, blocked storage); then the choice lasts for this visit only.
export default function useSavedView(storageKey) {
  const [view, setView] = useState(() => readSavedView(storageKey));

  const changeView = (nextView) => {
    setView(nextView);
    try {
      localStorage.setItem(storageKey, nextView);
    } catch {
      // Storage unavailable: keep the choice in memory only
    }
  };

  return [view, changeView];
}
