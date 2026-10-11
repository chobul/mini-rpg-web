import { useEffect, useRef } from 'react'

export default function BattleLog({ entries }) {
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [entries])

  return (
    <section className="battleLog" aria-labelledby="battle-log-title">
      <h2 id="battle-log-title">Battle Log</h2>
      <div className="battleLogEntries" ref={logRef} role="log" aria-live="polite" aria-relevant="additions">
        {entries.length > 0 ? entries.map((message, index) => (
          <p className="battleLogEntry" key={`${index}-${message}`}>{message}</p>
        )) : (
          <p className="emptyMessage">บันทึกการต่อสู้จะปรากฏตรงนี้ กด Battle Now! เพื่อเริ่มความวุ่นวาย</p>
        )}
      </div>
    </section>
  )
}
