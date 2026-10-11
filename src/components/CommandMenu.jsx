import { playerSkills } from '../data/skills.js'

export default function CommandMenu({ player, phase, onAttack, onDefend, onSkill, onItem, onFlee }) {
  if (phase !== 'playerTurn') return null

  return (
    <div className="battleActions">
      <button onClick={onAttack}>โจมตี!</button>
      <button onClick={onDefend}>ป้องกัน 50%</button>
      {playerSkills.map((skill) => (
        <button
          key={skill.name}
          onClick={() => onSkill(skill)}
          disabled={player.mp < skill.mpCost || (skill.type === 'heal' && player.hp === player.maxHp)}
        >
          {skill.name} ({skill.mpCost} MP)
        </button>
      ))}
      <button
        onClick={() => onItem('hpPotion')}
        disabled={player.inventory.hpPotion === 0 || player.hp === player.maxHp}
      >
        ยาฟื้น HP +35 (เหลือ {player.inventory.hpPotion})
      </button>
      <button
        onClick={() => onItem('mpPotion')}
        disabled={player.inventory.mpPotion === 0 || player.mp === player.maxMp}
      >
        ยาฟื้น MP +15 (เหลือ {player.inventory.mpPotion})
      </button>
      <button onClick={onFlee}>หนี!</button>
    </div>
  )
}
