import { useEffect, useState } from 'react'
import './App.css'
import BattleLog from './components/BattleLog.jsx'
import EnemyCard from './components/EnemyCard.jsx'
import PlayerCard from './components/PlayerCard.jsx'
import Shop from './components/Shop.jsx'
import { initialInventory } from './data/items.js'
import { useBattle } from './hooks/useBattle.js'

const defaultPlayer = {
  name: 'lilBro',
  maxHp: 100,
  hp: 100,
  maxMp: 30,
  mp: 30,
  attack: 5,
  defense: 5,
  level: 1,
  exp: 0,
  gold: 100,
  inventory: initialInventory,
}

const playerStorageKey = 'mini-rpg-player'

function loadSavedPlayer() {
  try {
    const savedPlayer = localStorage.getItem(playerStorageKey)
    if (!savedPlayer) return defaultPlayer

    const parsedPlayer = JSON.parse(savedPlayer)
    return {
      ...defaultPlayer,
      ...parsedPlayer,
      inventory: {
        ...initialInventory,
        ...parsedPlayer.inventory,
      },
    }
  } catch (error) {
    console.error('โหลดข้อมูลผู้เล่นจาก localStorage ไม่สำเร็จ', error)
    return defaultPlayer
  }
}

function App() {
  const [initialPlayer] = useState(loadSavedPlayer)
  const { state, startBattle, attack, defend, useSkill, useItem, flee, buyItem } = useBattle(initialPlayer)
  const { player, enemy, phase, log, damagePopups } = state

  useEffect(() => {
    try {
      localStorage.setItem(playerStorageKey, JSON.stringify(player))
    } catch (error) {
      console.error('บันทึกข้อมูลผู้เล่นลง localStorage ไม่สำเร็จ', error)
    }
  }, [player])

  return (
    <main className="game">
      <h1 className="gameTitle">Mini RPG: ภารกิจตามหาของกิน</h1>
      <div className="gamePanels">
        <PlayerCard
          player={player}
          phase={phase}
          damagePopup={damagePopups.player}
          onStartBattle={startBattle}
          onAttack={attack}
          onDefend={defend}
          onSkill={useSkill}
          onItem={useItem}
          onFlee={flee}
        />
        <EnemyCard enemy={enemy} damagePopup={damagePopups.enemy} />
      </div>
      <Shop player={player} phase={phase} onBuy={buyItem} />
      <BattleLog entries={log} />
    </main>
  )
}

export default App
