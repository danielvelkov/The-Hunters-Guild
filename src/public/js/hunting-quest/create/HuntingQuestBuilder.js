import createPageMediator from 'js/common/mediator';
import HuntingQuestFormModel from './HuntingQuestFormModel';
import { QUEST_PREVIEW_CHANGE } from 'js/common/events';

/**
 * Builds a hunting quest and remembers different sections 
 */
export default class HuntingQuestBuilder {
  constructor() {
    this.questMonsters = [];
    this.questDetails = {};
    this.playerSlots = [];
    this.bonusRewards = [];
  }

  setQuestMonsters(monsters) {
    this.questMonsters = [...monsters];
    this.triggerPreviewUpdate();
  }

  setQuestDetails(details) {
    this.questDetails = { ...details };
    this.triggerPreviewUpdate();
  }

  setPlayerSlots(slots) {
    this.playerSlots = [...slots];
    this.triggerPreviewUpdate();
  }

  setBonusRewards(rewards) {
    this.bonusRewards = [...rewards];
    this.triggerPreviewUpdate();
  }

  buildHuntingQuest() {
    if (!this.isReadyToBuild()) {
      return null;
    }

    const questDetailsFormData = new FormData();
    Object.entries(this.questDetails).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => questDetailsFormData.append(`${key}[]`, v));
      } else {
        questDetailsFormData.set(key, value);
      }
    });

    return HuntingQuestFormModel.fromFormData(
      questDetailsFormData,
      this.questMonsters,
      this.playerSlots,
      this.bonusRewards
    );
  }

  isReadyToBuild() {
    return (
      this.questMonsters.length > 0 || Object.keys(this.questDetails).length > 0
    );
  }

  triggerPreviewUpdate() {
    const quest = this.buildHuntingQuest();
    if (quest) createPageMediator.trigger(QUEST_PREVIEW_CHANGE, quest);
  }
}
