type Tab = { key: string; label: string; count?: number };

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
};

export default function FilterTabs({ tabs, active, onChange }: Props) {
  return (
    <div className="filter-tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          className={active === t.key ? 'filter-tab active' : 'filter-tab'}
          onClick={() => onChange(t.key)}
        >
          {t.label}
          {t.count != null && <span className="filter-tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
