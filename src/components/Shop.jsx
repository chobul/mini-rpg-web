import { shopItems } from '../data/items.js'

export default function Shop({ player, phase, onBuy }) {
  const isBattleActive = phase === 'playerTurn' || phase === 'enemyTurn'

  return (
    <section className="shopCard" aria-labelledby="shop-title">
      <h2 id="shop-title">ร้านค้าหน้าดันเจี้ยน</h2>
      <p>พ่อค้ารับ Gold เท่านั้น ไม่รับคำสัญญาว่าจะจ่ายทีหลัง</p>
      <div className="shopItems">
        <button
          onClick={() => onBuy('hpPotion')}
          disabled={isBattleActive || player.gold < shopItems.hpPotion.price}
        >
          {shopItems.hpPotion.label} - {shopItems.hpPotion.price} Gold
        </button>
        <button
          onClick={() => onBuy('mpPotion')}
          disabled={isBattleActive || player.gold < shopItems.mpPotion.price}
        >
          {shopItems.mpPotion.label} - {shopItems.mpPotion.price} Gold
        </button>
        <button
          onClick={() => onBuy('weapon')}
          disabled={isBattleActive || player.gold < shopItems.weapon.price || player.inventory.weaponOwned}
        >
          {player.inventory.weaponOwned
            ? 'ซื้อดาบปลาเค็มแล้ว'
            : `${shopItems.weapon.label} - ${shopItems.weapon.price} Gold`}
        </button>
      </div>
    </section>
  )
}
