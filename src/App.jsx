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

function App() {

  return (
    <div className='playerStats'>
      <h2>Name:&nbsp;{player.name}</h2>
      <h3>Level:&nbsp;{player.level}</h3>
      <h3>HP:&nbsp;{player.hp}</h3>
      <h3>ATK:&nbsp;{player.attack}</h3>
      <h3>DEF:&nbsp;{player.defense}</h3>
      <h3>Gold:&nbsp;{player.gold}</h3>
    </div>
  )
}

export default App
