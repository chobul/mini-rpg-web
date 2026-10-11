import { useCallback, useEffect, useReducer, useRef } from 'react'
import { enemies } from '../data/enemies.js'
import { shopItems } from '../data/items.js'
import { jokes } from '../data/jokes.js'
import {
  applyDefeatPenalty,
  calculateDamage,
  calculateVictoryProgress,
  chooseEnemyAction,
  getEnemyDamage,
  scaleEnemyToLevel,
} from '../utils/battle.js'

const enemyTurnDelay = 700

function randomValue() {
  return Math.random()
}

function pickJoke(category, previousJokeIndexes) {
  const options = jokes[category]
  const previousIndex = previousJokeIndexes.current[category]
  const availableIndexes = options.map((_, index) => index)
    .filter((index) => index !== previousIndex)
  const index = availableIndexes[Math.floor(randomValue() * availableIndexes.length)]
  previousJokeIndexes.current[category] = index
  return options[index]
}

function addLog(state, ...entries) {
  return { ...state, log: [...state.log, ...entries] }
}

function applyDamagePopup(state, target, amount, id) {
  return {
    ...state,
    damagePopups: { ...state.damagePopups, [target]: { amount, id } },
  }
}

function battleReducer(state, action) {
  if (action.type === 'START_BATTLE') {
    return {
      ...state,
      enemy: action.enemy,
      phase: 'playerTurn',
      defending: false,
      log: [`เริ่มการต่อสู้! เจอ ${action.enemy.name}!`, action.joke],
      damagePopups: { player: null, enemy: null },
    }
  }

  if (action.type === 'CLEAR_DAMAGE') {
    if (state.damagePopups[action.target]?.id !== action.id) return state
    return {
      ...state,
      damagePopups: { ...state.damagePopups, [action.target]: null },
    }
  }

  if (action.type === 'SHOP_PURCHASE') {
    if (state.phase === 'playerTurn' || state.phase === 'enemyTurn'
      || state.player.gold < action.price
      || (action.item === 'weapon' && state.player.inventory.weaponOwned)) return state

    const player = { ...state.player, gold: state.player.gold - action.price }
    if (action.item === 'weapon') {
      player.attack += 3
      player.inventory = { ...player.inventory, weaponOwned: true }
      return addLog({ ...state, player }, 'ซื้อดาบปลาเค็มสำเร็จ! ATK เพิ่มขึ้น 3 หน่วย')
    }

    player.inventory = {
      ...player.inventory,
      [action.item]: player.inventory[action.item] + 1,
    }
    return addLog({ ...state, player }, `ซื้อ${action.label}สำเร็จ`)
  }

  if (action.type === 'FLEE') {
    if (state.phase !== 'playerTurn') return state
    if (action.success) {
      return {
        ...addLog(state, `หนีสำเร็จ! ${action.joke} ไม่ได้รับรางวัล`),
        phase: 'fled',
        defending: false,
      }
    }
    return {
      ...addLog(state, `หนีไม่สำเร็จ! ${action.joke}`),
      phase: 'enemyTurn',
      defending: false,
    }
  }

  if (action.type === 'ENEMY_TURN') {
    if (state.phase !== 'enemyTurn' || !state.enemy) return state

    const damage = state.defending ? Math.floor(action.damage * 0.5) : action.damage
    const hp = Math.max(0, state.player.hp - damage)
    const enemy = {
      ...state.enemy,
      mp: action.skill
        ? Math.max(0, state.enemy.mp - (action.skill.mpCost || 8))
        : state.enemy.mp,
      defenseDownTurns: Math.max(0, state.enemy.defenseDownTurns - 1),
    }
    if (enemy.defenseDownTurns === 0) enemy.defense = enemy.baseDefense
    const player = { ...state.player, hp }
    const log = action.skill
      ? `${state.enemy.name} ใช้ ${action.skill.name}! ${action.skill.description} ${action.skillJoke} ทำ ${damage} HP`
      : `${state.enemy.name} โจมตีธรรมดา ทำ ${damage} HP`

    let nextState = {
      ...state,
      player,
      enemy,
      defending: false,
      phase: 'playerTurn',
    }
    nextState = applyDamagePopup(nextState, 'player', damage, action.popupId)

    if (hp === 0) {
      const penalty = applyDefeatPenalty(player)
      return {
        ...addLog(
          { ...nextState, player: penalty.player, phase: 'defeat' },
          `${log}... ${action.defeatJoke}`,
          `เสีย Gold ${penalty.goldLost} (10%) และฟื้น HP เป็น ${penalty.player.hp} เพื่อกลับไปซ้อมต่อ`,
        ),
      }
    }

    const defenseMessage = state.defending ? ' (ป้องกันลดความเสียหาย 50%)' : ''
    return addLog(nextState, `${log}${defenseMessage}! ตาคุณแล้ว`)
  }

  if (state.phase !== 'playerTurn' || !state.enemy) return state

  if (action.type === 'PLAYER_ATTACK' || action.type === 'PLAYER_SKILL_ATTACK') {
    const skillCost = action.type === 'PLAYER_SKILL_ATTACK' ? action.skill.mpCost : 0
    if (state.player.mp < skillCost) return state

    const enemyHp = Math.max(0, state.enemy.hp - action.damage)
    const enemy = { ...state.enemy, hp: enemyHp }
    const playerAfterAction = skillCost > 0
      ? { ...state.player, mp: state.player.mp - skillCost }
      : state.player
    const message = action.message
    let nextState = {
      ...state,
      player: playerAfterAction,
      enemy,
      defending: false,
      phase: enemyHp === 0 ? 'victory' : 'enemyTurn',
    }
    nextState = applyDamagePopup(nextState, 'enemy', action.damage, action.popupId)

    if (enemyHp === 0) {
      const { levelsGained, ...player } = calculateVictoryProgress(playerAfterAction, state.enemy)
      const victoryLog = [
        `${message} ${state.enemy.name} HP หมด! ${action.victoryJoke}`,
        `ได้รับ EXP ${state.enemy.expReward} และ Gold ${state.enemy.goldReward}`,
      ]
      if (levelsGained > 0) {
        victoryLog.push(`เลเวลอัป! ตอนนี้เลเวล ${player.level} เพิ่ม HP/MP สูงสุด, ATK, DEF และฟื้นพลังเต็มแล้ว`)
      }
      return addLog({ ...nextState, player }, ...victoryLog)
    }

    return addLog(nextState, message)
  }

  if (action.type === 'PLAYER_SKILL_HEAL') {
    const hp = Math.min(state.player.maxHp, state.player.hp + action.skill.healAmount)
    const player = {
      ...state.player,
      hp,
      mp: state.player.mp - action.skill.mpCost,
    }
    return {
      ...addLog({ ...state, player, defending: false, phase: 'enemyTurn' },
        `${action.skill.name} ฟื้น HP ${hp - state.player.hp} หน่วย! ${action.joke}`),
    }
  }

  if (action.type === 'PLAYER_SKILL_DEBUFF') {
    const enemy = {
      ...state.enemy,
      defense: Math.max(0, state.enemy.baseDefense - action.skill.defenseReduction),
      defenseDownTurns: action.skill.duration,
    }
    return addLog({
      ...state,
      enemy,
      player: { ...state.player, mp: state.player.mp - action.skill.mpCost },
      defending: false,
      phase: 'enemyTurn',
    }, `${action.skill.name}! DEF ศัตรูลดลง ${action.skill.defenseReduction} เป็นเวลา ${action.skill.duration} เทิร์น ${action.joke}`)
  }

  if (action.type === 'PLAYER_DEFEND') {
    return addLog({ ...state, defending: true, phase: 'enemyTurn' },
      'ตั้งท่าป้องกัน! การโจมตีครั้งถัดไปจะเบาลง 50%')
  }

  if (action.type === 'PLAYER_ITEM') {
    const { item, amount, label } = action
    if (state.player.inventory[item] <= 0) return state

    const maxStat = item === 'hpPotion' ? state.player.maxHp : state.player.maxMp
    const stat = item === 'hpPotion' ? 'hp' : 'mp'
    const recovered = Math.min(amount, maxStat - state.player[stat])
    const player = {
      ...state.player,
      [stat]: state.player[stat] + recovered,
      inventory: {
        ...state.player.inventory,
        [item]: state.player.inventory[item] - 1,
      },
    }
    return addLog({ ...state, player, defending: false, phase: 'enemyTurn' },
      `${label} ฟื้น ${stat.toUpperCase()} ${recovered} หน่วย!`)
  }

  return state
}

