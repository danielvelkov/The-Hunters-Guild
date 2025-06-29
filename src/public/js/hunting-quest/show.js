import 'css/pages/hunting-quest/show.css';
import HuntingQuestComponent from './components/HuntingQuestComponent.js';

const { huntingQuest, monstersDropsList } = globalThis.serverData;

const huntingQuestComponent = new HuntingQuestComponent(
  huntingQuest,
  monstersDropsList
);

$('article').append(huntingQuestComponent.render());

$('form').on('submit', (e) => {
  var result = confirm('Are you sure you want to delete?');
  if (!result) {
    e.preventDefault();
  }
  let pass = prompt("What's the super duper secret password?");
  $('form').append($('<input>').attr('name', 'passkey').val(pass).hide());
});
