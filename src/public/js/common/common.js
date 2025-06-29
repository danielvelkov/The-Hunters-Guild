import 'css/theme.css';
import 'css/helper/sparkle.css';

if (typeof Math.sumPrecise === 'undefined') {
  Math.sumPrecise = (...args) => args.reduce((sum, v) => sum + v, 0);
}
