import { useState } from 'react'
import './App.css'

const player = {
  name : "lilBro",
  hp : 100,
  attack : 5,
  defense : 5,
  level : 1,
  gold : 100
}

const enemy = [
  {
    name: "Goblin",
    hp: 50,
    attack: 3,
    defense: 2,
    level: 1
  },
  {
    name: "Slime",
    hp: 30,
    attack: 2,
    defense: 1,
    level: 1
  },
  {
    name: "Skeleton",
    hp: 70,
    attack: 5,
    defense: 4,
    level: 2
  }
]

function App() {
  const [currentEnemy, SetCurrentEnemy] = useState(enemy)

  function findEnemy() {
    const randomIndex = Math.floor(Math.random() * enemy.length)
    const randomEnemy = enemy[randomIndex]

    

    console.log(randomIndex)
    console.log(randomEnemy)
  }

  return (
    <>
    <div className='playerStats'>
      <h2>Name:&nbsp;{currentEnemy.name}</h2>
      <h3>Level:&nbsp;{player.level}</h3>
      <h3>HP:&nbsp;{player.hp}</h3>
      <h3>ATK:&nbsp;{player.attack}</h3>
      <h3>DEF:&nbsp;{player.defense}</h3>
      <h3>Gold:&nbsp;{player.gold}</h3>
      <button onClick={findEnemy}>Find Enemy!</button>
    </div>
    <div className='EnemyStats'>
      <h1>Enemy</h1>
      <h2>Name:&nbsp;{enemy.name}</h2>
      <h3>Level:&nbsp;{enemy.level}</h3>
      <h3>HP:&nbsp;{enemy.hp}</h3>
      <h3>ATK:&nbsp;{enemy.attack}</h3>
      <h3>DEF:&nbsp;{enemy.defense}</h3>
    </div>
    </>
  )
}

export default App
