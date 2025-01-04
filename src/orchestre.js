var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import BufferLoader from './buffer-loader';
import EventEmitter from './event-emitter';
import Metronome from './metronome';
import SoundLoop from './sound-loop';
/**
 * Manage sounds and activate them as players
 * @param {number} bpm - Beats per minute
 * @param {AudioContext} context
 * @property {AudioContext} context - Audio context
 * @property {GainNode} master - Gain connected to context's destination
 * @property {Metronome} metronome
 * @property {boolean} started
 * @property {boolean} paused - True when orchestre has been suspended
 */
var Orchestre = /** @class */ (function () {
    function Orchestre(bpm, context) {
        this.bpm = bpm;
        this.players = {};
        this.context =
            context ||
                new (window.AudioContext || window.webkitAudioContext)();
        this.eventEmitter = new EventEmitter();
        this.metronome = new Metronome(this.bpm, this.context, this.eventEmitter);
        this.loader = new BufferLoader(this.context);
        // Master volume
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.master.gain.setValueAtTime(1, 0);
        // Events
        this.subscribers = [];
        this.subId = -1;
        this._updateEvents = this._updateEvents.bind(this);
        this.started = false;
        this.paused = false;
    }
    /*
     * At each beat, call eventual subscribers
     * @param {float} time - Time in seconds of the beat
     */
    Orchestre.prototype._updateEvents = function (time) {
        if (this.subscribers.length > 0) {
            var toRemove_1 = [];
            for (var _i = 0, _a = this.subscribers; _i < _a.length; _i++) {
                var sub = _a[_i];
                // Decrease the number of beat to wait
                sub.wait -= 1;
                if (sub.wait <= 0) {
                    // Call subscriber function
                    try {
                        sub.callback(time);
                    }
                    catch (err) {
                        throw err;
                    }
                    finally {
                        if (sub.repeat)
                            // Repeat
                            sub.wait = sub.length;
                        else
                            toRemove_1.push(sub.id);
                    }
                }
            }
            // Remove called subscribers
            this.subscribers = this.subscribers.filter(function (sub) { return !toRemove_1.includes(sub.id); });
        }
    };
    /**
     * Start metronome
     * @param {string[]} [players=[]] - names of players to start immediately
     */
    Orchestre.prototype.start = function (players) {
        if (players === void 0) { players = []; }
        if (this.started)
            throw new Error('Orchestre is already started');
        this.context.resume();
        this.metronome.start(this.context.currentTime);
        this.eventEmitter.subscribe('beat', this._updateEvents);
        this.started = true;
        this.paused = false;
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var player = players_1[_i];
            this.play(player, { now: true });
        }
    };
    /**
     * Immediately stop all the instruments, then stop the metronome
     */
    Orchestre.prototype.fullStop = function () {
        if (!this.started)
            throw new Error('Orchestre has not been started');
        for (var player in this.players) {
            if (this.players.hasOwnProperty(player))
                this.players[player].soundLoop.stop(this.context.currentTime);
        }
        this.eventEmitter.unsubscribe('beat', this._updateEvents);
        this.metronome.stop();
        this.started = false;
        this.paused = false;
    };
    /**
     * Prepare sounds
     * @param {object[]} players - Players configuration
     * @param {string} players[].name - Player's identifier
     * @param {string} players[].url - URL of the sound file
     * @param {number} players[].length - Number of beats that the sound contains
     * @param {boolean} [players[].absolute=false] - Indicates that the player is aligned absolutely in the song
     * @param {AudioNode} [players[].destination] - Audio node to connect the player to
     * @returns {Promise} Promise that resolves once all player has been loaded
     */
    Orchestre.prototype.addPlayers = function (players) {
        return __awaiter(this, void 0, void 0, function () {
            var buffers, _i, players_2, sound, player;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loader.loadAll(players)];
                    case 1:
                        buffers = _a.sent();
                        // Store sounds into players
                        for (_i = 0, players_2 = players; _i < players_2.length; _i++) {
                            sound = players_2[_i];
                            if (!buffers[sound.name])
                                return [2 /*return*/];
                            player = __assign(__assign({}, sound), { soundLoop: new SoundLoop(this.context, buffers[sound.name], this.eventEmitter, sound.length, !!sound.absolute, sound.destination || this.master), playing: false });
                            this.players[sound.name] = player;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Prepare a single sound
     * @param {string} name - Player's identifier
     * @param {string} url - URL of the sound file
     * @param {number} length - Number of beats that the sound contains
     * @param {boolean} [absolute=false] - Indicates that the player is aligned absolutely in the song
     * @param {AudioNode} [destination] - Audio node to connect the player to
     * @returns {Promise} Promise that resolves once the player is loaded
     */
    Orchestre.prototype.addPlayer = function (name, url, length, absolute, destination) {
        var _this = this;
        if (absolute === void 0) { absolute = false; }
        return this.loader.load(name, url).then(function (buffer) {
            _this.players[name] = {
                name: name,
                url: url,
                length: length,
                absolute: absolute,
                soundLoop: new SoundLoop(_this.context, buffer, _this.eventEmitter, length, absolute, destination || _this.master),
                playing: false,
            };
        });
    };
    /** Connect a player to an audio node
     * @param {string} name
     * @param {AudioNode} destination
     */
    Orchestre.prototype.connect = function (name, destination) {
        this.players[name].soundLoop.connect(destination);
    };
    /** Disconnect a player from all its destination or one audio node
     * @param {string} name
     * @param {AudioNode} destination
     */
    Orchestre.prototype.disconnect = function (name, destination) {
        this.players[name].soundLoop.disconnect(destination);
    };
    /**
     * Toggle a sound state between play and stop
     * @param {string} name - Player identifier
     * @param {object} [options={}]
     * @param {float} [options.fade] - Time constant for fade in or fade out
     * @param {boolean} [options.now] - If true, sound will start / stop immediately. Otherwise, it waits for next beat.
     * @param {boolean} [options.once] - Play sound only once, then stop
     */
    Orchestre.prototype.toggle = function (name, options) {
        if (options === void 0) { options = {}; }
        if (!this.started)
            throw new Error('Orchestre has not been started');
        var player = this.players[name];
        if (!player)
            throw new Error("Player ".concat(name, " does not exist"));
        if (!player.soundLoop.playing) {
            player.soundLoop.start(options.now
                ? this.context.currentTime
                : this.metronome.getNextBeatTime(), this.metronome, options.fade || 0, options.once);
        }
        else {
            player.soundLoop.stop(options.now
                ? this.context.currentTime
                : this.metronome.getNextBeatTime(), options.fade || 0);
        }
        // Return the state of the instrument
        return player.playing;
    };
    /**
     * Start a player
     * @param {string} name - Player identifier
     * @param {object} [options={}]
     * @param {float} [options.fade] - Time constant for fade in
     * @param {boolean} [options.now] - If true, sound will start immediately. Otherwise, it waits for next beat.
     * @param {boolean} [options.once] - Play sound only once, then stop
     */
    Orchestre.prototype.play = function (name, options) {
        if (options === void 0) { options = {}; }
        if (!this.started)
            throw new Error('Orchestre has not been started');
        var player = this.players[name];
        if (!player)
            throw new Error("play: player ".concat(name, " does not exist"));
        player.soundLoop.start(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), this.metronome, options.fade || 0, options.once);
    };
    /**
     * Stop a player
     * @param {string} name - LAYER identifier
     * @param {object} [options={}]
     * @param {float} [options.fade] - Time constant for fade out
     * @param {boolean} [options.now] - If true, sound will stop immediately. Otherwise, it waits for next beat.
     */
    Orchestre.prototype.stop = function (name, options) {
        if (options === void 0) { options = {}; }
        if (!this.started)
            throw new Error('Orchestre has not been started');
        var player = this.players[name];
        if (!player)
            throw new Error("stop: player ".concat(name, " does not exist"));
        player.soundLoop.stop(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), options.fade || 0);
    };
    /** Check if a player is active
     * @param {string} name
     * @returns {boolean}
     */
    Orchestre.prototype.isPlaying = function (name) {
        return this.players[name].soundLoop.playing;
    };
    /**
     * Schedule an action (play, stop, or toggle) for a player on an incoming beat
     * @param {string} name - Player identifier
     * @param {number} beats - Number of beat to wait before action
     * @param {string} [action='toggle'] - Either 'play', 'stop' or 'toggle'
     * @param {object} [options={}]
     * @param {float} [options.fade] - Time constant for fade in or fade out
     * @param {boolean} [options.once] - Play sound only once, then stop
     * @param {boolean} [options.absolute] - Action will be performed on the next absolute nth beat (next bar of n beat)
     * @param {number} [options.offset] - Use with absolute to set a position in the bar
     */
    Orchestre.prototype.schedule = function (name, beats, action, options) {
        if (action === void 0) { action = 'toggle'; }
        if (options === void 0) { options = {}; }
        if (!this.started)
            throw new Error('Orchestre has not been started');
        var player = this.players[name];
        if (!player)
            throw new Error("schedule: player ".concat(name, " does not exist"));
        if (beats <= 0)
            throw new Error("schedule: beats must be a positive number");
        var beatsToWait = beats -
            (options.absolute
                ? this.metronome.getBeatPosition(this.context.currentTime, beats)
                : 0) +
            (options.offset || 0);
        var eventTime = this.metronome.getNextNthBeatTime(beatsToWait);
        if (action === 'play' ||
            (action === 'toggle' && !player.soundLoop.playing)) {
            player.soundLoop.start(eventTime, this.metronome, options.fade || 0, options.once);
        }
        else if (action === 'stop' ||
            (action === 'toggle' && player.soundLoop.playing)) {
            player.soundLoop.stop(eventTime, options.fade || 0);
        }
        else {
            throw new Error("schedule: action ".concat(action, " is not recognized (must be within ['play', 'stop', 'toggle'])"));
        }
    };
    /**
     * Wait for a number of beats
     * @param {number} [beats=1] - number of beats to wait
     * @param {objects} [options={}]
     * @param {boolean} [options.absolute] - Callback will be called on the next absolute nth beat (next bar of n beats)
     * @param {number} [options.offset] - Use with absolute to set a position in the bar
     * @returns {Promise<number>} Resolves on the scheduled beat with its position in seconds
     */
    Orchestre.prototype.wait = function (beats, options) {
        var _this = this;
        if (beats === void 0) { beats = 1; }
        if (options === void 0) { options = {}; }
        this.subId++;
        return new Promise(function (resolve) {
            _this.subscribers.push({
                id: _this.subId,
                callback: resolve,
                length: beats,
                repeat: false,
                wait: beats -
                    (options.absolute
                        ? _this.metronome.getBeatPosition(_this.context.currentTime, beats)
                        : 0) +
                    (options.offset || 0),
            });
        });
    };
    /**
     * Call a function every n beats
     * @param {Orchestre~beatCallback} callback - Function to call
     * @param {number} [beats=1] - number of beats to wait
     * @param {objects} [options={}]
     * @param {boolean} [options.absolute] - Callback will be called on absolute nth beat (bar of n beats)
     * @param {number} [options.offset] - Use with absolute to set a position in the bar
     * @returns {number} Listener's id
     */
    Orchestre.prototype.addListener = function (callback, beats, options) {
        if (beats === void 0) { beats = 1; }
        if (options === void 0) { options = {}; }
        this.subId++;
        this.subscribers.push({
            id: this.subId,
            callback: callback,
            length: beats,
            repeat: true,
            wait: beats -
                (options.absolute
                    ? this.metronome.getBeatPosition(this.context.currentTime, beats)
                    : 0) +
                (options.offset || 0),
        });
        return this.subId;
    };
    /**
     * Remove an existing listener
     * @param {number} id - Listener's id
     * @returns {boolean} true if found
     */
    Orchestre.prototype.removeListener = function (id) {
        var subIndex = this.subscribers.findIndex(function (sub) { return sub.id === id; });
        if (subIndex !== -1) {
            this.subscribers.splice(subIndex, 1);
        }
        return subIndex !== -1;
    };
    /**
     * Suspend metronome and players
     * @return {Promise} resolves with void
     */
    Orchestre.prototype.suspend = function () {
        this.paused = true;
        return this.context.suspend();
    };
    /**
     * Resume metronome and players if they have been suspended
     * @return {Promise} resolves with void
     */
    Orchestre.prototype.resume = function () {
        this.paused = false;
        return this.context.resume();
    };
    /**
     * Change volume of the orchestra
     * @param {float} value - 0 is mute, 1 is default. Set in between to lower, higher to increase.
     */
    Orchestre.prototype.setVolume = function (value) {
        this.master.gain.setValueAtTime(value, this.context.currentTime);
    };
    return Orchestre;
}());
/**
 * Callback function called on beat event
 * @callback Orchestre~beatCallback
 * @param {float} nextBeat - Time of the next coming beat in seconds
 */
export default Orchestre;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JjaGVzdHJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL29yY2hlc3RyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sWUFBWSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sWUFBWSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUVwQyxPQUFPLFNBQVMsTUFBTSxjQUFjLENBQUM7QUEwQnJDOzs7Ozs7Ozs7R0FTRztBQUNIO0lBV0UsbUJBQW9CLEdBQVcsRUFBRSxPQUFzQjtRQUFuQyxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxPQUFPO1lBQ1YsT0FBTztnQkFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSyxNQUFjLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO1FBQ3BFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFN0MsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNB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