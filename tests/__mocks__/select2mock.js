/**
 * Mock Jquery Select2 fn
 */
export default function createSelect2Mock() {
  const select2Instances = new Map();

  $.fn.select2 = function (options = {}) {
    const $element = this;
    const elementId = $element.attr('id') || Math.random().toString(36);

    // Store the current value and event handlers
    const instance = {
      value: null,
      handlers: new Map(),
      options: options,
      $element: $element,
    };

    select2Instances.set(elementId, instance);

    // Mock select2 methods
    const mockApi = {
      on: jest.fn((event, handler) => {
        if (!instance.handlers.has(event)) {
          instance.handlers.set(event, []);
        }
        instance.handlers.get(event).push(handler);
        return mockApi;
      }),

      val: jest.fn((value) => {
        if (arguments.length === 0) {
          // Getter
          return instance.value;
        }

        // Setter
        instance.value = value;

        // Update the actual select element
        $element.val(value);

        return mockApi;
      }),

      trigger: jest.fn((event) => {
        const eventType = typeof event === 'string' ? event : event.type;

        if (eventType === 'change') {
          // Trigger change handlers
          if (instance.handlers.has('change')) {
            instance.handlers.get('change').forEach((handler) => {
              handler.call($element[0], {
                type: 'change',
                target: $element[0],
                currentTarget: $element[0],
              });
            });
          }
        } else if (eventType === 'select2:selecting') {
          const id = event.params?.args?.data?.id || instance.value;

          if (monster && instance.handlers.has('select2:selecting')) {
            instance.handlers.get('select2:selecting').forEach((handler) => {
              handler.call($element[0], {
                type: 'select2:selecting',
                params: {
                  args: {
                    data: {
                      id,
                    },
                  },
                },
              });
            });
          }
        } else if (eventType === 'select2:select') {
          const id = event.params?.data?.id || instance.value;

          if (monster && instance.handlers.has('select2:select')) {
            instance.handlers.get('select2:select').forEach((handler) => {
              handler.call($element[0], {
                type: 'select2:select',
                params: {
                  data: {
                    id,
                  },
                },
              });
            });
          }
        }

        return mockApi;
      }),
    };

    // Store reference to the mock API in the element data
    $element.data('select2-mock', mockApi);

    return mockApi;
  };

  return {
    getInstance: (elementId) => select2Instances.get(elementId),
    getAllInstances: () => select2Instances,
    clearInstances: () => select2Instances.clear(),
  };
}
