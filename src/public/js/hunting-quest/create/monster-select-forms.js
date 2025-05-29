import { monstersList, createPageMediator } from '../create.js';
import 'css/components/monster-select-forms.css';

const MonsterSelectForms = (() => {
  let _monsterFormCounter = 0;
  let _monsterSelectForms = new Set();

  // Cache DOM
  const container = $('#monster-forms');
  const $addButton = $('#add-monster-button');

  const monsterFormTemplate = document.getElementById('monster-form-template');
  const monsterDetailsTemplate = document.getElementById(
    'monster-details-template'
  );

  // Bind Events
  $addButton.on('click', () => {
    const newForm = createForm();
    add(newForm);
  });
  container.on('change', () => {
    createPageMediator.trigger('monsterSelectFormsChange', _monsterSelectForms);
  });

  function getMonsterSelectForms() {
    return _monsterSelectForms;
  }

  function add(form) {
    if (_monsterSelectForms.size >= 2) return;
    _monsterSelectForms.add(form);
    container.append(form);
  }

  function remove(form) {
    if (_monsterSelectForms.has(form)) {
      _monsterSelectForms.delete(form);
      form.remove();
    }
  }

  function createForm(monsterId) {
    const formId = _monsterFormCounter++;

    const monsterForm = $(monsterFormTemplate.content.cloneNode(true))
      .find('form')
      .clone();
    const monsterDetails = $(monsterDetailsTemplate.content.cloneNode(true))
      .find('fieldset')
      .clone();

    // Set unique IDs
    monsterForm.attr('id', `monster-form-${formId}`);


    const monsterSelect = monsterForm.find('.monster-select');

    initializeMonsterSelect(monsterSelect, monsterDetails, monsterForm);

    // Select Monster by Default
    requestAnimationFrame(() => {
      monsterSelect
        .val(monsterId || monstersList[0]?.id)
        .trigger('change')
        .trigger({
          type: 'select2:select',
          params: {
            data: {
              id: monsterId || monstersList[0]?.id,
            },
          },
        });
    });

    return monsterForm;
  }

  function initializeMonsterSelect(
    monsterSelect,
    monsterDetailsTemplate,
    form
  ) {
    monsterSelect.select2({
      placeholder: '-- Choose a monster --',
      allowClear: true,
      templateResult: formatMonsterOption,
    });

    // Clear handler
    monsterSelect.on('select2:clear', (e) => {
      // use RAF cuz dropdown is present
      requestAnimationFrame(() => {
        monsterSelect.select2('close');
        remove(form);
      });
    });

    // Select handler
    monsterSelect.on('select2:select', function (e) {
      const data = e.params?.data;
      if (!data?.id) return;

      const monster = monstersList.find((m) => m.id === data.id);

      form.find('.monster-details').remove();

      const monsterDetails = monsterDetailsTemplate.clone().appendTo(form);

      // Configure monster variant options
      configureMonsterVariants(monsterDetails, monster);
    });
  }

  return {
    getMonsterSelectForms,
  };
})();

export default MonsterSelectForms;

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
  const monsterVariants = ['tempered', 'frenzied', 'arch_tempered'];

  const variants = monsterVariants.map((key) => ({
    key,
    label: `.monster-${key.replace('_', '-')}-label`,
    input: `.monster-${key.replace('_', '-')}`,
  }));

  variants.forEach(({ key, label, input }) => {
    monsterDetails.find(label).toggle(monster[key]);
    monsterDetails.find(label).attr('aria-hidden', !monster[key]);
    monsterDetails.find(input).prop('disabled', !monster[key]);
  });

  // Reset checkboxes
  const checkboxes = monsterDetails
    .find('input[type="checkbox"]')
    .prop('checked', false);

  // Make checkboxes mutually exclusive
  checkboxes.click(function () {
    checkboxes.not(this).prop({ disabled: this.checked, checked: false });
  });
}
