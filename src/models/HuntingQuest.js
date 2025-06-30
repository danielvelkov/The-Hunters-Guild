import pool from '../../db/pool.js';

const HuntingQuestStorage = {
  async getAll() {
    const { rows } = await pool.query('SELECT id FROM hunting_quests;');
    const quests = await Promise.all(rows.map((row) => this.findById(row.id)));

    return quests;
  },

  /**
   * Add hunting quest and all related fields to hunting_quests and related tables
   * @param {HuntingQuest} huntingQuest
   * @returns
   */
  async addQuest(huntingQuest) {
    try {
      await pool.query('BEGIN');
      const insertQuestText = `
        INSERT INTO hunting_quests (title, description, category_id, type_id,
          star_rank, area, hr_requirement, time_limit, crossplay_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`;

      const questValues = [
        huntingQuest.title,
        huntingQuest.description,
        huntingQuest.category.id,
        huntingQuest.type.id,
        huntingQuest.star_rank,
        huntingQuest.area,
        huntingQuest.hr_requirement,
        huntingQuest.time_limit,
        huntingQuest.crossplay_enabled,
      ];
      const { rows } = await pool.query(insertQuestText, questValues);
      const questId = rows[0].id;

      // Add gaming platforms if crossplay disabled
      if (!huntingQuest.crossplay_enabled)
        for (const gp of huntingQuest.gaming_platforms)
          await pool.query(
            `INSERT INTO quest_crossplay_platforms (quest_id, gaming_platform_id)
       VALUES ($1, $2)`,
            [questId, gp.id]
          );

      // Add quest monsters
      for (const m of huntingQuest.quest_monsters) {
        await pool.query(
          `INSERT INTO quest_monsters (quest_id, monster_id, variant_id, crown_id, strength)
       VALUES ($1, $2, $3, $4, $5)`,
          [questId, m.monster.id, m.variant.id, m.crown.id, m.strength]
        );
      }

      // Add quest bonus rewards
      for (const r of huntingQuest.quest_bonus_rewards) {
        await pool.query(
          `INSERT INTO quest_bonus_rewards (quest_id, item_id, quantity)
       VALUES ($1, $2, $3)`,
          [questId, r.item.id, r.quantity]
        );
      }

      // Add player slots
      for (let [index, s] of huntingQuest.player_slots.entries()) {
        const { rows: loadoutRows } = await pool.query(
          `INSERT INTO loadouts (name, description) 
          VALUES ($1, $2)
          RETURNING id`,
          [s.loadout.name, s.loadout.description]
        );
        const loadoutId = loadoutRows[0].id;

        // Roles
        for (const r of s.loadout.roles)
          await pool.query(
            `INSERT INTO loadout_roles (loadout_id, role_id) 
          VALUES ($1, $2)`,
            [loadoutId, r.id]
          );

        // Weapon Types
        for (const wt of s.loadout.weapon_types)
          await pool.query(
            `INSERT INTO loadout_weapon_types (loadout_id, weapon_type_id) 
          VALUES ($1, $2)`,
            [loadoutId, wt.id]
          );

        // Weapon Attr
        for (const attr of s.loadout.weapon_attr)
          await pool.query(
            `INSERT INTO loadout_weapon_attributes (loadout_id, weapon_attribute_id) 
          VALUES ($1, $2)`,
            [loadoutId, attr.id]
          );

        // Skills
        for (const skill of s.loadout.skills)
          await pool.query(
            `INSERT INTO loadout_skills (loadout_id, skill_id, min_level) 
          VALUES ($1, $2, $3)`,
            [loadoutId, skill.id, skill.min_level]
          );

        // Convert to PostgreSQL composite type array string
        const formattedArray = `ARRAY[${s.focusedMonsterParts
          .map((mp) => `ROW(${mp.id}, '${mp.name}', '${mp.monster}')`)
          .join(', ')}]::monster_part_focus[]`;

        await pool.query(
          `INSERT INTO player_slots (quest_id, slot_index, 
          loadout_id, slot_config_type, display_name, is_owner, notes, can_edit,
        focused_monster_parts)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, ${formattedArray} ) `,
          [
            questId,
            index,
            loadoutId,
            s.configurationType.name,
            s.displayName,
            s.isOwner,
            s.notes,
            s.canEdit,
          ]
        );
      }
      await pool.query('COMMIT');
      return { success: true, id: questId };
    } catch (e) {
      await pool.query('ROLLBACK');
      return { success: false, errors: [e.message] };
    }
  },
  async findByIdAndUpdate(id, updatedHuntingQuest) {
    try {
      await pool.query('BEGIN');

      // First, check if the quest exists
      const existingQuest = await pool.query(
        'SELECT id FROM hunting_quests WHERE id = $1',
        [id]
      );

      if (existingQuest.rows.length === 0) {
        await pool.query('ROLLBACK');
        return {
          success: false,
          errors: ['No such quest ID exists.', 'Failed to update resource.'],
        };
      }

      // Update basic quest information
      const updateQuestText = `
        UPDATE hunting_quests 
        SET title = $1, description = $2, category_id = $3, type_id = $4,
            star_rank = $5, area = $6, hr_requirement = $7, time_limit = $8, 
            crossplay_enabled = $9
        WHERE id = $10`;

      const questValues = [
        updatedHuntingQuest.title,
        updatedHuntingQuest.description,
        updatedHuntingQuest.category.id,
        updatedHuntingQuest.type.id,
        updatedHuntingQuest.star_rank,
        updatedHuntingQuest.area,
        updatedHuntingQuest.hr_requirement,
        updatedHuntingQuest.time_limit,
        updatedHuntingQuest.crossplay_enabled,
        id,
      ];

      await pool.query(updateQuestText, questValues);

      // Delete existing related data
      await this.deleteQuestRelatedData(pool, id);

      // Re-add gaming platforms if crossplay disabled
      if (
        !updatedHuntingQuest.crossplay_enabled &&
        updatedHuntingQuest.gaming_platforms
      ) {
        for (const gp of updatedHuntingQuest.gaming_platforms) {
          await pool.query(
            `INSERT INTO quest_crossplay_platforms (quest_id, gaming_platform_id)
             VALUES ($1, $2)`,
            [id, gp.id]
          );
        }
      }

      // Re-add quest monsters
      if (updatedHuntingQuest.quest_monsters) {
        for (const m of updatedHuntingQuest.quest_monsters) {
          await pool.query(
            `INSERT INTO quest_monsters (quest_id, monster_id, variant_id, crown_id, strength)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, m.monster.id, m.variant.id, m.crown.id, m.strength]
          );
        }
      }

      // Re-add quest bonus rewards
      if (updatedHuntingQuest.quest_bonus_rewards) {
        for (const r of updatedHuntingQuest.quest_bonus_rewards) {
          await pool.query(
            `INSERT INTO quest_bonus_rewards (quest_id, item_id, quantity)
             VALUES ($1, $2, $3)`,
            [id, r.item.id, r.quantity]
          );
        }
      }

      // Re-add player slots
      if (updatedHuntingQuest.player_slots) {
        for (let [index, s] of updatedHuntingQuest.player_slots.entries()) {
          const { rows: loadoutRows } = await pool.query(
            `INSERT INTO loadouts (name, description) 
             VALUES ($1, $2)
             RETURNING id`,
            [s.loadout.name, s.loadout.description]
          );
          const loadoutId = loadoutRows[0].id;

          // Add loadout roles
          if (s.loadout.roles) {
            for (const r of s.loadout.roles) {
              await pool.query(
                `INSERT INTO loadout_roles (loadout_id, role_id) 
                 VALUES ($1, $2)`,
                [loadoutId, r.id]
              );
            }
          }

          // Add loadout weapon types
          if (s.loadout.weapon_types) {
            for (const wt of s.loadout.weapon_types) {
              await pool.query(
                `INSERT INTO loadout_weapon_types (loadout_id, weapon_type_id) 
                 VALUES ($1, $2)`,
                [loadoutId, wt.id]
              );
            }
          }

          // Add loadout weapon attributes
          if (s.loadout.weapon_attr) {
            for (const attr of s.loadout.weapon_attr) {
              await pool.query(
                `INSERT INTO loadout_weapon_attributes (loadout_id, weapon_attribute_id) 
                 VALUES ($1, $2)`,
                [loadoutId, attr.id]
              );
            }
          }

          // Add loadout skills
          if (s.loadout.skills) {
            for (const skill of s.loadout.skills) {
              await pool.query(
                `INSERT INTO loadout_skills (loadout_id, skill_id, min_level) 
                 VALUES ($1, $2, $3)`,
                [loadoutId, skill.id, skill.min_level]
              );
            }
          }

          // Format focused monster parts array
          const focusedParts = s.focusedMonsterParts || [];
          const formattedArray =
            focusedParts.length > 0
              ? `ARRAY[${focusedParts
                  .map((mp) => `ROW(${mp.id}, '${mp.name}', '${mp.monster}')`)
                  .join(', ')}]::monster_part_focus[]`
              : 'ARRAY[]::monster_part_focus[]';

          await pool.query(
            `INSERT INTO player_slots (quest_id, slot_index, 
             loadout_id, slot_config_type, display_name, is_owner, notes, can_edit,
             focused_monster_parts)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8, ${formattedArray})`,
            [
              id,
              index,
              loadoutId,
              s.configurationType.name,
              s.displayName,
              s.isOwner,
              s.notes || '',
              s.canEdit,
            ]
          );
        }
      }

      await pool.query('COMMIT');
      return { success: true };
    } catch (e) {
      await pool.query('ROLLBACK');
      return { success: false, errors: [e.message] };
    }
  },

  /**
   * Delete all related data for a quest (used during updates)
   * @param {pool} client - Database client
   * @param {number} questId - Quest ID
   */
  async deleteQuestRelatedData(client, questId) {
    // Get all loadout IDs associated with this quest before deleting player slots
    const { rows: loadoutIds } = await client.query(
      'SELECT loadout_id FROM player_slots WHERE quest_id = $1',
      [questId]
    );

    // Delete player slots first (references loadouts)
    await client.query('DELETE FROM player_slots WHERE quest_id = $1', [
      questId,
    ]);

    // Delete loadout-related data for each loadout
    for (const { loadout_id } of loadoutIds) {
      await client.query('DELETE FROM loadout_roles WHERE loadout_id = $1', [
        loadout_id,
      ]);
      await client.query(
        'DELETE FROM loadout_weapon_types WHERE loadout_id = $1',
        [loadout_id]
      );
      await client.query(
        'DELETE FROM loadout_weapon_attributes WHERE loadout_id = $1',
        [loadout_id]
      );
      await client.query('DELETE FROM loadout_skills WHERE loadout_id = $1', [
        loadout_id,
      ]);
      await client.query('DELETE FROM loadouts WHERE id = $1', [loadout_id]);
    }

    // Delete other quest-related data
    await client.query(
      'DELETE FROM quest_crossplay_platforms WHERE quest_id = $1',
      [questId]
    );
    await client.query('DELETE FROM quest_monsters WHERE quest_id = $1', [
      questId,
    ]);
    await client.query('DELETE FROM quest_bonus_rewards WHERE quest_id = $1', [
      questId,
    ]);
  },

  async findByIdAndRemove(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM hunting_quests WHERE id = $1;',
      [id]
    );
    if (rowCount) return { success: true };
    else
      return {
        success: false,
        errors: ['Failed to delete resource', 'No such quest ID exists.'],
      };
  },

  async findById(questId) {
    if (!questId) return null;
    const [
      questResult,
      monstersResult,
      platformsResult,
      rewardsResult,
      playerSlotsResult,
    ] = await Promise.all([
      this.getQuestBasicInfo(pool, questId),
      this.getQuestMonsters(pool, questId),
      this.getQuestPlatforms(pool, questId),
      this.getQuestRewards(pool, questId),
      this.getPlayerSlots(pool, questId),
    ]);

    if (questResult.rows.length === 0) {
      return null;
    }

    const quest = questResult.rows[0];
    const playerSlots = playerSlotsResult.rows;

    // Get loadout details for each player slot
    const playerSlotsWithLoadouts = await Promise.all(
      playerSlots.map((slot) => this.enrichSlot(pool, slot))
    );

    // Construct the final hunting quest object
    return {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      category: {
        id: quest.category_id,
        name: quest.category_name,
      },
      type: {
        id: quest.type_id,
        name: quest.type_name,
      },
      gaming_platforms: platformsResult.rows,
      quest_monsters: monstersResult.rows.map((m) => ({
        monster: {
          id: m.monster_id,
        },
        variant: {
          id: m.variant_id,
          name: m.variant_name,
        },
        crown: {
          id: m.crown_id,
          name: m.crown_name,
        },
        strength: m.strength,
      })),
      player_slots: playerSlotsWithLoadouts,
      quest_bonus_rewards: rewardsResult.rows.map((r) => ({
        item: { id: r.item_id },
        quantity: r.quantity,
      })),
      star_rank: quest.star_rank,
      area: quest.area,
      hr_requirement: quest.hr_requirement,
      time_limit: quest.time_limit,
      crossplay_enabled: quest.crossplay_enabled,
      created_at: quest.created_at,
    };
  },

  async getQuestBasicInfo(client, questId) {
    const query = `
      SELECT hq.*, qc.name as category_name, qt.name as type_name
      FROM hunting_quests hq
      JOIN quest_categories qc ON hq.category_id = qc.id
      JOIN quest_types qt ON hq.type_id = qt.id
      WHERE hq.id = $1
    `;
    return client.query(query, [questId]);
  },

  async getQuestMonsters(client, questId) {
    const query = `
      SELECT qm.monster_id, qm.variant_id, qm.crown_id, qm.strength,
             mv.name as variant_name, mc.name as crown_name
      FROM quest_monsters qm
      JOIN monster_variants mv ON qm.variant_id = mv.id
      JOIN monster_crowns mc ON qm.crown_id = mc.id
      WHERE qm.quest_id = $1
    `;
    return client.query(query, [questId]);
  },

  async getQuestPlatforms(client, questId) {
    const query = `
      SELECT gp.id, gp.name
      FROM quest_crossplay_platforms qcp
      JOIN gaming_platforms gp ON qcp.gaming_platform_id = gp.id
      WHERE qcp.quest_id = $1
    `;
    return client.query(query, [questId]);
  },

  async getQuestRewards(client, questId) {
    const query = `
      SELECT item_id, quantity
      FROM quest_bonus_rewards
      WHERE quest_id = $1
    `;
    return client.query(query, [questId]);
  },

  async getPlayerSlots(client, questId) {
    const query = `
      SELECT ps.id, ps.slot_index, ps.loadout_id, ps.slot_config_type,
             ps.display_name, ps.is_owner, ps.notes, ps.can_edit,
             array_to_json(ps.focused_monster_parts)::text as focused_monster_parts, l.name as loadout_name, l.description as loadout_description
      FROM player_slots ps
      JOIN loadouts l ON ps.loadout_id = l.id
      WHERE ps.quest_id = $1
      ORDER BY ps.slot_index
    `;
    return client.query(query, [questId]);
  },

  async enrichSlot(client, slot) {
    const [rolesResult, weaponTypesResult, weaponAttrsResult, skillsResult] =
      await Promise.all([
        this.getLoadoutRoles(client, slot.loadout_id),
        this.getLoadoutWeaponTypes(client, slot.loadout_id),
        this.getLoadoutWeaponAttributes(client, slot.loadout_id),
        this.getLoadoutSkills(client, slot.loadout_id),
      ]);

    return {
      notes: slot.notes || '',
      loadout: {
        name: slot.loadout_name,
        description: slot.loadout_description,
        roles: rolesResult.rows,
        weapon_types: weaponTypesResult.rows,
        weapon_attr: weaponAttrsResult.rows,
        skills: skillsResult.rows,
      },
      id: slot.id.toString(),
      displayName: slot.display_name,
      isOwner: slot.is_owner,
      configurationType: {
        name: slot.slot_config_type,
      },
      canEdit: slot.can_edit,
      focusedMonsterParts: JSON.parse(slot.focused_monster_parts) || [],
    };
  },

  async getLoadoutRoles(client, loadoutId) {
    const query = `
      SELECT r.id, r.name, r.summary
      FROM loadout_roles lr
      JOIN roles r ON lr.role_id = r.id
      WHERE lr.loadout_id = $1
    `;
    return client.query(query, [loadoutId]);
  },

  async getLoadoutWeaponTypes(client, loadoutId) {
    const query = `
      SELECT lwt.weapon_type_id as id, wt.name
      FROM loadout_weapon_types lwt
      JOIN weapon_types wt ON lwt.weapon_type_id = wt.index
      WHERE lwt.loadout_id = $1
    `;
    return client.query(query, [loadoutId]);
  },

  async getLoadoutWeaponAttributes(client, loadoutId) {
    const query = `
      SELECT lwa.weapon_attribute_id as id, INITCAP(wa.id) as name, si.id AS icon
      FROM loadout_weapon_attributes lwa
      JOIN weapon_attributes wa ON lwa.weapon_attribute_id = wa.index
      JOIN status_icons si ON si.name ILIKE wa.id
      WHERE lwa.loadout_id = $1
    `;
    return client.query(query, [loadoutId]);
  },

  async getLoadoutSkills(client, loadoutId) {
    const query = `
      SELECT s.id, s.name, s.icon, s.description, s.category, 
             s.max_level, s.set_count, ls.min_level,
              Array[description_1, description_2, description_3, description_4, description_5, description_6, description_7] as level_descriptions
      FROM loadout_skills ls
      JOIN skills s ON ls.skill_id = s.id
      WHERE ls.loadout_id = $1
    `;
    return client.query(query, [loadoutId]);
  },
};

export default HuntingQuestStorage;
