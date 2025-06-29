const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const jQuery = require('jquery');

global.$ = global.jQuery = jQuery;

require('jquery-ui/ui/version');
require('jquery-ui/ui/plugin');
require('jquery-ui/ui/widget');

require('jquery-ui/ui/widgets/accordion');
require('jquery-ui/ui/widgets/tabs');
require('jquery-ui/ui/widgets/tooltip');

const select2 = require('select2');

if (typeof $.fn.select2 === 'undefined') {
  $.fn.select2 = select2;
}

if (typeof Math.sumPrecise === 'undefined') {
  Math.sumPrecise = (...args) => args.reduce((sum, v) => sum + v, 0);
}

global.structuredClone = (val) => JSON.parse(JSON.stringify(val));

global.requestAnimationFrame = jest.fn((cb) => cb());

global.HTMLElement.prototype.scrollIntoView = function () {};
