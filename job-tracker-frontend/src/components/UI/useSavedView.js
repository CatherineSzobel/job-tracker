import { useState } from "react";
import { DEFAULT_LIST_VIEW, LIST_VIEWS } from "../../constants/views";

// A stored value that isn't a known view (e.g. from an older version) counts as the default
function readSavedView(storageKey) {
  try {
    const savedView = localStorage.getItem(storageKey);
    return LIST_VIEWS.some((view) => view.value === savedView) ? savedView : DEFAULT_LIST_VIEW;
  } catch {
    return DEFAULT_LIST_VIEW;
  }
}

// A LIST_VIEWS value, remembered per browser under storageKey. localStorage can throw
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
