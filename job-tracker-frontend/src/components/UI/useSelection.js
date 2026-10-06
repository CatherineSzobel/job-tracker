import { useEffect, useRef, useState } from "react";

// Select mode for a list (applications, interviews). Escape or exitSelecting() leaves it and clears the selection
// (Escape is left to a dialog when one is open, so closing it doesn't lose the selection).
// onExit: runs whenever select mode ends, however it ends (e.g. to drop unsaved batch changes).
export default function useSelection({ onExit } = {}) {
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    onExitRef.current = onExit;
  });

  const exitSelecting = () => {
    setSelecting(false);
    setSelectedIds([]);
    onExitRef.current?.();
  };

  useEffect(() => {
    if (!selecting) return;
    const handleKeyDown = (event) => {
      // UI/Modal sets aria-modal; it handles this Escape itself
      if (event.key !== "Escape" || document.querySelector('[aria-modal="true"]')) return;
      setSelecting(false);
      setSelectedIds([]);
      onExitRef.current?.();
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

  return {
    selecting,
    startSelecting: () => setSelecting(true),
    exitSelecting,
    selectedIds,
    toggleSelected,
    selectMany,
    // Unselects everything but stays in select mode (onExit doesn't run)
    clearSelection: () => setSelectedIds([]),
  };
}
