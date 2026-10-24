import { useState, type ReactNode } from "react";

export type TabItem = {
  id: string;
  label: string;
  panel: ReactNode;
};

export function Tabs({ id, tabs, label }: { id: string; tabs: TabItem[]; label: string }) {
  const [current, setCurrent] = useState(tabs[0]?.id ?? "");
  const selected = tabs.find((tab) => tab.id === current) ?? tabs[0];

  const move = (direction: 1 | -1) => {
    const index = tabs.findIndex((tab) => tab.id === current);
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    if (next) setCurrent(next.id);
  };

  if (!selected) return null;

  return (
    <div className="tabs">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {tabs.map((tab) => {
          const selectedTab = tab.id === selected.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${id}-${tab.id}`}
              aria-selected={selectedTab}
              aria-controls={`${id}-panel-${tab.id}`}
              tabIndex={selectedTab ? 0 : -1}
              onClick={() => setCurrent(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel-${selected.id}`}
        aria-labelledby={`${id}-${selected.id}`}
        tabIndex={0}
      >
        {selected.panel}
      </div>
    </div>
  );
}
