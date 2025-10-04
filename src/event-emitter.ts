interface Callback {
  callback: Function;
}

/**
 * Utilitary to emit event and subscribe to them
 */
class EventEmitter {
  listeners: { [key: string]: Array<Callback> } = {};
  constructor() {}

  subscribe(event: string, callback: Function) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push({
      callback: callback,
    });
  }

  unsubscribe(event: string, callback: Function) {
    if (this.listeners[event]) {
      let index = this.listeners[event].findIndex((listener) => {
        return callback === listener.callback;
      });
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      for (let listener of [...this.listeners[event]]) {
        try {
          listener.callback(...args);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
}

export default EventEmitter;
