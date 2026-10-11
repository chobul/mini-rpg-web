export function scaleEnemyToLevel(enemy, level) {
  const scale = 1 + level * 0.15
  const maxHp = Math.round(enemy.baseHp * scale)
  const defense = Math.max(0, Math.round(enemy.baseDef * scale))
  const maxMp = Math.round((enemy.baseMp || 30) * scale)

  return {
    ...enemy,
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    attack: Math.max(1, Math.round(enemy.baseAtk * scale)),
    defense,
    baseDefense: defense,
    defenseDownTurns: 0,
    level,
  }
}

export function calculateDamage({
  attack,
  defense,
  randomBonus = 0,
  criticalRoll = 1,
  criticalChance = 0.15,
  damageMultiplier = 1,
}) {
  const baseDamage = Math.max(1, attack - defense + randomBonus)
  const isCritical = criticalRoll < criticalChance
  const damage = Math.round(baseDamage * damageMultiplier * (isCritical ? 2 : 1))
  return { damage, isCritical }
}

export function chooseEnemyAction(enemy, randomChoice, randomSkill = 0) {
  const availableSkills = enemy.skills.filter((skill) => enemy.mp >= (skill.mpCost || 8))
  const canUseSkill = availableSkills.length > 0 && randomChoice >= 0.7

  if (!canUseSkill) return { type: 'attack' }

  const skillIndex = Math.min(
    availableSkills.length - 1,
    Math.floor(randomSkill * availableSkills.length),
  )
  return { type: 'skill', skill: availableSkills[skillIndex] }
}

export function getEnemyDamage(enemy, playerDefense, randomBonus, skill = null) {
  const attack = skill
    ? Math.round(enemy.attack * skill.damageMultiplier)
    : enemy.attack
  return Math.max(1, attack - playerDefense + randomBonus)
}

export function calculateVictoryProgress(player, enemy) {
  let level = player.level
  let exp = player.exp + enemy.expReward
  let levelsGained = 0

  // ใช้ EXP ส่วนเกินต่อเนื่องได้เมื่อเลเวลอัปหลายครั้ง
  while (exp >= level * 50) {
    exp -= level * 50
    level += 1
    levelsGained += 1
  }

  const maxHp = player.maxHp + levelsGained * 20
  const maxMp = player.maxMp + levelsGained * 10
  return {
    ...player,
    level,
    exp,
    gold: player.gold + enemy.goldReward,
    maxHp,
    hp: levelsGained > 0 ? maxHp : player.hp,
    maxMp,
    mp: levelsGained > 0 ? maxMp : player.mp,
    attack: player.attack + levelsGained * 2,
    defense: player.defense + levelsGained,
    levelsGained,
  }
}

export function applyDefeatPenalty(player) {
  const goldLost = Math.floor(player.gold * 0.1)
  return {
    player: {
      ...player,
      hp: Math.ceil(player.maxHp * 0.5),
      gold: player.gold - goldLost,
    },
    goldLost,
  }
}
