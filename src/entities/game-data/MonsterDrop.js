import Item from './Item.js';

/** Represents monster drop item info. */
class MonsterDrop extends Item {
  /**
   * @param {string} id Unique Item ID
   * @param {string} name Item name.
   * @param {string} icon Icon name.
   * @param {string} iconColor Icon coloring. DEFAULT WHITE
   * @param {string} description
   * @param {string} type 'MATERIAL' always
   * @param {number} rarity 1-7 with 1 being common; 7 - Super Rare
   * @param {string} source Where to get the item.
   * @param {string} rewardType Carving; Broken Part Reward; Target Reward; etc.
   * @param {string} rank HIGH/LOW rank
   * @param {string} brokenPart Present if rewardType: Broken Part Reward
   * @param {string} brokenPartIcon Present if rewardType: Broken Part Reward
   * @param {number} number The num of said item as a reward.
   * @param {number} probability The prob as a floating point number.
   * @param {boolean} carveSeveredPart Whether the severed part can be carved. False by default
   */
  constructor(
    id,
    name,
    icon,
    iconColor,
    description,
    type,
    rarity,
    source,
    rewardType,
    rank,
    brokenPart,
    brokenPartIcon,
    number,
    probability,
    carveSeveredPart = false
  ) {
    super(id, name, icon, iconColor, description, type, rarity, source);

    this.rewardType = rewardType;
    this.rank = rank;
    this.brokenPart = brokenPart;
    this.brokenPartIcon = brokenPartIcon;
    this.number = number;
    this.probability = probability;
    this.carveSeveredPart = carveSeveredPart;
  }
}

export default MonsterDrop;
