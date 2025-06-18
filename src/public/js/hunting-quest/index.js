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
  huntingQuestComponents.map((hqc) => {
    const link = $('<a>').prop('href', `/${hqc.quest.id}`);
    const item = $('<li>')
      .css('position', 'relative')
      .addClass('hunting-quest-post')
      .addClass('collapsed')
      .append(hqc.render());
    const expandButton = $('<button>')
      .html('&#8690;')
      .prop('title', 'expand')
      .css('position', 'absolute')
      .css('font-size', '1.2em')
      .css('right', 0)
      .css('top', 0)
      .on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        item.toggleClass('collapsed');
      });

    item.append(expandButton);
    link.append(item);

    return link;
  })
);
