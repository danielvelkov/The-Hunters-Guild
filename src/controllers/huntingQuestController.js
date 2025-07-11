import expressAsyncHandler from 'express-async-handler';
import CustomNotFoundError from '../errors/CustomNotFoundError.js';
import GameData from '../models/GameData.js';
import HuntingQuest from '../models/HuntingQuest.js';
import { body, validationResult } from 'express-validator';
import MonsterVariant from '../entities/game-data/MonsterVariant.js';
import { findClassEnumStaticPropInstance } from '../public/js/common/util.js';
import MonsterCrown from '../entities/game-data/MonsterCrown.js';
import GamingPlatforms from '../entities/game-data/GamingPlatforms.js';
import QuestCategory from '../entities/game-data/QuestCategory.js';
import QuestType from '../entities/game-data/QuestType.js';
import SlotConfigType from '../entities/SlotConfigType.js';
import { LoadoutRole } from '../entities/Loadout.js';
import WeaponType from '../entities/game-data/WeaponType.js';
import WeaponAttribute from '../entities/game-data/WeaponAttribute.js';
import CustomUnauthorizedError from '../errors/CustomUnauthorizedError.js';

// FYI: SCHEMA Alternative
// const huntingQuestSchema = {
//   description: {
//     isLength: {
//       errorMessage: 'Must be at least 8 chars.',
//       options: {
//         min: 8,
//       },
//     },
//   },
// };
const emptyError = 'Must not be empty.';
const maxLengthError = (max) =>
  `Maximum limit is [${max}] characters. Please shorten your text.`;
const maxLengthAfterEscapeError = (max) =>
  `Final stored value exceeds length limit [${max}] after escaping. Remove special characters like [@$<>;] or shorten your text.`;
const numberBetweenError = (min, max) =>
  `Please enter a number between ${min} and ${max}.`;

