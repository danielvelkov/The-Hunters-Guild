const {
  LoadoutRole,
  LoadoutSkill,
  Loadout,
} = require('../../entities/Loadout');
const WeaponType = require('../../entities/game-data/WeaponType');
const WeaponAttribute = require('../../entities/game-data/WeaponAttribute');

const skillsMap = {
  AttackBoost: new LoadoutSkill(
    '00000001',
    'Attack Boost',
    'SKILL_0000',
    'Increases attack power.',
    'WEAPON',
    4,
    5,
    '',
    [
      'Attack +3',
      'Attack +5',
      'Attack +7',
      'Attack +2% Bonus: +8',
      'Attack +4% Bonus: +9',
    ]
  ),
  CriticalEye: new LoadoutSkill(
    '830A1C00',
    'Critical Eye',
    'SKILL_0001',
    'Increases affinity.',
    'WEAPON',
    5,
    5,
    '',
    [
      'Affinity +4%',
      'Affinity +8%',
      'Affinity +12%',
      'Affinity +16%',
      'Affinity +20%',
    ]
  ),
  CriticalBoost: new LoadoutSkill(
    'A02B7A00',
    'Critical Boost',
    'SKILL_0001',
    'Increases the damage of critical hits.',
    'WEAPON',
    3,
    5,
    '',
    [
      'Increases damage dealt by critical hits to 28%',
      'Increases damage dealt by critical hits to 31%',
      'Increases damage dealt by critical hits to 34%',
      'Increases damage dealt by critical hits to 37%',
      'Increases damage dealt by critical hits to 40%',
    ]
  ),
  WeaknessExploit: new LoadoutSkill(
    'E84D8E60',
    'Weakness Exploit',
    'SKILL_0000',
    "Increases the affinity of attacks that exploit a monster's weak points and wounds.",
    'EQUIP',
    3,
    5,
    '',
    [
      'Attacks that hit weak points gain affinity +5%, with an extra 3% on wounds',
      'Attacks that hit weak points gain affinity +10%, with an extra 5% on wounds',
      'Attacks that hit weak points gain affinity +15%, with an extra 10% on wounds',
      'Attacks that hit weak points have 20% increased affinity, with an extra 15% on wounds',
      'Attacks that hit weak points have 30% increased affinity, with an extra 20% on wounds',
    ]
  ),
  Handicraft: new LoadoutSkill(
    '452DF400',
    'Handicraft',
    'SKILL_0003',
    'Extends the weapon sharpness gauge. However, it will not increase the gauge past its maximum.',
    'WEAPON',
    3,
    5,
    '',
    [
      'Weapon sharpness +10',
      'Weapon sharpness +20',
      'Weapon sharpness +30',
      'Weapon sharpness +40',
      'Weapon sharpness +50',
    ]
  ),
  ProtectivePolish: new LoadoutSkill(
    '596A2780',
    'Protective Polish',
    'SKILL_0003',
    'Weapon sharpness does not decrease for a set time after sharpening.',
    'WEAPON',
    3,
    3,
    '',
    [
      'Grants no sharpness loss for 30 seconds after activation',
      'Grants no sharpness loss for 60 seconds after activation',
      'Grants no sharpness loss for 90 seconds after activation',
    ]
  ),
  CriticalDraw: new LoadoutSkill(
    '28EBAB40',
    'Critical Draw',
    'SKILL_0001',
    'Increases affinity when performing draw attacks. (Not effective while riding.)',
    'WEAPON',
    3,
    3,
    '',
    ['Affinity +50%', 'Affinity +75%', 'Affinity +100%']
  ),
  Focus: new LoadoutSkill(
    'EF1CAA60',
    'Focus',
    'SKILL_0008',
    'Increases the fill rate for weapons with gauges and the charge rate for weapons with charge attacks.',
    'WEAPON',
    3,
    3,
    '',
    [
      'Slightly increases gauge fill rate and reduces charge times by 5%',
      'Moderately increases gauge fill rate and reduces charge times by 10%',
      'Increases gauge fill rate and reduces charge times by 15%',
    ]
  ),
  QuickSheathe: new LoadoutSkill(
    'C0053240',
    'Quick Sheathe',
    'SKILL_0009',
    'Speeds up weapon sheathing.',
    'EQUIP',
    3,
    3,
    '',
    [
      'Slightly increases sheathing speed',
      'Increases sheathing speed',
      'Greatly increases sheathing speed',
    ]
  ),
  PunishingDraw: new LoadoutSkill(
    '8BFD1E80',
    'Punishing Draw',
    'SKILL_0008',
    'Adds a stun effect to draw attacks and slightly increases attack power. (Not effective while riding.)',
    'WEAPON',
    3,
    3,
    '',
    [
      'Draw attacks deal a small amount of stun damage and gain attack +3',
      'Draw attacks deal a medium amount of stun damage and gain attack +5',
      'Draw attacks deal a large amount of stun damage and gain attack +7',
    ]
  ),
  RapidMorph: new LoadoutSkill(
    '8B1BBD80',
    'Rapid Morph',
    'SKILL_0008',
    'Increases switch speed and power for switch axes and charge blades.',
    'WEAPON',
    3,
    3,
    '',
    [
      'Speed +10%',
      'Speed +20% Morph attack damage +10%',
      'Speed +30% Morph attack damage +20%',
    ]
  ),
  PowerProlonger: new LoadoutSkill(
    '2932DD00',
    'Power Prolonger',
    'SKILL_0008',
    'Allows long swords, dual blades, insect glaives, switch axes, and charge blades to stay powered up longer.',
    'WEAPON',
    3,
    3,
    '',
    [
      'Moderately boosts the duration weapons are powered up',
      'Boosts the duration weapons are powered up',
      'Greatly boosts the duration weapons are powered up',
    ]
  ),
  SluggerSkill: new LoadoutSkill(
    'CABFAFC0',
    'Slugger',
    'SKILL_0008',
    'Makes it easier to stun monsters.',
    'WEAPON',
    3,
    3,
    '',
    ['Stun power +20%', 'Stun power +30%', 'Stun power +40%']
  ),
  Artillery: new LoadoutSkill(
    'DC6E1A40',
    'Artillery',
    'SKILL_0008',
    "Strengthens explosive attacks like shells, Wyvern's Fire, charge blade phial attacks, and Sticky Ammo.",
    'WEAPON',
    3,
    3,
    '',
    [
      "Moderately increases each attack and Wyvern's Fire firing speed. Shelling fire attack +30",
      "Increases each attack and Wyvern's Fire firing speed. Shelling fire attack +60",
      "Greatly increases each attack and Wyvern's Fire firing speed. Shelling fire attack +90",
    ]
  ),
  EvadeWindow: new LoadoutSkill(
    '089F5840',
    'Evade Window',
    'SKILL_0009',
    'Extends the invulnerability period when evading.',
    'EQUIP',
    3,
    5,
    '',
    [
      'Very slightly increases invulnerability window',
      'Slightly increases invulnerability window',
      'Increases invulnerability window',
      'Greatly increases invulnerability window',
      'Massively increases invulnerability window',
    ]
  ),
  Guard: new LoadoutSkill(
    'EDA9B920',
    'Guard',
    'SKILL_0009',
    'Reduces knockbacks and stamina depletion when guarding.',
    'WEAPON',
    3,
    3,
    '',
    [
      'Slightly decreases the impact of attacks and reduces stamina depletion by 15%',
      'Decreases the impact of attacks and reduces stamina depletion by 30%',
      'Greatly decreases the impact of attacks and reduces stamina depletion by 50%',
    ]
  ),
  ConstitutionSkill: new LoadoutSkill(
    '9B4DED80',
    'Constitution',
    'SKILL_0007',
    'Reduces stamina depletion when evading, blocking, or doing certain other actions.',
    'EQUIP',
    3,
    5,
    '',
    [
      'Reduces fixed stamina depletion by 10%',
      'Reduces fixed stamina depletion by 20%',
      'Reduces fixed stamina depletion by 30%',
      'Reduces fixed stamina depletion by 40%',
      'Reduces fixed stamina depletion by 50%',
    ]
  ),
  PeakPerformance: new LoadoutSkill(
    '7D946580',
    'Peak Performance',
    'SKILL_0000',
    'Increases attack when your health is full.',
    'EQUIP',
    3,
    5,
    '',
    [
      'Attack +3 while active',
      'Attack +6 while active',
      'Attack +10 while active',
      'Attack +15 while active',
      'Attack +20 while active',
    ]
  ),
  SpreadShots: new LoadoutSkill(
    '81666D00',
    'Spread/Power Shots',
    'SKILL_0004',
    "Increases the attack of the bowgun's Spread Ammo and the bow's Power Shots and Quick Shots.",
    'WEAPON',
    1,
    1,
    '',
    ['Slightly increases the power of specified ammo and arrows']
  ),
  NormalShots: new LoadoutSkill(
    '8B18FB00',
    'Normal Shots',
    'SKILL_0004',
    'Increases the attack power of Normal Ammo, normal arrows, and Flying Swallow Shot.',
    'WEAPON',
    1,
    1,
    '',
    ['Slightly increases the power of specified ammo and arrows']
  ),
  PiercingShots: new LoadoutSkill(
    '20F5D880',
    'Piercing Shots',
    'SKILL_0004',
    "Increases the attack of the bowgun's Pierce Ammo, and the bow's Dragon Piercer and Thousand Dragons.",
    'WEAPON',
    1,
    1,
    '',
    ['Slightly increases the power of specified ammo and arrows']
  ),
  RazorSharp: new LoadoutSkill(
    '3E9DAB40',
    'Razor Sharp',
    'SKILL_0003',
    'Prevents your weapon from losing sharpness.',
    'WEAPON',
    2,
    3,
    '',
    [
      'Grants a 10% chance of no sharpness loss',
      'Grants a 25% chance of no sharpness loss',
      'Grants a 50% chance of no sharpness loss',
    ]
  ),
  MasterTouch: new LoadoutSkill(
    '52D79300',
    "Master's Touch",
    'SKILL_0003',
    'Prevents your weapon from losing sharpness during critical hits.',
    'WEAPON',
    1,
    1,
    '',
    ['Grants an 80% chance of no sharpness loss while active']
  ),
  LatentPower: new LoadoutSkill(
    '69182900',
    'Latent Power',
    'SKILL_0008',
    'Temporarily increases affinity and reduces stamina depletion when certain conditions are met.',
    'EQUIP',
    3,
    5,
    '',
    [
      'While active, affinity +10% and reduces stamina depletion by 30%',
      'While active, affinity +20% and reduces stamina depletion by 30%',
      'While active, affinity +30% and reduces stamina depletion by 50%',
      'While active, affinity +40% and reduces stamina depletion by 50%',
      'While active, affinity +50% and reduces stamina depletion by 50%',
    ]
  ),
  Burst: new LoadoutSkill(
    '21BA7280',
    'Burst',
    'SKILL_0008',
    'Continuously landing hits gradually increases attack and elemental attack. (Amount increased depends on weapon.)',
    'EQUIP',
    3,
    5,
    '',
    [
      'On first hit, gain a small temporary attack and element boost, replaced by a larger boost after the fifth hit',
      'Hit 5 successive times for a moderate stat boost',
      'Hit 5 successive times for a bigger stat boost',
      'Hit 5 successive times for an even bigger stat boost',
      'Hit 5 successive times for a huge stat boost',
    ]
  ),
  StaminaSurge: new LoadoutSkill(
    'ED31F720',
    'Stamina Surge',
    'SKILL_0007',
    'Speeds up stamina recovery.',
    'EQUIP',
    3,
    3,
    '',
    [
      'Stamina recovery speed +10%',
      'Stamina recovery speed +30%',
      'Stamina recovery speed +50%',
    ]
  ),
  Agitator: new LoadoutSkill(
    '6F378580',
    'Agitator',
    'SKILL_0008',
    'Increases attack power and affinity when large monsters become enraged.',
    'EQUIP',
    3,
    5,
    '',
    [
      'Attack +4 and affinity +3% while active',
      'Attack +8 and affinity +5% while active',
      'Attack +12 and affinity +7% while active',
      'Attack +16 and affinity +10% while active',
      'Attack +20 and affinity +15% while active',
    ]
  ),
  OffensiveGuard: new LoadoutSkill(
    'F53436B0',
    'Offensive Guard',
    'SKILL_0000',
    'Temporarily increases attack power after executing a perfectly-timed guard.',
    'WEAPON',
    3,
    3,
    '',
    [
      'Attack +5% while active',
      'Attack +10% while active',
      'Attack +15% while active',
    ]
  ),
  ChargeMaster: new LoadoutSkill(
    'A8133D80',
    'Charge Master',
    'SKILL_0002',
    'Increases element power and status buildup for charged attacks.',
    'WEAPON',
    3,
    3,
    '',
    [
      'Slightly increases elemental damage and status buildup for charged attacks',
      'Increases elemental damage and status buildup for charged attacks',
      'Greatly increases elemental damage and status buildup for charged attacks',
    ]
  ),
  CriticalElement: new LoadoutSkill(
    '12B121E0',
    'Critical Element',
    'SKILL_0002',
    'Increases elemental damage (fire, water, thunder, ice, dragon) when landing critical hits.',
    'WEAPON',
    3,
    3,
    '',
    [
      'Slightly increases elemental damage while active',
      'Increases elemental damage while active',
      'Greatly increases elemental damage while active',
    ]
  ),
  FireAttack: new LoadoutSkill(
    'DE786840',
    'Fire Attack',
    'SKILL_0002',
    'Increases fire element attack power. (Elemental attack power has a maximum limit.)',
    'WEAPON',
    3,
    3,
    '',
    [
      'Fire attack +40',
      'Fire attack +10% Bonus: +50',
      'Fire attack +20% Bonus: +60',
    ]
  ),
  WaterAttack: new LoadoutSkill(
    '1E5573E0',
    'Water Attack',
    'SKILL_0002',
    'Increases water element attack power. (Elemental attack power has a maximum limit.)',
    'WEAPON',
    3,
    3,
    '',
    [
      'Water attack +40',
      'Water attack +10% Bonus: +50',
      'Water attack +20% Bonus: +60',
    ]
  ),
  ThunderAttack: new LoadoutSkill(
    '568DE880',
    'Thunder Attack',
    'SKILL_0002',
    'Increases thunder element attack power. (Elemental attack power has a maximum limit.)',
    'WEAPON',
    3,
    3,
    '',
    [
      'Thunder attack +40',
      'Thunder attack +10% Bonus: +50',
      'Thunder attack +20% Bonus: +60',
    ]
  ),
  IceAttack: new LoadoutSkill(
    '4B953800',
    'Ice Attack',
    'SKILL_0002',
    'Increases ice element attack power. (Elemental attack power has a maximum limit.)',
    'WEAPON',
    3,
    3,
    '',
    [
      'Ice attack +40',
      'Ice attack +10% Bonus: +50',
      'Ice attack +20% Bonus: +60',
    ]
  ),
  DragonAttack: new LoadoutSkill(
    'D1B0BE00',
    'Dragon Attack',
    'SKILL_0002',
    'Increases dragon element attack power. (Elemental attack power has a maximum limit.)',
    'WEAPON',
    3,
    3,
    '',
    [
      'Dragon attack +40',
      'Dragon attack +10% Bonus: +50',
      'Dragon attack +20% Bonus: +60',
    ]
  ),
};

