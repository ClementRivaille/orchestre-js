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
        this.subscribers = {};
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
        this.subscribers = {};
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
        if (Object.keys(this.subscribers).length > 0) {
            for (var _i = 0, _a = Object.values(this.subscribers); _i < _a.length; _i++) {
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
                            delete this.subscribers[sub.id];
                    }
                }
            }
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
                            player = __assign(__assign({}, sound), { soundLoop: new SoundLoop(this.context, this.metronome, buffers[sound.name], this.eventEmitter, sound.length, !!sound.absolute, sound.destination || this.master), playing: false });
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
                soundLoop: new SoundLoop(_this.context, _this.metronome, buffer, _this.eventEmitter, length, absolute, destination || _this.master),
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
     * @param {boolean} [options.keep] - On stop, keep track playing until its end
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
                : this.metronome.getNextBeatTime(), options.fade || 0, options.once);
        }
        else {
            player.soundLoop.stop(options.now
                ? this.context.currentTime
                : this.metronome.getNextBeatTime(), options.fade || 0, options.keep);
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
        player.soundLoop.start(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), options.fade || 0, options.once);
    };
    /**
     * Stop a player
     * @param {string} name - LAYER identifier
     * @param {object} [options={}]
     * @param {float} [options.fade] - Time constant for fade out
     * @param {boolean} [options.now] - If true, sound will stop immediately. Otherwise, it waits for next beat.
     * @param {boolean} [options.keep] - Keep track playing until its end
     */
    Orchestre.prototype.stop = function (name, options) {
        if (options === void 0) { options = {}; }
        if (!this.started)
            throw new Error('Orchestre has not been started');
        var player = this.players[name];
        if (!player)
            throw new Error("stop: player ".concat(name, " does not exist"));
        player.soundLoop.stop(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), options.fade || 0, options.keep);
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
     * @param {boolean} [options.keep] - On stop, keep track playing until its end
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
            player.soundLoop.start(eventTime, options.fade || 0, options.once);
        }
        else if (action === 'stop' ||
            (action === 'toggle' && player.soundLoop.playing)) {
            player.soundLoop.stop(eventTime, options.fade || 0, options.keep);
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
            _this.subscribers[_this.subId] = {
                id: _this.subId,
                callback: resolve,
                length: beats,
                repeat: false,
                wait: beats -
                    (options.absolute
                        ? _this.metronome.getBeatPosition(_this.context.currentTime, beats)
                        : 0) +
                    (options.offset || 0),
            };
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
        this.subscribers[this.subId] = {
            id: this.subId,
            callback: callback,
            length: beats,
            repeat: true,
            wait: beats -
                (options.absolute
                    ? this.metronome.getBeatPosition(this.context.currentTime, beats)
                    : 0) +
                (options.offset || 0),
        };
        return this.subId;
    };
    /**
     * Remove an existing listener
     * @param {number} id - Listener's id
     * @returns {boolean} true if found
     */
    Orchestre.prototype.removeListener = function (id) {
        var hasIndex = this.subscribers.hasOwnProperty(id);
        if (hasIndex) {
            delete this.subscribers[id];
        }
        return hasIndex;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JjaGVzdHJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL29yY2hlc3RyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sWUFBWSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sWUFBWSxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUVwQyxPQUFPLFNBQVMsTUFBTSxjQUFjLENBQUM7QUF3QnJDOzs7Ozs7Ozs7R0FTRztBQUNIO0lBV0UsbUJBQW9CLEdBQVcsRUFBRSxPQUFzQjtRQUFuQyxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBRHZCLGdCQUFXLEdBQWlDLEVBQUUsQ0FBQztRQUVyRCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsT0FBTztZQUNWLE9BQU87Z0JBQ1AsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUssTUFBYyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztRQUNwRSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLGdCQUFnQjtRQUNoQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxJQUFJ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