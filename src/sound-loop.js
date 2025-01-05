/**
 * Sound loop that stays in sync with the beats
 */
var SoundLoop = /** @class */ (function () {
    function SoundLoop(context, buffer, eventEmitter, nbBeats, absolute, destination) {
        if (absolute === void 0) { absolute = false; }
        this.context = context;
        this.buffer = buffer;
        this.eventEmitter = eventEmitter;
        this.nbBeats = nbBeats;
        this.absolute = absolute;
        this.nextMeasure = -1;
        this.playing = false;
        this.startTime = 0;
        this.stopTime = 0;
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
    SoundLoop.prototype.start = function (startTime, metronome, fadeIn, once) {
        if (fadeIn === void 0) { fadeIn = 0; }
        if (once === void 0) { once = false; }
        if (this.stopped) {
            this.startTime = startTime;
            this.stopped = once || false;
            // Absolute loop, start at nth beat
            if (this.absolute) {
                var offset = metronome.getOffset(startTime);
                var beatPos = metronome.getBeatPosition(startTime, this.nbBeats);
                this._loop(startTime, beatPos * metronome.beatLength + offset);
                this.nextMeasure = this.nbBeats - beatPos;
            }
            // Relative loop, starts at first beat
            else {
                this._loop(startTime, metronome.getOffset(startTime));
                this.nextMeasure = this.nbBeats;
            }
            // If called immediately, we must ensure the next loop
            if (startTime <= this.context.currentTime && !once) {
                this._beatSchedule(metronome.getNextBeatTime());
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
            this.disposedSources.forEach(function (source) { return source.stop(_this.stopTime); });
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
        setTimeout(function () {
            _this.stopQueue -= 1;
            if (!_this.playing && _this.stopQueue <= 0 && !_this.stopped) {
                _this._disable(keep);
            }
        }, (stopTime - this.context.currentTime) * 1000 + fadeOut * 5000);
    };
    SoundLoop.prototype.connect = function (destination) {
        this.gainNode.connect(destination);
    };
    SoundLoop.prototype.disconnect = function (destination) {
        this.gainNode.disconnect(destination);
    };
    return SoundLoop;
}());
export default SoundLoop;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291bmQtbG9vcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zb3VuZC1sb29wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBOztHQUVHO0FBQ0g7SUFZRSxtQkFDVSxPQUFxQixFQUNyQixNQUFtQixFQUNuQixZQUEwQixFQUMxQixPQUFlLEVBQ2YsUUFBZ0IsRUFDeEIsV0FBdUI7UUFEZix5QkFBQSxFQUFBLGdCQUFnQjtRQUpoQixZQUFPLEdBQVAsT0FBTyxDQUFjO1FBQ3JCLFdBQU0sR0FBTixNQUFNLENBQWE7UUFDbkIsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLGFBQVEsR0FBUixRQUFRLENBQVE7UUFmbEIsZ0JBQVcsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUMxQixZQUFPLEdBQVksS0FBSyxDQUFDO1FBRXhCLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFFdEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixZQUFPLEdBQVksSUFBSSxDQUFDO1FBQ3hCLGVBQVUsR0FBWSxLQUFLLENBQUM7UUFDNUIsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1FBVXBELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCx3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