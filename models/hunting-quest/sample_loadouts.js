import Loadout from './loadout.js';
export default sampleLoadouts = [
  new Loadout(
    'High Damage Glaive',
    'Insect Glaive loadout focused on maximizing damage output.',
    [LoadoutRole.DPS, LoadoutRole.Any],
    [new WeaponType('4', 'Insect Glaive')],
    [],
    [
      new LoadoutSkill(
        '00000001',
        'Attack Boost',
        'SKILL_0000',
        'Increases attack power.',
        'WEAPON',
        4,
        5,
        null,
        [
          'Attack +3',
          'Attack +5',
          'Attack +7',
          'Attack +2%',
          'Attack +4% + Bonus: +8',
        ]
      ),
      new LoadoutSkill(
        '830A1C00',
        'Critical Eye',
        'SKILL_0001',
        'Increases affinity.',
        'WEAPON',
        3,
        5,
        null,
        [
          'Affinity +4%',
          'Affinity +8%',
          'Affinity +12%',
          'Affinity +16%',
          'Affinity +20%',
        ]
      ),
      new LoadoutSkill(
        'E84D8E60',
        'Weakness Exploit',
        'SKILL_0000',
        "Increases the affinity of attacks that exploit a monster's weak points and wounds.",
        'EQUIP',
        3,
        5,
        null,
        [
          'Attacks that hit weak points gain affinity +5%, with an extra 3% on wounds.',
          'Attacks that hit weak points gain affinity +10%, with an extra 5% on wounds.',
          'Attacks that hit weak points gain affinity +15%, with an extra 10% on wounds.',
          'Attacks that hit weak points have 20% increased affinity, with an extra 15% on wounds.',
          'Attacks that hit weak points have 30% increased affinity, with an extra 20% on wounds.',
        ]
      ),
    ]
  ),
  new Loadout(
    'Status SnS Build',
    'Sword and Shield loadout designed to apply status effects quickly.',
    [LoadoutRole.STATUS, LoadoutRole.Any],
    [new WeaponType('13', 'Sword & Shield')],
    [new WeaponAttribute('6', 'POISON', 'STATUS_0005')],
    [
      new LoadoutSkill(
        '830A1C00',
        'Critical Eye',
        'SKILL_0001',
        'Increases affinity.',
        'WEAPON',
        2,
        5,
        null,
        [
          'Affinity +4%',
          'Affinity +8%',
          'Affinity +12%',
          'Affinity +16%',
          'Affinity +20%',
        ]
      ),
      // Assuming a skill for status application exists, using a placeholder here
      new LoadoutSkill(
        'STATUS001',
        'Poison Attack',
        'SKILL_0002',
        'Increases the buildup of poison.',
        'EQUIP',
        3,
        3,
        null,
        ['Poison buildup +5%', 'Poison buildup +10%', 'Poison buildup +20%']
      ),
      new LoadoutSkill(
        'A02B7A00',
        'Critical Boost',
        'SKILL_0001',
        'Increases the damage of critical hits.',
        'WEAPON',
        1,
        5,
        null,
        [
          'Increases damage dealt by critical hits to 28%.',
          'Increases damage dealt by critical hits to 31%.',
          'Increases damage dealt by critical hits to 34%.',
          'Increases damage dealt by critical hits to 37%.',
          'Increases damage dealt by critical hits to 40%.',
        ]
      ),
    ]
  ),
  new Loadout(
    'Defensive Tank Lance',
    'Lance loadout focused on survivability and defense.',
    [LoadoutRole.TANK, LoadoutRole.Any],
    [new WeaponType('8', 'Lance')],
    [],
    [
      // Assuming a defensive skill exists, using a placeholder
      new LoadoutSkill(
        'DEFENSE001',
        'Guard',
        'SKILL_0003',
        'Reduces knockback and stamina depletion when guarding.',
        'EQUIP',
        3,
        5,
        null,
        [
          'Slightly reduces knockback and stamina depletion.',
          'Moderately reduces knockback and stamina depletion.',
          'Greatly reduces knockback and stamina depletion.',
          'Significantly reduces knockback and stamina depletion.',
          'Massively reduces knockback and stamina depletion.',
        ]
      ),
      new LoadoutSkill(
        '510D3C80',
        'Resentment',
        'SKILL_0000',
        'Increases attack when you have recoverable damage (the red portion of your Health Gauge).',
        'EQUIP',
        2,
        5,
        null,
        [
          'Attack +5 while active.',
          'Attack +10 while active.',
          'Attack +15 while active.',
          'Attack +20 while active.',
          'Attack +25 while active.',
        ]
      ),
    ]
  ),
  new Loadout(
    'Balanced Hunting Horn',
    'Hunting Horn loadout providing support and decent damage.',
    [LoadoutRole.HEALER, LoadoutRole.DPS, LoadoutRole.Any],
    [new WeaponType('9', 'Hunting Horn')],
    [],
    [
      // Assuming a support skill exists, using a placeholder
      new LoadoutSkill(
        'SUPPORT001',
        'Wide-Range',
        'SKILL_0004',
        'Extends the effect of certain recovery and support items to nearby allies.',
        'EQUIP',
        3,
        5,
        null,
        [
          'Slightly extends the range.',
          'Moderately extends the range.',
          'Greatly extends the range.',
          'Considerably extends the range.',
          'Massively extends the range.',
        ]
      ),
      new LoadoutSkill(
        '00000001',
        'Attack Boost',
        'SKILL_0000',
        'Increases attack power.',
        'WEAPON',
        2,
        5,
        null,
        [
          'Attack +3',
          'Attack +5',
          'Attack +7',
          'Attack +2%',
          'Attack +4% + Bonus: +8',
        ]
      ),
      new LoadoutSkill(
        'F53436B0',
        'Offensive Guard',
        'SKILL_0000',
        'Temporarily increases attack power after executing a perfectly-timed guard.',
        'WEAPON',
        1,
        3,
        null,
        [
          'Attack +5% while active.',
          'Attack +10% while active.',
          'Attack +15% while active.',
        ]
      ),
    ]
  ),
];
