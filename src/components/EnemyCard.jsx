import StatusBar from './StatusBar.jsx'

export default function EnemyCard({ enemy, damagePopup }) {
  return (
    <section
      className={`statsCard enemyCard${damagePopup ? ' damageShake' : ''}`}
      aria-labelledby="enemy-title"
      aria-live="polite"
    >
      {damagePopup && (
        <span className="damagePopup" key={damagePopup.id} aria-hidden="true">
          -{damagePopup.amount}
        </span>
      )}
      <h2 id="enemy-title">Enemy</h2>
      {enemy ? (
        <>
          <h3>Name: {enemy.name}</h3>
          <h3>Level: {enemy.level}</h3>
          <StatusBar label="HP" value={enemy.hp} max={enemy.maxHp} type="hp" />
          <StatusBar label="MP" value={enemy.mp} max={enemy.maxMp} type="mp" />
          <h3>ATK: {enemy.attack}</h3>
          <h3>
            DEF: {enemy.defense}
            {enemy.defenseDownTurns > 0 && ` (ลดลงอีก ${enemy.defenseDownTurns} เทิร์น)`}
          </h3>
          <p className="enemyMessage">สกิล: {enemy.skills.map(({ name }) => name).join(', ')}</p>
        </>
      ) : (
        <p className="emptyMessage">ยังไม่มีศัตรู... มีแต่หิว ลองกดปุ่มสิ!</p>
      )}
    </section>
  )
}