const huntingQuestValidationChain = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(emptyError)
    .isLength({ max: 100 })
    .withMessage(maxLengthError(100))
    .escape()
    .custom((value) => value.length < 100)
    .withMessage(maxLengthAfterEscapeError(100)),

  body('description')
    .trim()
    .isLength({ max: 200 })
    .withMessage(maxLengthError(200))
    .escape()
    .custom((value) => value.length < 200)
    .withMessage(maxLengthAfterEscapeError(200)),
  body('category').custom((value) => {
    const isValid = findClassEnumStaticPropInstance(QuestCategory, value?.id);
    if (!isValid) throw new Error('Invalid monster category selected.');
    return true;
  }),
  body('type').custom((value) => {
    const isValid = findClassEnumStaticPropInstance(QuestType, value?.id);
    if (!isValid) throw new Error('Invalid quest type selected.');
    return true;
  }),

  body('time_limit')
    .isInt({ min: 15, max: 60 })
    .withMessage(numberBetweenError(15, 60))
    .isDivisibleBy(5)
    .withMessage('Must be divisible by 5.'),

  body('hr_requirement')
    .isInt({ min: 1, max: 191 })
    .withMessage(numberBetweenError(1, 191)),

  body('crossplay_enabled').isBoolean(),
  body('gaming_platforms')
    .isArray({ max: 3 })
    .custom((value, { req }) => {
      if (
        !req.body.crossplay_enabled &&
        (!Array.isArray(value) || value.length === 0)
      )
        throw new Error(
          'If crossplay field is disabled, at least 1 gaming platform must be selected'
        );
      if (Array.isArray(value) && value.length > 0)
        value.forEach((gp) => {
          const gamingPlatform = findClassEnumStaticPropInstance(
            GamingPlatforms,
            gp.id
          );
          if (!gamingPlatform)
            throw new Error(
              'No such gaming platform. Please select Xbox, PlayStation or PC'
            );
        });
      return true;
    }),

  body('quest_monsters')
    .isArray({ min: 1, max: 2 })
    .withMessage('Please select 1 or 2 monsters to hunt.'),
  body('quest_monsters.*.monster.id')
    .exists()
    .withMessage('ID required.')
    .isString()
    .withMessage('ID must be a string')
    .custom(async (id) => {
      const monsters = await GameData.monsters__weakness_and_icons_ListGet();
      const monster = monsters.find((m) => m.id == id);
      if (monster) return true;
      throw new Error('No such monster exists.');
    }),

  body('quest_monsters.*.variant').custom((value) => {
    const isValid = findClassEnumStaticPropInstance(MonsterVariant, value?.id);
    if (!isValid) throw new Error('Invalid monster variant selected.');
    return true;
  }),
  body('quest_monsters.*.crown').custom((value) => {
    const isValid = findClassEnumStaticPropInstance(MonsterCrown, value?.id);
    if (!isValid) throw new Error('Invalid monster crown selected.');
    return true;
  }),

  body('quest_monsters.*.strength')
    .exists()
    .isInt({ min: 1, max: 5 })
    .withMessage('Strength level must be a number between 1 - 5 (including).'),

  body('player_slots')
    .isArray({ min: 2, max: 4 })
    .withMessage('Between 2 or 4 players are required.'),

  body('player_slots.*.displayName')
    .notEmpty()
    .withMessage(emptyError)
    .trim()
    .isLength({ max: 50 })
    .withMessage(maxLengthError(50))
    .escape()
    .custom((value) => value.length < 50)
    .withMessage(maxLengthAfterEscapeError(50)),
  body('player_slots.*.isOwner').isBoolean(),
  body('player_slots.*.canEdit').isBoolean(),
  body('player_slots.*.configurationType').custom((value) => {
    const isValid = findClassEnumStaticPropInstance(
      SlotConfigType,
      value?.name
    );
    if (!isValid) throw new Error('Invalid slot configuration selected.');
    return true;
  }),
  body('player_slots.*.focusedMonsterParts.*.name')
    .notEmpty()
    .withMessage(emptyError),
  body('player_slots.*.focusedMonsterParts.*.monster')
    .notEmpty()
    .withMessage(emptyError),
  body('player_slots.*.notes')
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage(maxLengthError(100))
    .escape()
    .custom((value) => value.length < 100)
    .withMessage(maxLengthAfterEscapeError(100)),
  body('player_slots.*.loadout.name')
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage(maxLengthError(50))
    .escape()
    .custom((value) => value.length < 50)
    .withMessage(maxLengthAfterEscapeError(50)),
  body('player_slots.*.loadout.description')
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage(maxLengthError(100))
    .escape()
    .custom((value) => value.length < 100)
    .withMessage(maxLengthAfterEscapeError(100)),
  body('player_slots.*.loadout.roles').exists().isArray(),
  body('player_slots.*.loadout.roles.*.id').custom((id) => {
    const isValid = findClassEnumStaticPropInstance(LoadoutRole, id);
    if (!isValid) throw new Error('Invalid loadout role selected.');
    return true;
  }),

  body('player_slots.*.loadout.weapon_types').exists().isArray(),
  body('player_slots.*.loadout.weapon_types.*.id').custom((id) => {
    const isValid = findClassEnumStaticPropInstance(WeaponType, id);
    if (!isValid) throw new Error('Invalid weapon type selected.');
    return true;
  }),

  body('player_slots.*.loadout.weapon_attr').exists().isArray(),
  body('player_slots.*.loadout.weapon_attr.*.id').custom((id) => {
    const isValid = findClassEnumStaticPropInstance(WeaponAttribute, id);
    if (!isValid) throw new Error('Invalid weapon attribute selected.');
    return true;
  }),

  body('player_slots.*.loadout.skills.*.id').custom(async (id) => {
    const skills = await GameData.skills_ListGet();
    const skill = skills.find((m) => m.id == id);
    if (skill) return true;
    throw new Error('No such skill exists.');
  }),

  body('quest_bonus_rewards')
    .isArray({ max: 30 })
    .withMessage('A maximum of 30 reward types are allowed.'),
  body('quest_bonus_rewards.*.quantity')
    .isInt({ min: 1, max: 20 })
    .withMessage(numberBetweenError(1, 20)),
  body('quest_bonus_rewards.*.item.id')
    .exists()
    .withMessage('ID required.')
    .isString()
    .withMessage('ID must be a string'),

  body('passkey').optional(),
];

