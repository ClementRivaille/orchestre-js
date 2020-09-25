/**
* Utilitary to emit event and subscribe to them
*/
class EventEmitter {
  listeners: any;
  constructor() {
    this.listeners = {};
  }

  subscribe(event: any, callback: any) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push({
      callback: callback
    });
  }

  unsubscribe(event: any, callback: any) {
    if (this.listeners[event]) {
      let index = this.listeners[event].findIndex((listener: any) => {
        return callback === listener.callback;
      });
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  // @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
  emit(event: any, ...args) {
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
