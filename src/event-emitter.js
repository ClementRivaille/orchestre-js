/**
* Utilitary to emit event and subscribe to them
*/
class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  subscribe(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push({
      callback: callback
    });
  }

  unsubscribe(event, callback) {
    if (this.listeners[event]) {
      let index = this.listeners[event].findIndex((listener) => {
        return callback === listener.callback;
      });
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      for (let listener of this.listeners[event]) {
        try {
          listener.callback(...args);
        }
        catch (e) {
          console.error(e);
        }
      }
    }
  }
}

export default EventEmitter;
