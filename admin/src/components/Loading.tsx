export default function Loading({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="loading-box">
      <div className="loading-spinner" />
      <span>{label}</span>
    </div>
  );
}
