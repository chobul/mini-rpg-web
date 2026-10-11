export default function StatusBar({ label, value, max, type }) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className="statusBarGroup">
      <div className="statusBarLabel">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div
        className={`statusBar statusBar-${type}`}
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax={max}
      >
        <div className="statusBarFill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
