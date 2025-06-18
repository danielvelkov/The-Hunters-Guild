import 'css/pages/hunting-quest/show.css';
import HuntingQuestComponent from './components/HuntingQuestComponent';

const { huntingQuest, monstersDropsList } = globalThis.serverData;

const huntingQuestComponent = new HuntingQuestComponent(
  huntingQuest,
  monstersDropsList
);

$('article').append(huntingQuestComponent.render());