const index_GET = async (req, res) => {
  const huntingQuests = await HuntingQuest.getAll();
  const weaponTypes = await GameData.weapon_types_ListGet();
  const weaponAttributes = await GameData.weapon_attributes_ListGet();
  const monsters = await GameData.monsters__weakness_and_icons_ListGet();
  const monstersDrops = await GameData.monsters_drops__ListGet();
  const bonusQuestRewards = await GameData.bonus_quest_rewards__ListGet();
  const skills = await GameData.skills_ListGet();
  huntingQuests.forEach((hq) => {
    hq.quest_monsters = hq.quest_monsters.map((qm) => ({
      ...qm,
      monster: monsters.find((m) => m.id === qm.monster.id),
    }));
    hq.quest_bonus_rewards = hq.quest_bonus_rewards.map((qbr) => ({
      item: bonusQuestRewards.find((r) => r.id === qbr.item.id),
      quantity: qbr.quantity,
    }));
    hq.player_slots = hq.player_slots.map((s) => {
      s.loadout.skills = s.loadout.skills.map((skill) => {
        skill = {
          ...skills.find((sk) => sk.id == skill.id),
          min_level: skill.min_level,
        };
        return skill;
      });
      return s;
    });
  });
  res.render('pages/hunting-quest/index', {
    title: 'Hunting Quests',
    huntingQuests,
    monstersDrops,
    monsters,
    weaponAttributes,
    weaponTypes,
  });
};

const show_GET = expressAsyncHandler(async (req, res) => {
  const { questId } = req.params;
  const huntingQuest = await HuntingQuest.findById(Number(questId));

  if (!huntingQuest)
    throw new CustomNotFoundError('No hunting quest found with ID: ' + questId);

  const monsters = await GameData.monsters__weakness_and_icons_ListGet();
  const monstersDrops = await GameData.monsters_drops__ListGet();
  const bonusQuestRewards = await GameData.bonus_quest_rewards__ListGet();
  const skills = await GameData.skills_ListGet();

  huntingQuest.quest_monsters = huntingQuest.quest_monsters.map((qm) => ({
    ...qm,
    monster: monsters.find((m) => m.id === qm.monster.id),
  }));
  huntingQuest.quest_bonus_rewards = huntingQuest.quest_bonus_rewards.map(
    (qbr) => ({
      item: bonusQuestRewards.find((r) => r.id === qbr.item.id),
      quantity: qbr.quantity,
    })
  );
  huntingQuest.player_slots = huntingQuest.player_slots.map((s) => {
    s.loadout.skills = s.loadout.skills.map((skill) => {
      skill = {
        ...skills.find((sk) => sk.id == skill.id),
        min_level: skill.min_level,
      };
      return skill;
    });
    return s;
  });
  res.render('pages/hunting-quest/show', {
    title: huntingQuest.title,
    huntingQuest,
    monstersDrops,
    monsters,
  });
});

const create_GET = async (req, res) => {
  const monsters = await GameData.monsters__weakness_and_icons_ListGet();
  const bonusQuestRewards = await GameData.bonus_quest_rewards__ListGet();
  const monstersDrops = await GameData.monsters_drops__ListGet();
  const skills = await GameData.skills_ListGet();
  const weaponTypes = await GameData.weapon_types_ListGet();
  const weaponAttributes = await GameData.weapon_attributes_ListGet();
  const systemLoadouts = await GameData.system_loadouts_ListGet();

  ////////////////////////
  // FOR CREATING MOCKS //
  ////////////////////////
  // const path = require('path');
  // const fs = require('fs');
  // const mocksData = {
  //   monsters,
  //   bonusQuestRewards,
  //   monstersDrops,
  //   skills,
  //   weaponTypes,
  //   weaponAttributes,
  //   systemLoadouts,
  // };

  // for (const key in mocksData) {
  //   console.log(key);
  //   fs.writeFile(
  //     path.resolve(
  //       process.cwd(),
  //       'src',
  //       'models',
  //       '__mocks__',
  //       'jsondata',
  //       `${key}.json`
  //     ),
  //     JSON.stringify(mocksData[key].splice(0, 5)),
  //     (err) => {
  //       if (err) {
  //         console.error(err);
  //       } else {
  //         // file written successfully
  //       }
  //     }
  //   );
  // }
  ////////////////////////

  res.render('pages/hunting-quest/create', {
    title: 'Create Hunting Quest Post',
    monsters,
    bonusQuestRewards,
    monstersDrops,
    skills,
    weaponTypes,
    weaponAttributes,
    systemLoadouts,
  });
};

