/**
 * A super-basic JavaScript Publish-Subscribe (PubSub) pattern.
 */
class Mediator {
  /**
   * Creates a new Mediator instance.
   */
  constructor() {
    /**
     * Stores event listeners by event name.
     * @type {Object.<string, Function[]>}
     */
    this.events = {};
  }

  /**
   * Registers a callback function for a specific event.
   * @param {string} eventName - The name of the event.
   * @param {Function} fn - The callback function to execute when the event is triggered.
   */
  on(eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }

  /**
   * Unsubscribes a callback function from a specific event.
   * @param {string} eventName - The name of the event.
   * @param {Function} fn - The callback function to remove.
   */
  off(eventName, fn) {
    if (this.events[eventName]) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  }

  /**
   * Triggers an event, executing all associated callback functions.
   * @param {string} eventName - The name of the event.
   * @param {*} data - Optional data to pass to the callback functions.
   */
  trigger(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function (fn) {
        fn(data);
      });
    }
  }
}

export default new Mediator();
