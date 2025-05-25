import { monstersForms, selectedMonsters, monstersList } from '../create.js';
import 'css/components/monster-form.css';

export function createMonsterDataForm() {
  const formId = monstersForms.length;

  // Clone the template
  const monsterFormTemplate = document.getElementById('monster-form-template');
  const monsterDetailsTemplate = document.getElementById(
    'monster-details-template'
  );
  const monsterForm = $(monsterFormTemplate.content.cloneNode(true)).find(
    'form'
  );
  const monsterDetails = $(monsterDetailsTemplate.content.cloneNode(true)).find(
    'fieldset'
  );

  // Set unique IDs
  monsterForm.attr('id', `monster-form-${formId}`);
  monsterForm.find('.monster-select').attr('id', `monster-select-${formId}`);

  // Initialize Select2
  const monsterSelect = monsterForm.find('.monster-select');

  initializeMonsterSelect(monsterSelect, monsterDetails, formId);

  // Event handling for form changes
  monsterForm.on('change', () => $('#quest-preview').trigger('preview:update'));

  monstersForms.push(monsterForm);
  return monsterForm;
}

function initializeMonsterSelect(
  monsterSelect,
  monsterDetailsTemplate,
  formId
) {
  monsterSelect.select2({
    placeholder: '-- Choose a monster --',
    allowClear: true,
    templateResult: formatMonsterOption,
  });

  // Clear handler
  monsterSelect.on('select2:clear', () => {
    monsterSelect.closest('form').find('.monster-details').detach();
    delete selectedMonsters[formId];
    if (!selectedMonsters.some((m) => m)) {
      $('#quest-post-form').hide();
    }
  });

  // Select handler
  monsterSelect.on('select2:select', function (e) {
    const data = e.params.data;
    if (!data.id) {
      $('#quest-post-form').hide();
      return;
    }

    const monster = monstersList.find((m) => m.id === data.id);
    const monsterForm = $(this).closest('form');

    monsterForm.find('.monster-details').remove();

    const monsterDetails = monsterDetailsTemplate.clone().appendTo(monsterForm);

    // Update selected monsters
    selectedMonsters[formId] = monster;

    // Configure monster variant options
    configureMonsterVariants(monsterDetails, monster);

    // Show quest form
    $('#quest-post-form').show();
  });
}

function formatMonsterOption(item) {
  if (item.element?.dataset.monsterIcon) {
    return $(`<span class='monster-select-content'>
      <span class='monster-select-name'>
        <img height='18' src="icons/Large Monster Icons/${
          item.element?.dataset.monsterIcon
        }.png"/>
        <b>${item.text}</b>
      </span>
      <div class='monster-elements'>
        Elem. Weak: ${formatWeaknessIcons(item.element?.dataset.elements)}
      </div>
      <div class='monster-ailments'>
        Status Weak: ${formatWeaknessIcons(item.element?.dataset.ailments)}
      </div>
    </span>`);
  }
}

function formatWeaknessIcons(dataString) {
  if (!dataString) return '';

  return dataString
    .split('|')
    .map((e) => {
      const [name, icon] = e.split(',');
      if (icon) {
        return `<img height='18' alt='${name}' title='${name}' src="icons/Status Icons/${icon}.png" />`;
      }
      return '';
    })
    .join('');
}

function configureMonsterVariants(monsterDetails, monster) {
  // Configure Tempered
  if (monster.tempered) {
    monsterDetails.find('.monster-tempered-label').show();
    monsterDetails.find('.monster-tempered').prop('disabled', false);
  } else {
    monsterDetails.find('.monster-tempered-label').hide();
    monsterDetails.find('.monster-tempered').prop('disabled', true);
  }

  // Configure Frenzied
  if (monster.frenzied) {
    monsterDetails.find('.monster-frenzied-label').show();
    monsterDetails.find('.monster-frenzied').prop('disabled', false);
  } else {
    monsterDetails.find('.monster-frenzied-label').hide();
    monsterDetails.find('.monster-frenzied').prop('disabled', true);
  }

  // Configure Arch-Tempered
  if (monster.arch_tempered) {
    monsterDetails.find('.monster-arch-tempered-label').show();
    monsterDetails.find('.monster-arch-tempered').prop('disabled', false);
  } else {
    monsterDetails.find('.monster-arch-tempered-label').hide();
    monsterDetails.find('.monster-arch-tempered').prop('disabled', true);
  }

  // Reset checkboxes
  monsterDetails.find('input[type="checkbox"]').prop('checked', false);

  // Make checkboxes mutually exclusive
  monsterDetails.find('input[type="checkbox"]').click(function () {
    if ($(this).is(':checked')) {
      monsterDetails
        .find('input[type="checkbox"]')
        .not(this)
        .prop('disabled', true);
      monsterDetails
        .find('input[type="checkbox"]')
        .not(this)
        .prop('checked', false);
    } else {
      monsterDetails.find('input[type="checkbox"]').prop('disabled', false);
    }
  });
}
