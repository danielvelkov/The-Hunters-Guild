// Utility functions shared across modules

export const createObservableArray = (arr, callback) => {
  return new Proxy(arr, {
    set(target, property, value) {
      target[property] = value;
      callback(target); // Trigger callback on modification
      return true;
    },
    deleteProperty(target, property) {
      delete target[property];
      callback(target);
      return true;
    },
  });
};

// Get color for damage values
export const getDmgColor = (value, baseColor) => {
  // Ensure value stays within range
  let intensity = Math.min(Math.max(value, 0), 35);

  if (intensity === 0) return `none`;

  // Define RGB values for base colors
  const colors = {
    red: [255, 255 - intensity * 5, 255 - intensity * 5],
    yellow: [255, 255, 255 - intensity * 7],
    blue: [255 - intensity * 10, 255 - intensity * 5, 255],
    purple: [255 - intensity * 5, 255 - intensity * 5, 255],
    cyan: [255 - intensity * 9, 255, 255],
  };

  // Get the RGB values based on baseColor
  let color = colors[baseColor.toLowerCase()] || [];

  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
};

// Get style for quest category
export const getQuestCategoryStyle = (category) => {
  switch (category) {
    case 'Assignment':
      return 'background-color: #a61713; color: white;';
    case 'Optional':
      return 'background-color: #6c808b; color: white;';
    case 'Event':
      return 'background-color: #d3b24b; color: black;';
    case 'Field Survey':
      return 'background-color: #9ea557; color: black;';
    case 'Saved Investigation':
      return 'background-color: #7db065; color: black;';
    case 'Arena Quest':
    case 'Free Challenge Quest':
    case 'Challenge Quest':
      return 'background-color: #4c4771; color: white;';
    default:
      return '';
  }
};

export function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  );
}

export function findClassEnumStaticPropInstance(Class, value) {
  const staticPropInstance = Class.values().find(
    (staticProps) =>
      staticProps === value ||
      staticProps.id.toString() === value ||
      staticProps.name === value
  );
  return staticPropInstance || null;
}
