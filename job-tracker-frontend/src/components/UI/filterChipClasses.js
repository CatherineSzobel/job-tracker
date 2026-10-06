const ACTIVE_CHIP = "bg-accent text-white";
const INACTIVE_CHIP = "bg-light dark:bg-dark-soft text-light-muted dark:text-dark-muted border border-border dark:border-dark-subtle hover:text-accent";

// A filter chip's classes (Documents, To-dos): the chosen one is filled with the accent colour
export const filterChipClasses = (isActive) => `px-3 py-1 rounded-full text-sm transition-colors ${isActive ? ACTIVE_CHIP : INACTIVE_CHIP}`;