export function useBattle(initialPlayer) {
  const [state, dispatch] = useReducer(battleReducer, {
    player: initialPlayer,
    enemy: null,
    phase: 'idle',
    defending: false,
    log: [],
    damagePopups: { player: null, enemy: null },
  })
  const previousJokeIndexes = useRef({})
  const popupSequence = useRef(0)

  const getJoke = useCallback((category) => pickJoke(category, previousJokeIndexes), [])

  const nextPopupId = useCallback((target) => {
    popupSequence.current += 1
    const id = popupSequence.current
    setTimeout(() => dispatch({ type: 'CLEAR_DAMAGE', target, id }), 700)
    return id
  }, [])

  function startBattle() {
    const selectedEnemy = enemies[Math.floor(randomValue() * enemies.length)]
    dispatch({
      type: 'START_BATTLE',
      enemy: scaleEnemyToLevel(selectedEnemy, state.player.level),
      joke: getJoke('encounter'),
    })
  }

  function attack() {
    if (state.phase !== 'playerTurn' || !state.enemy) return
    const { damage, isCritical } = calculateDamage({
      attack: state.player.attack,
      defense: state.enemy.defense,
      randomBonus: Math.floor(randomValue() * 6) - 2,
      criticalRoll: randomValue(),
    })
    const criticalMessage = isCritical ? ` ${getJoke('critical')}` : ''
    dispatch({
      type: 'PLAYER_ATTACK',
      damage,
      message: `โจมตี ${state.enemy.name} ไป ${damage} HP!${criticalMessage}`,
      victoryJoke: getJoke('victory'),
      popupId: nextPopupId('enemy'),
    })
  }

  function useSkill(skill) {
    if (state.phase !== 'playerTurn' || !state.enemy || state.player.mp < skill.mpCost) return
    if (skill.type === 'heal' && state.player.hp === state.player.maxHp) return

    if (skill.type === 'attack') {
      const { damage } = calculateDamage({
        attack: skill.attack,
        defense: state.enemy.defense,
        randomBonus: Math.floor(randomValue() * 6) - 2,
        criticalChance: 0,
      })
      dispatch({
        type: 'PLAYER_SKILL_ATTACK',
        skill,
        damage,
        message: `${skill.name} ใส่ ${state.enemy.name} ${damage} HP! ${getJoke('skill')}`,
        victoryJoke: getJoke('victory'),
        popupId: nextPopupId('enemy'),
      })
    } else if (skill.type === 'heal') {
      dispatch({ type: 'PLAYER_SKILL_HEAL', skill, joke: getJoke('skill') })
    } else {
      dispatch({ type: 'PLAYER_SKILL_DEBUFF', skill, joke: getJoke('skill') })
    }
  }

  function useItem(item) {
    if (state.phase !== 'playerTurn') return
    const isHpPotion = item === 'hpPotion'
    const current = isHpPotion ? state.player.hp : state.player.mp
    const maximum = isHpPotion ? state.player.maxHp : state.player.maxMp
    if (state.player.inventory[item] < 1 || current === maximum) return
    dispatch({
      type: 'PLAYER_ITEM',
      item,
      amount: isHpPotion ? 35 : 15,
      label: isHpPotion ? 'ดื่มยาฟื้น HP (รสชาติเหมือนน้ำล้างแก้ว)' : 'ดื่มยาฟื้น MP (กลิ่นเหมือนแบตเตอรี่)',
    })
  }

  function flee() {
    if (state.phase !== 'playerTurn') return
    const success = randomValue() < 0.5
    dispatch({
      type: 'FLEE',
      success,
      joke: getJoke(success ? 'flee' : 'failedFlee'),
    })
  }

  function buyItem(item) {
    const itemData = shopItems[item]
    dispatch({ type: 'SHOP_PURCHASE', item, ...itemData })
  }

  const { enemy, phase, defending, player } = state

  useEffect(() => {
    if (phase !== 'enemyTurn' || !enemy) return undefined

    // หน่วงเทิร์นศัตรูให้ผู้เล่นอ่านข้อความก่อน
    const timer = setTimeout(() => {
      const choice = chooseEnemyAction(enemy, randomValue(), randomValue())
      const skill = choice.type === 'skill' ? choice.skill : null
      const rawDamage = getEnemyDamage(
        enemy,
        player.defense,
        Math.floor(randomValue() * 6) - 2,
        skill,
      )
      dispatch({
        type: 'ENEMY_TURN',
        damage: rawDamage,
        skill,
        skillJoke: skill ? getJoke('skill') : '',
        defeatJoke: getJoke('defeat'),
        popupId: nextPopupId('player'),
      })
    }, enemyTurnDelay)

    return () => clearTimeout(timer)
  }, [defending, enemy, getJoke, nextPopupId, phase, player])

  return {
    state,
    startBattle,
    attack,
    defend: () => dispatch({ type: 'PLAYER_DEFEND' }),
    useSkill,
    useItem,
    flee,
    buyItem,
  }
}