module.exports = [
  // Great Sword Meta Build
  new Loadout(
    'Crit Draw Great Sword',
    'Focuses on maximizing draw attack damage with high affinity and critical damage',
    [LoadoutRole.DPS],
    [WeaponType.GREAT_SWORD],
    [WeaponAttribute.DRAGON],
    [
      skillsMap.CriticalDraw,
      skillsMap.CriticalBoost,
      skillsMap.QuickSheathe,
      skillsMap.Focus,
      skillsMap.AttackBoost,
      skillsMap.WeaknessExploit,
      skillsMap.PunishingDraw,
    ]
  ),

  // Long Sword Meta Build
  new Loadout(
    'Counter LS',
    'Counter-focused build with high critical rate and quick sheathe for Iai moves',
    [LoadoutRole.DPS],
    [WeaponType.LONG_SWORD],
    [WeaponAttribute.DRAGON],
    [
      skillsMap.QuickSheathe,
      skillsMap.CriticalEye,
      skillsMap.CriticalBoost,
      skillsMap.WeaknessExploit,
      skillsMap.AttackBoost,
      skillsMap.PeakPerformance,
      skillsMap.Burst,
    ]
  ),

  // Sword and Shield Meta Build
  new Loadout(
    'Perfect Rush SnS',
    'Maximizes Perfect Rush damage with high affinity and sharpness management',
    [LoadoutRole.DPS],
    [WeaponType.SWORD_AND_SHIELD],
    [WeaponAttribute.BLAST],
    [
      skillsMap.AttackBoost,
      skillsMap.CriticalEye,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalBoost,
      skillsMap.ProtectivePolish,
      skillsMap.Burst,
      skillsMap.Agitator,
    ]
  ),

  // Dual Blades Elemental Build
  new Loadout(
    'Elemental Dual Blades',
    'High elemental damage with critical element for maximum elemental DPS',
    [LoadoutRole.DPS],
    [WeaponType.DUAL_BLADES],
    [WeaponAttribute.ICE, WeaponAttribute.THUNDER],
    [
      skillsMap.CriticalElement,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalEye,
      skillsMap.ThunderAttack,
      skillsMap.IceAttack,
      skillsMap.ProtectivePolish,
      skillsMap.ConstitutionSkill,
    ]
  ),

  // Hammer Meta Build
  new Loadout(
    'Slugger Hammer',
    'KO-focused build with high raw damage for maximum stun potential',
    [LoadoutRole.DPS],
    [WeaponType.HAMMER],
    [WeaponAttribute.BLAST],
    [
      skillsMap.SluggerSkill,
      skillsMap.AttackBoost,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalEye,
      skillsMap.CriticalBoost,
      skillsMap.Agitator,
      skillsMap.PeakPerformance,
    ]
  ),

  // Lance Meta Build
  new Loadout(
    'Counter Lance',
    'Defensive counter-focused build with guard skills and offensive guard',
    [LoadoutRole.TANK],
    [WeaponType.LANCE],
    [WeaponAttribute.DRAGON],
    [
      skillsMap.Guard,
      skillsMap.OffensiveGuard,
      skillsMap.AttackBoost,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalEye,
      skillsMap.CriticalBoost,
      skillsMap.Agitator,
    ]
  ),

  // Gunlance Meta Build
  new Loadout(
    'Artillery Gunlance',
    'Focuses on shell damage with artillery and high raw damage',
    [LoadoutRole.DPS],
    [WeaponType.GUNLANCE],
    [WeaponAttribute.BLAST],
    [
      skillsMap.Artillery,
      skillsMap.AttackBoost,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalEye,
      skillsMap.CriticalBoost,
      skillsMap.Handicraft,
      skillsMap.RazorSharp,
    ]
  ),

  // Switch Axe Meta Build
  new Loadout(
    'Rapid Morph Switch Axe',
    'Maximizes morph attacks with power prolonger and rapid morph',
    [LoadoutRole.DPS],
    [WeaponType.SWITCH_AXE],
    [WeaponAttribute.DRAGON],
    [
      skillsMap.RapidMorph,
      skillsMap.PowerProlonger,
      skillsMap.AttackBoost,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalEye,
      skillsMap.CriticalBoost,
      skillsMap.EvadeWindow,
    ]
  ),

  // Charge Blade Meta Build
  new Loadout(
    'Charge Blade - Amped Discharge',
    'Focus on Super Amped Element Discharge with artillery and focus',
    [LoadoutRole.DPS],
    [WeaponType.CHARGE_BLADE],
    [WeaponAttribute.DRAGON],
    [
      skillsMap.Artillery,
      skillsMap.Focus,
      skillsMap.RapidMorph,
      skillsMap.AttackBoost,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalEye,
      skillsMap.GuardSkill,
    ]
  ),

  // Insect Glaive Meta Build
  new Loadout(
    'Aerial Glaive',
    'Maximizes aerial damage with high affinity and power prolonger',
    [LoadoutRole.DPS],
    [WeaponType.INSECT_GLAIVE],
    [WeaponAttribute.DRAGON],
    [
      skillsMap.PowerProlonger,
      skillsMap.AttackBoost,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalEye,
      skillsMap.CriticalBoost,
      skillsMap.Burst,
      skillsMap.EvadeWindow,
    ]
  ),

  // Bow Meta Build
  new Loadout(
    'Critical Element Bow',
    'High elemental damage with critical element and stamina management',
    [LoadoutRole.DPS],
    [WeaponType.BOW],
    [WeaponAttribute.THUNDER, WeaponAttribute.WATER],
    [
      skillsMap.CriticalElement,
      skillsMap.ConstitutionSkill,
      skillsMap.StaminaSurge,
      skillsMap.WeaknessExploit,
      skillsMap.CriticalEye,
      skillsMap.NormalShots,
      skillsMap.SpreadShots,
    ]
  ),

  // Heavy Bowgun Meta Build
  new Loadout(
    'Sticky/Cluster HBG',
    'Focuses on explosive ammo types with artillery and attack boost',
    [LoadoutRole.DPS],
    [WeaponType.HEAVY_BOWGUN],
    [WeaponAttribute.BLAST],
    [
      skillsMap.Artillery,
      skillsMap.AttackBoost,
      skillsMap.PeakPerformance,
      skillsMap.Agitator,
      skillsMap.SluggerSkill,
      skillsMap.SpreadShots,
      skillsMap.EvadeWindow,
    ]
  ),
];
