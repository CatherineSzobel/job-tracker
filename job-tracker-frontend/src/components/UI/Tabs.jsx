const tabButtonId = (idPrefix, tabId) => `${idPrefix}-tab-${tabId}`;
const tabPanelId = (idPrefix, tabId) => `${idPrefix}-panel-${tabId}`;

// Accessible tab bar: Left/Right arrow keys move between tabs. tabs: [{ id, label }].
// Pair it with one TabPanel (same idPrefix) for the active tab. className adds to the bar's own classes.
export default function Tabs({ tabs, activeTab, onChange, idPrefix, label, className = "" }) {
  const moveWithArrowKeys = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = tabs[(currentIndex + step + tabs.length) % tabs.length];
    onChange(nextTab.id);
    document.getElementById(tabButtonId(idPrefix, nextTab.id))?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={moveWithArrowKeys}
      className={`flex gap-6 mb-6 border-b border-border dark:border-dark-subtle ${className}`}
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            id={tabButtonId(idPrefix, tab.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            // Only the active panel is on the page, so only its tab points to one
            aria-controls={selected ? tabPanelId(idPrefix, tab.id) : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`-mb-px pb-2 px-1 whitespace-nowrap text-sm font-medium border-b-2 transition-colors ${
              selected
                ? "border-accent text-accent dark:text-accent-muted"
                : "border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// The content of one tab, linked to its tab button for screen readers
export function TabPanel({ idPrefix, tabId, className, children }) {
  return (
    <div id={tabPanelId(idPrefix, tabId)} role="tabpanel" aria-labelledby={tabButtonId(idPrefix, tabId)} className={className}>
      {children}
    </div>
  );
}
