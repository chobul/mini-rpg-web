import CommandMenu from './CommandMenu.jsx'
import StatusBar from './StatusBar.jsx'

export default function PlayerCard({
  player,
  phase,
  damagePopup,
  onStartBattle,
  onAttack,
  onDefend,
  onSkill,
  onItem,
  onFlee,
}) {
  const isBattleActive = phase === 'playerTurn' || phase === 'enemyTurn'

  return (
    <section
      className={`statsCard${damagePopup ? ' damageShake' : ''}`}
      aria-labelledby="player-title"
    >
      {damagePopup && (
        <span className="damagePopup" key={damagePopup.id} aria-hidden="true">
          -{damagePopup.amount}
        </span>
      )}
      <h2 id="player-title">Player</h2>
      <h3>Name: {player.name}</h3>
      <h3>Level: {player.level}</h3>
      <StatusBar label="HP" value={player.hp} max={player.maxHp} type="hp" />
      <StatusBar label="MP" value={player.mp} max={player.maxMp} type="mp" />
      <h3>EXP: {player.exp} / {player.level * 50}</h3>
      <h3>ATK: {player.attack}</h3>
      <h3>DEF: {player.defense}</h3>
      <h3>Gold: {player.gold}</h3>
      <button onClick={onStartBattle} disabled={isBattleActive}>Battle Now!</button>
      <CommandMenu
        player={player}
        phase={phase}
        onAttack={onAttack}
        onDefend={onDefend}
        onSkill={onSkill}
        onItem={onItem}
        onFlee={onFlee}
      />
    </section>
  )
}