const create_POST = [
  huntingQuestValidationChain,
  // checkSchema(huntingQuestSchema, ['body']),
  expressAsyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(), // Convert validation result to array
      });
    }

    const {
      success,
      id,
      errors: dbErrors,
    } = await HuntingQuest.addQuest(req.body);
    // if (successful) {
    //   res.status(201).json({
    //     success: true,
    //     id,
    //     message: 'Hunting Quest created successfully',
    //   });
    // }
    if (success) res.status(201).redirect(`${id}`);
    else {
      return res.status(400).json({
        success,
        errors: [
          {
            msg: 'Failed to create Hunting Quest Post. Something is wrong with the server',
          },
          ...dbErrors.map((e) => ({
            msg: e,
          })),
        ],
      });
    }
  }),
];

const edit_GET = expressAsyncHandler(async (req, res) => {
  const { questId } = req.params;
  const existingHuntingQuest = await HuntingQuest.findById(Number(questId));
  if (!existingHuntingQuest)
    throw new CustomNotFoundError('No hunting quest found with ID: ' + questId);
  const monsters = await GameData.monsters__weakness_and_icons_ListGet();
  const bonusQuestRewards = await GameData.bonus_quest_rewards__ListGet();
  const monstersDrops = await GameData.monsters_drops__ListGet();
  const skills = await GameData.skills_ListGet();
  const weaponTypes = await GameData.weapon_types_ListGet();
  const weaponAttributes = await GameData.weapon_attributes_ListGet();
  const systemLoadouts = await GameData.system_loadouts_ListGet();
  existingHuntingQuest.player_slots = existingHuntingQuest.player_slots.map(
    (s) => {
      s.loadout.skills = s.loadout.skills.map((skill) => {
        skill = {
          ...skills.find((sk) => sk.id == skill.id),
          min_level: skill.min_level,
        };
        return skill;
      });
      return s;
    }
  );

  res.render('pages/hunting-quest/create', {
    title: 'Edit Hunting Quest Post',
    monsters,
    bonusQuestRewards,
    monstersDrops,
    skills,
    weaponTypes,
    weaponAttributes,
    systemLoadouts,
    existingHuntingQuest,
  });
});

const edit_PUT = [
  huntingQuestValidationChain,
  expressAsyncHandler(async (req, res) => {
    const { questId } = req.params;
    const { passkey } = req.body;
    if (process.env.SUPER_DUPER_ULTRA_SECRET_PASSWORD !== passkey)
      throw new CustomUnauthorizedError('Invalid pass provided.');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(), // Convert validation result to array
      });
    }

    const { success } = await HuntingQuest.findByIdAndUpdate(questId, req.body);
    if (success) res.status(201).redirect(`/${questId}`);
    else {
      return res.status(400).json({
        success,
        errors: [
          {
            msg: 'Failed to edit Hunting Quest Post. Something is wrong with the server',
          },
        ],
      });
    }
  }),
];

const remove_DELETE = expressAsyncHandler(async (req, res) => {
  const { questId } = req.params;
  const { passkey } = req.body;
  if (process.env.SUPER_DUPER_ULTRA_SECRET_PASSWORD !== passkey)
    throw new CustomUnauthorizedError('Invalid pass provided.');
  const { success, errors } = await HuntingQuest.findByIdAndRemove(
    Number(questId)
  );
  if (success) res.status(200).redirect('/');
  else throw new CustomNotFoundError(errors.join(' '));
});

export default {
  index_GET,
  show_GET,
  create_GET,
  create_POST,
  remove_DELETE,
  edit_GET,
  edit_PUT,
};
