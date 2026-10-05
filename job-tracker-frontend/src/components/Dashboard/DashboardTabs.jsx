import { DASHBOARD_TABS } from "../../constants/dashboard";

const tabButtonId = (tabId) => `dashboard-tab-${tabId}`;
const tabPanelId = (tabId) => `dashboard-panel-${tabId}`;

// Accessible tab bar: Left/Right arrow keys move between tabs. Pair it with one DashboardTabPanel
// for the active tab.
export default function DashboardTabs({ activeTab, onChange }) {
  const moveWithArrowKeys = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const currentIndex = DASHBOARD_TABS.findIndex((tab) => tab.id === activeTab);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = DASHBOARD_TABS[(currentIndex + step + DASHBOARD_TABS.length) % DASHBOARD_TABS.length];
    onChange(nextTab.id);
    document.getElementById(tabButtonId(nextTab.id))?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Dashboard"
      onKeyDown={moveWithArrowKeys}
      className="flex gap-6 mb-6 border-b border-border dark:border-dark-subtle"
    >
      {DASHBOARD_TABS.map((tab) => {
        const selected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            id={tabButtonId(tab.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            // Only the active panel is on the page, so only its tab points to one
            aria-controls={selected ? tabPanelId(tab.id) : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`-mb-px pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
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
export function DashboardTabPanel({ tabId, className, children }) {
  return (
    <div id={tabPanelId(tabId)} role="tabpanel" aria-labelledby={tabButtonId(tabId)} className={className}>
      {children}
    </div>
  );
}
