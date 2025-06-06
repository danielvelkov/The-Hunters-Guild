import { monstersList } from '../create.js';
import {
  MONSTER_SELECT_FORMS_CHANGE,
  CROWN_SELECT_VISIBILITY_CHANGE,
} from 'js/common/events.js';
import 'css/components/monster-select-forms.css';
import createPageMediator from 'js/common/mediator';

const MonsterSelectForms = (() => {
  let _monsterFormCounter = 0;
  let _monsterSelectForms = new Set();
  let _crownSelectVisibility = true;

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
    addForm(newForm);
  });
  container.on('change', () => {
    createPageMediator.trigger(
      MONSTER_SELECT_FORMS_CHANGE,
      _monsterSelectForms
    );
  });

  createPageMediator.on(CROWN_SELECT_VISIBILITY_CHANGE, setCrownVisibility);

  function getMonsterSelectForms() {
    return _monsterSelectForms;
  }

  function setCrownVisibility(value) {
    _crownSelectVisibility = value;
    changeCrownSelectVisibility(_crownSelectVisibility);
  }

  function changeCrownSelectVisibility(visible) {
    _monsterSelectForms.forEach((form) => {
      // Only apply to forms that have monster details
      if (form.find('.monster-details').length > 0) {
        applyCrownVisibility(form);
      }
    });
  }

  function applyCrownVisibility(form) {
    const monsterCrownSelect = form.find('.monster-crown');
    const label = form.find('.monster-crown-label');

    if (_crownSelectVisibility) {
      label.show();
      monsterCrownSelect.show();
      monsterCrownSelect.prop('disabled', false);
    } else {
      label.hide();
      monsterCrownSelect.hide();
      monsterCrownSelect.prop('disabled', true);
    }
  }

  function addForm(form) {
    if (_monsterSelectForms.size >= 2) return;
    _monsterSelectForms.add(form);
    container.append(form);
  }

  function removeForm(form) {
    if (_monsterSelectForms.has(form)) {
      _monsterSelectForms.delete(form);
      form.remove();
      container.trigger('change');
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

    [monsterForm, monsterDetails].forEach((container) => {
      // Update all elements that have an ID
      container.find('[id]').each(function () {
        const $el = $(this);
        const currentId = $el.attr('id');
        $el.attr('id', `${currentId}-${formId}`);
      });

      // Update all labels that have a 'for' attribute
      container.find('label[for]').each(function () {
        const $label = $(this);
        const currentFor = $label.attr('for');
        $label.attr('for', `${currentFor}-${formId}`);
      });
    });

    const monsterSelect = monsterForm.find('.monster-select');

    initializeMonsterSelect(monsterSelect, monsterDetails, monsterForm);

    // Select Monster by Default
    requestAnimationFrame(() => {
      monsterSelect
        .val(monsterId || monstersList[0]?.id)
        .trigger({
          type: 'select2:selecting',
          params: {
            args: {
              data: {
                id: monsterId || monstersList[0]?.id,
              },
            },
          },
        })
        .trigger('change');
    });

    monsterForm
      .find('.remove-button')
      .on('click', () => removeForm(monsterForm));

    return monsterForm;
  }

  function initializeMonsterSelect(
    monsterSelect,
    monsterDetailsTemplate,
    form
  ) {
    monsterSelect.select2({
      placeholder: '-- Choose a monster --',
      templateResult: formatMonsterOption,
    });

    // Select handler
    monsterSelect.on('select2:selecting', function (e) {
      const data = e.params?.args.data;
      if (!data?.id) return;

      const monster = monstersList.find((m) => m.id === data.id);

      form.find('.monster-details').remove();

      const monsterDetails = monsterDetailsTemplate.clone().appendTo(form);

      // Configure monster variant options
      configureMonsterVariants(monsterDetails, monster);
      applyCrownVisibility(form);
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
