type Props = {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
  icon?: string;
};

export default function StatCard({ label, value, hint, tone = 'indigo', icon }: Props) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      {icon && <span className="stat-card-icon">{icon}</span>}
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
