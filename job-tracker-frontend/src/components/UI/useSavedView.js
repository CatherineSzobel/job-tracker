import { useState } from "react";
import { LIST_VIEWS } from "../../constants/views";

// A stored value that isn't one of the choices (e.g. from an older version) counts as the default (the first)
function readSavedChoice(storageKey, choices) {
  try {
    const savedValue = localStorage.getItem(storageKey);
    return choices.some((choice) => choice.value === savedValue) ? savedValue : choices[0].value;
  } catch {
    return choices[0].value;
  }
}

// One of `choices` ([{ value }], LIST_VIEWS unless given, e.g. a sort order), remembered per browser under
// storageKey. localStorage can throw (private windows, blocked storage); then the choice lasts for this visit only.
export default function useSavedView(storageKey, choices = LIST_VIEWS) {
  const [value, setValue] = useState(() => readSavedChoice(storageKey, choices));

  const changeValue = (nextValue) => {
    setValue(nextValue);
    try {
      localStorage.setItem(storageKey, nextValue);
    } catch {
      // Storage unavailable: keep the choice in memory only
    }
  };

  return [value, changeValue];
}
