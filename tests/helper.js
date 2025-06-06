export const selectSelect2Option = (selectElement, value) => {
  const $select = $(selectElement);

  // Set the value
  $select.val(value);

  // Trigger Select2 events
  $select.trigger({
    type: 'select2:selecting',
    params: {
      args: {
        data: {
          id: value,
        },
      },
    },
  }).trigger('change');
};

export const select2Clear = (selectElement) => {
  const $select = $(selectElement);
  $select.val(null);
  $select.trigger('select2:clear');
};
