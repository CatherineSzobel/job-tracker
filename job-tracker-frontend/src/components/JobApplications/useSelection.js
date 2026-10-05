import { useEffect, useState } from "react";

// Select mode for a list of applications. Escape or exitSelecting() leaves it and clears the selection
// (Escape is left to a dialog when one is open, so closing it doesn't lose the selection).
export default function useSelection() {
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const exitSelecting = () => {
    setSelecting(false);
    setSelectedIds([]);
  };

  useEffect(() => {
    if (!selecting) return;
    const handleKeyDown = (event) => {
      // UI/Modal sets aria-modal; it handles this Escape itself
      if (event.key !== "Escape" || document.querySelector('[aria-modal="true"]')) return;
      setSelecting(false);
      setSelectedIds([]);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selecting]);

  const toggleSelected = (id) =>
    setSelectedIds((currentIds) =>
      currentIds.includes(id) ? currentIds.filter((selectedId) => selectedId !== id) : [...currentIds, id]
    );

  // Adds all of these, e.g. "Select all" for the visible list or one month
  const selectMany = (ids) => setSelectedIds((currentIds) => [...new Set([...currentIds, ...ids])]);

  return { selecting, startSelecting: () => setSelecting(true), exitSelecting, selectedIds, toggleSelected, selectMany };
}
