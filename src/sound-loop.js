/**
 * Sound loop that stays in sync with the beats
 */
var SoundLoop = /** @class */ (function () {
    function SoundLoop(context, metronome, buffer, eventEmitter, nbBeats, absolute, destination) {
        this.context = context;
        this.metronome = metronome;
        this.buffer = buffer;
        this.eventEmitter = eventEmitter;
        this.nbBeats = nbBeats;
        this.absolute = absolute;
        this.nextMeasure = -1;
        this.playing = false;
        this.startTime = 0;
        this.stopped = true;
        this.subscribed = false;
        this.disposedSources = [];
        this.stopped = true;
        this.stopQueue = 0;
        this._beatSchedule = this._beatSchedule.bind(this);
        this.gainNode = context.createGain();
        this.gainNode.connect(destination || context.destination);
        this.gainNode.gain.setValueAtTime(0, 0);
    }
    /** Play the sound from the beginning */
    SoundLoop.prototype._loop = function (startTime, offset) {
        var _this = this;
        if (offset === void 0) { offset = 0; }
        if (this.source) {
            // Keep playing and add to disposed sources list
            this.disposedSources.push(this.source);
        }
        // Create a new source node
        var source = this.context.createBufferSource();
        source.loop = false;
        source.buffer = this.buffer;
        source.connect(this.gainNode);
        source.start(startTime, offset);
        // Disconnect and remove the source once it stops
        source.addEventListener('ended', function () {
            source.disconnect(_this.gainNode);
            var disposedIdx = _this.disposedSources.indexOf(source);
            if (disposedIdx > -1) {
                _this.disposedSources.splice(disposedIdx, 1);
            }
        });
        this.source = source;
    };
    /** Start the loop */
    SoundLoop.prototype.start = function (startTime, fadeIn, once) {
        if (fadeIn === void 0) { fadeIn = 0; }
        if (once === void 0) { once = false; }
        if (this.stopped) {
            this.startTime = startTime;
            this.stopped = once || false;
            // Absolute loop, start at nth beat
            if (this.absolute) {
                var offset = this.metronome.getOffset(startTime);
                var beatPos = this.metronome.getBeatPosition(startTime, this.nbBeats);
                this._loop(startTime, beatPos * this.metronome.beatLength + offset);
                this.nextMeasure = this.nbBeats - beatPos;
            }
            // Relative loop, starts at first beat
            else {
                this._loop(startTime, this.metronome.getOffset(startTime));
                this.nextMeasure = this.nbBeats;
            }
            // If called immediately, we must ensure the next loop
            if (startTime <= this.context.currentTime && !once) {
                this._beatSchedule(this.metronome.getNextBeatTime());
            }
        }
        // Fading
        this.gainNode.gain.setTargetAtTime(1, startTime, fadeIn || 0);
        // Subscribe to beat events
        if (!this.subscribed && !once) {
            this.eventEmitter.subscribe('beat', this._beatSchedule);
            this.subscribed = true;
        }
        this.playing = !once;
    };
    SoundLoop.prototype._beatSchedule = function (nextBeat) {
        // Decrease beats remaining, unless we're at the very first beat
        this.nextMeasure =
            nextBeat > this.startTime && Math.abs(nextBeat - this.startTime) > 0.0001
                ? this.nextMeasure - 1
                : this.nextMeasure;
        // Restart the loop
        if (this.nextMeasure <= 0 && !this.stopped) {
            this._loop(nextBeat);
            this.nextMeasure = this.nbBeats;
        }
    };
    SoundLoop.prototype._fadeOut = function (stopTime, length) {
        if (length === void 0) { length = 0; }
        this.gainNode.gain.setTargetAtTime(0, stopTime, length);
    };
    /** End loop */
    SoundLoop.prototype._disable = function (keep) {
        var _this = this;
        if (keep === void 0) { keep = false; }
        if (this.source) {
            this.disposedSources.push(this.source);
        }
        if (!keep) {
            this.disposedSources.forEach(function (source) {
                return source.stop(_this.context.currentTime);
            });
        }
        this.stopped = true;
        this.eventEmitter.unsubscribe('beat', this._beatSchedule);
        this.subscribed = false;
    };
    /** Schedule a stop */
    SoundLoop.prototype.stop = function (stopTime, fadeOut, keep) {
        var _this = this;
        if (fadeOut === void 0) { fadeOut = 0; }
        if (keep === void 0) { keep = false; }
        this.playing = false;
        this.stopQueue += 1;
        if (fadeOut > 0) {
            this._fadeOut(stopTime, fadeOut);
        }
        // Cancel the next loop if already scheduled with keep
        if (keep && this.getBeatPosition(stopTime) === 0) {
            var timeBeforeBeat = stopTime - this.metronome.beatLength / 2;
            var timeToWait = Math.max(0, timeBeforeBeat - this.context.currentTime);
            setTimeout(function () {
                var _a;
                if (!_this.playing && _this.stopQueue <= 1) {
                    (_a = _this.source) === null || _a === void 0 ? void 0 : _a.stop(stopTime);
                }
            }, timeToWait * 1000);
        }
        // Disable loop on the final beat
        var deltaStop = stopTime - this.context.currentTime;
        if (keep) {
            var remainingBeats = Math.max(0, (this.nextMeasure % this.nbBeats) - 1);
            var nbBeatsToWait = Math.ceil(deltaStop / this.metronome.beatLength);
            var extraLoops = Math.floor(nbBeatsToWait / this.nbBeats);
            deltaStop =
                (remainingBeats + this.nbBeats * extraLoops) *
                    this.metronome.beatLength;
        }
        setTimeout(function () {
            _this.stopQueue -= 1;
            if (!_this.playing && _this.stopQueue <= 0 && !_this.stopped) {
                _this._disable(keep);
            }
        }, deltaStop * 1000 + fadeOut * 5000);
    };
    SoundLoop.prototype.connect = function (destination) {
        this.gainNode.connect(destination);
    };
    SoundLoop.prototype.disconnect = function (destination) {
        this.gainNode.disconnect(destination);
    };
    /**
     * Return the beat position in the loop relatively to when it started
     */
    SoundLoop.prototype.getBeatPosition = function (time) {
        var absolutePosition = this.metronome.getBeatPosition(time, this.nbBeats);
        if (this.absolute)
            return absolutePosition;
        var offset = this.metronome.getBeatPosition(this.startTime, this.nbBeats);
        return (this.nbBeats + absolutePosition - offset) % this.nbBeats;
    };
    return SoundLoop;
}());
export default SoundLoop;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291bmQtbG9vcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zb3VuZC1sb29wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBOztHQUVHO0FBQ0g7SUFXRSxtQkFDVSxPQUFxQixFQUNyQixTQUFvQixFQUNwQixNQUFtQixFQUNuQixZQUEwQixFQUMxQixPQUFlLEVBQ2YsUUFBaUIsRUFDekIsV0FBdUI7UUFOZixZQUFPLEdBQVAsT0FBTyxDQUFjO1FBQ3JCLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFDcEIsV0FBTSxHQUFOLE1BQU0sQ0FBYTtRQUNuQixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUMxQixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsYUFBUSxHQUFSLFFBQVEsQ0FBUztRQWZuQixnQkFBVyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzFCLFlBQU8sR0FBWSxLQUFLLENBQUM7UUFFeEIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQUV0QixZQUFPLEdBQVksSUFBSSxDQUFDO1FBQ3hCLGVBQVUsR0FBWSxLQUFLLENBQUM7UUFDNUIsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBV3BELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCx3Q0FBd0M7SUFDaEMs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