const HuntingQuest = {
  nextId: 0,
  data: [
    {
      id: 0,
      title: 'Hunt the Rathian',
      category: {
        id: 5,
        name: 'Saved Investigation',
      },
      type: {
        id: 1,
        name: 'Hunt',
      },
      gamingPlatforms: [],
      quest_monsters: [
        {
          monster: {
            id: 'EM0001_00_0',
          },
          variant: {
            id: 1,
            name: 'Base',
          },
          crown: {
            id: 1,
            name: 'Base',
          },
        },
      ],
      player_slots: [
        {
          notes: '',
          loadout: {
            name: 'Crit Draw Great Sword',
            description:
              'Focuses on maximizing draw attack damage with high affinity and critical damage',
            roles: [
              {
                id: 1,
                name: 'DPS',
                summary: 'Tons of damage.',
              },
            ],
            weapon_types: [
              {
                id: '14',
                name: 'Great Sword',
              },
            ],
            weapon_attr: [
              {
                id: '5',
                name: 'DRAGON',
                icon: 'STATUS_0004',
              },
            ],
            skills: [
              {
                id: '28EBAB40',
                name: 'Critical Draw',
                icon: 'SKILL_0001',
                description:
                  'Increases affinity when performing draw attacks. (Not effective while riding.)',
                category: 'WEAPON',
                max_level: 3,
                set_count: '',
                level_descriptions: [
                  'Affinity +50%',
                  'Affinity +75%',
                  'Affinity +100%',
                ],
                min_level: 3,
              },
              {
                id: 'A02B7A00',
                name: 'Critical Boost',
                icon: 'SKILL_0001',
                description: 'Increases the damage of critical hits.',
                category: 'WEAPON',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'Increases damage dealt by critical hits to 28%',
                  'Increases damage dealt by critical hits to 31%',
                  'Increases damage dealt by critical hits to 34%',
                  'Increases damage dealt by critical hits to 37%',
                  'Increases damage dealt by critical hits to 40%',
                ],
                min_level: 3,
              },
              {
                id: 'C0053240',
                name: 'Quick Sheathe',
                icon: 'SKILL_0009',
                description: 'Speeds up weapon sheathing.',
                category: 'EQUIP',
                max_level: 3,
                set_count: '',
                level_descriptions: [
                  'Slightly increases sheathing speed',
                  'Increases sheathing speed',
                  'Greatly increases sheathing speed',
                ],
                min_level: 3,
              },
              {
                id: 'EF1CAA60',
                name: 'Focus',
                icon: 'SKILL_0008',
                description:
                  'Increases the fill rate for weapons with gauges and the charge rate for weapons with charge attacks.',
                category: 'WEAPON',
                max_level: 3,
                set_count: '',
                level_descriptions: [
                  'Slightly increases gauge fill rate and reduces charge times by 5%',
                  'Moderately increases gauge fill rate and reduces charge times by 10%',
                  'Increases gauge fill rate and reduces charge times by 15%',
                ],
                min_level: 3,
              },
              {
                id: '00000001',
                name: 'Attack Boost',
                icon: 'SKILL_0000',
                description: 'Increases attack power.',
                category: 'WEAPON',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'Attack +3',
                  'Attack +5',
                  'Attack +7',
                  'Attack +2% Bonus: +8',
                  'Attack +4% Bonus: +9',
                ],
                min_level: 4,
              },
              {
                id: 'E84D8E60',
                name: 'Weakness Exploit',
                icon: 'SKILL_0000',
                description:
                  "Increases the affinity of attacks that exploit a monster's weak points and wounds.",
                category: 'EQUIP',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'Attacks that hit weak points gain affinity +5%, with an extra 3% on wounds',
                  'Attacks that hit weak points gain affinity +10%, with an extra 5% on wounds',
                  'Attacks that hit weak points gain affinity +15%, with an extra 10% on wounds',
                  'Attacks that hit weak points have 20% increased affinity, with an extra 15% on wounds',
                  'Attacks that hit weak points have 30% increased affinity, with an extra 20% on wounds',
                ],
                min_level: 3,
              },
              {
                id: '8BFD1E80',
                name: 'Punishing Draw',
                icon: 'SKILL_0008',
                description:
                  'Adds a stun effect to draw attacks and slightly increases attack power. (Not effective while riding.)',
                category: 'WEAPON',
                max_level: 3,
                set_count: '',
                level_descriptions: [
                  'Draw attacks deal a small amount of stun damage and gain attack +3',
                  'Draw attacks deal a medium amount of stun damage and gain attack +5',
                  'Draw attacks deal a large amount of stun damage and gain attack +7',
                ],
                min_level: 3,
              },
            ],
          },
          id: '67de',
          displayName: 'Host',
          isOwner: true,
          configurationType: {
            name: 'Preset',
            description: 'Set from a loadout preset.',
          },
          canEdit: true,
          monsterPartFocus: [],
        },
        {
          notes: '',
          loadout: {
            name: 'Perfect Rush SnS',
            description:
              'Maximizes Perfect Rush damage with high affinity and sharpness management',
            roles: [
              {
                id: 1,
                name: 'DPS',
                summary: 'Tons of damage.',
              },
            ],
            weapon_types: [
              {
                id: '13',
                name: 'Sword & Shield',
              },
            ],
            weapon_attr: [
              {
                id: '9',
                name: 'BLAST',
                icon: 'STATUS_0010',
              },
            ],
            skills: [
              {
                id: '00000001',
                name: 'Attack Boost',
                icon: 'SKILL_0000',
                description: 'Increases attack power.',
                category: 'WEAPON',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'Attack +3',
                  'Attack +5',
                  'Attack +7',
                  'Attack +2% Bonus: +8',
                  'Attack +4% Bonus: +9',
                ],
                min_level: 4,
              },
              {
                id: '830A1C00',
                name: 'Critical Eye',
                icon: 'SKILL_0001',
                description: 'Increases affinity.',
                category: 'WEAPON',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'Affinity +4%',
                  'Affinity +8%',
                  'Affinity +12%',
                  'Affinity +16%',
                  'Affinity +20%',
                ],
                min_level: 5,
              },
              {
                id: 'E84D8E60',
                name: 'Weakness Exploit',
                icon: 'SKILL_0000',
                description:
                  "Increases the affinity of attacks that exploit a monster's weak points and wounds.",
                category: 'EQUIP',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'Attacks that hit weak points gain affinity +5%, with an extra 3% on wounds',
                  'Attacks that hit weak points gain affinity +10%, with an extra 5% on wounds',
                  'Attacks that hit weak points gain affinity +15%, with an extra 10% on wounds',
                  'Attacks that hit weak points have 20% increased affinity, with an extra 15% on wounds',
                  'Attacks that hit weak points have 30% increased affinity, with an extra 20% on wounds',
                ],
                min_level: 3,
              },
              {
                id: 'A02B7A00',
                name: 'Critical Boost',
                icon: 'SKILL_0001',
                description: 'Increases the damage of critical hits.',
                category: 'WEAPON',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'Increases damage dealt by critical hits to 28%',
                  'Increases damage dealt by critical hits to 31%',
                  'Increases damage dealt by critical hits to 34%',
                  'Increases damage dealt by critical hits to 37%',
                  'Increases damage dealt by critical hits to 40%',
                ],
                min_level: 3,
              },
              {
                id: '596A2780',
                name: 'Protective Polish',
                icon: 'SKILL_0003',
                description:
                  'Weapon sharpness does not decrease for a set time after sharpening.',
                category: 'WEAPON',
                max_level: 3,
                set_count: '',
                level_descriptions: [
                  'Grants no sharpness loss for 30 seconds after activation',
                  'Grants no sharpness loss for 60 seconds after activation',
                  'Grants no sharpness loss for 90 seconds after activation',
                ],
                min_level: 3,
              },
              {
                id: '21BA7280',
                name: 'Burst',
                icon: 'SKILL_0008',
                description:
                  'Continuously landing hits gradually increases attack and elemental attack. (Amount increased depends on weapon.)',
                category: 'EQUIP',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'On first hit, gain a small temporary attack and element boost, replaced by a larger boost after the fifth hit',
                  'Hit 5 successive times for a moderate stat boost',
                  'Hit 5 successive times for a bigger stat boost',
                  'Hit 5 successive times for an even bigger stat boost',
                  'Hit 5 successive times for a huge stat boost',
                ],
                min_level: 3,
              },
              {
                id: '6F378580',
                name: 'Agitator',
                icon: 'SKILL_0008',
                description:
                  'Increases attack power and affinity when large monsters become enraged.',
                category: 'EQUIP',
                max_level: 5,
                set_count: '',
                level_descriptions: [
                  'Attack +4 and affinity +3% while active',
                  'Attack +8 and affinity +5% while active',
                  'Attack +12 and affinity +7% while active',
                  'Attack +16 and affinity +10% while active',
                  'Attack +20 and affinity +15% while active',
                ],
                min_level: 3,
              },
            ],
          },
          id: 'eb19',
          displayName: 'Custom Slot #1',
          isOwner: false,
          configurationType: {
            name: 'Preset',
            description: 'Set from a loadout preset.',
          },
          canEdit: true,
          monsterPartFocus: [],
        },
      ],
      quest_bonus_rewards: [],
      star_rank: 'HIGH',
      area: 'Windward Plains',
      hr_requirement: 21,
      time_limit: 35,
      crossplay_enabled: true,
      createdAt: '2025-06-18T13:45:56.974Z',
    },
  ],
  getAll() {
    return this.data;
  },
  findById(id) {
    return this.data.find((hq) => hq.id === id);
  },
  addQuest(huntingQuest) {
    const newId = this.nextId + 1;
    this.data.push({ id: newId, ...huntingQuest, createdAt: new Date() });
    this.nextId++;
    return { success: true, id: newId };
  },
  findByIdAndRemove(id) {
    const huntingQuest = this.data.find((hq) => hq.id === id);
    if (huntingQuest) {
      this.data = this.data.filter((hq) => hq !== huntingQuest);
      return { success: true };
    } else
      return {
        success: false,
        errors: ['No such quest ID exists.', 'Failed to delete resource.'],
      };
  },
};

module.exports = HuntingQuest;
