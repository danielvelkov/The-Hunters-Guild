// Utility functions shared across modules

export const snakeCaseToTitleCase = (s) =>
  s
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase()) // Initial char (after -/_)
    .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase()); // First char after each -/_

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

export function chooseEmoteBasedOnPart(partFocus) {
  if (partFocus.match(/Head/)) {
    return '🤕';
  } else if (partFocus.match(/Tail/)) {
    return '✂️';
  } else if (partFocus.match(/Wing/)) {
    return '✈';
  } else if (partFocus.match(/Claw/)) {
    return '🐾';
  } else if (partFocus.match(/Body/)) {
    return '⚡';
  } else if (partFocus.match(/Leg/)) {
    return '🦵';
  } else if (partFocus.match(/Horn/)) {
    return '🦌';
  } else if (partFocus.match(/Back/)) {
    return '🔙';
  } else {
    return '🎯';
  }
}

export function filterOutMaliciousSymbols(value) {
  const lt = /</g,
    gt = />/g,
    ap = /'/g,
    ic = /"/g;
  value = value
    .toString()
    .replace(lt, '&lt;')
    .replace(gt, '&gt;')
    .replace(ap, '&#39;')
    .replace(ic, '&#34;');
  return value;
}

export function formatSkillInfoTooltip(skill) {
  if (!skill) {
    console.error('No skill provided');
    return '';
  }
  return `<div class="tooltip skill-info-tooltip">
     <img src="icons/Skill Icons/${skill.icon}.png" alt="${
    skill.name
  }" height="50">
     <h3 style="margin:0;padding:0em;">${skill.name}</h3> 
     <span style="opacity:0.9; font-size:0.9rem;">${skill.category}</span>
     <ul style="padding-left:1em">
      ${skill.level_descriptions
        .map((d, i) =>
          skill.min_level
            ? i + 1 === skill?.min_level
              ? `<li><b>${d}</b></li>`
              : `<li style="opacity:0.5">${d}</li>`
            : `<li>${d}</li>`
        )
        .join('')}
     </ul>
     <p style="font-size: 0.9rem;"><i>${skill.description}</i></p>
  </div>`;
}
