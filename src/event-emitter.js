var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Utilitary to emit event and subscribe to them
 */
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.listeners = {};
    }
    EventEmitter.prototype.subscribe = function (event, callback) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push({
            callback: callback,
        });
    };
    EventEmitter.prototype.unsubscribe = function (event, callback) {
        if (this.listeners[event]) {
            var index = this.listeners[event].findIndex(function (listener) {
                return callback === listener.callback;
            });
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    };
    EventEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.listeners[event]) {
            for (var _a = 0, _b = __spreadArray([], this.listeners[event], true); _a < _b.length; _a++) {
                var listener = _b[_a];
                try {
                    listener.callback.apply(listener, args);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    };
    return EventEmitter;
}());
export default EventEmitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ldmVudC1lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUlBOztHQUVHO0FBQ0g7SUFFRTtRQURBLGNBQVMsR0FBdUMsRUFBRSxDQUFDO0lBQ3BDLENBQUM7SUFFaEIsZ0NBQVMsR0FBVCxVQUFVLEtBQWEsRUFBRSxRQUFrQjtRQUN6QyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3pCLFFBQVEsRUFBRSxRQUFRO1NBQ25CLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxrQ0FBVyxHQUFYLFVBQVksS0FBYSxFQUFFLFFBQWtCO1FBQzNDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzFCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQUMsUUFBUTtnQkFDbkQsT0FBTyxRQUFRLEtBQUssUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELDJCQUFJLEdBQUosVUFBSyxLQUFhO1FBQUUsY0FBYzthQUFkLFVBQWMsRUFBZCxxQkFBYyxFQUFkLElBQWM7WUFBZCw2QkFBYzs7UUFDaEMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDMUIsS0FBcUIsVUFBMEIsRUFBMUIsdUJBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBQyxFQUExQixjQUEwQixFQUExQixJQUEwQixFQUFFLENBQUM7Z0JBQTdDLElBQUksUUFBUSxTQUFBO2dCQUNmLElBQUksQ0FBQztvQkFDSCxRQUFRLENBQUMsUUFBUSxPQUFqQixRQUFRLEVBQWEsSUFBSSxFQUFFO2dCQUM3QixDQUFDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQWpDRCxJQWlDQztBQUVELGVBQWUsWUFBWSxDQUFDIn0=