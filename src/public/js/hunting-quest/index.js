import 'css/pages/hunting-quest/index.css';
import HuntingQuestComponent from './components/HuntingQuestComponent';

const {
  huntingQuests,
  monstersDropsList,
  weaponTypesList,
  weaponAttributesList,
} = globalThis.serverData;

const huntingQuestComponents = huntingQuests.map(
  (hq) => new HuntingQuestComponent(hq, monstersDropsList)
);

$('ul.hunting-quests').append(
  huntingQuestComponents.map((hqc) =>
    $('<li>').addClass('hunting-quest-post').append(hqc.render())
  )
);
