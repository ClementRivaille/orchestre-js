var MARGIN = 0.000001;
function areEquals(a, b) {
    return Math.abs(a - b) < MARGIN;
}
/**
 * Count beats, and give the time of next beat occurrence
 * @param {number} bpm
 * @param {AudioContext} context - audio context
 * @param {EventEmitter} eventEmitter - Internal class used to propagate events
 * @property {float} beatLength - Length of a beat in seconds
 * @property {AudioContext} context
 */
var Metronome = /** @class */ (function () {
    function Metronome(bpm, context, eventEmitter) {
        this.context = context;
        this.eventEmitter = eventEmitter;
        this.nextBeat = 0;
        this.startTime = 0;
        this.beatLength = 60 / bpm;
        this._clock = this._clock.bind(this);
    }
    Metronome.prototype.start = function (startTime) {
        this.startTime = startTime;
        this.nextBeat = this.beatLength;
        // Emit the first beat
        this._schedule();
        // Start the loop
        this.loopInterval = setInterval(this._clock, 50);
    };
    /*
     * Loop checking time each frame
     * The metronom is always one beat ahead, and calculate the time of the upcoming beat
     */
    Metronome.prototype._clock = function () {
        // Get current time (relative to start time)
        var currentTime = this.context.currentTime - this.startTime;
        // When next beat is reached, update its value
        if (currentTime >= this.nextBeat || areEquals(currentTime, this.nextBeat)) {
            this.nextBeat += this.beatLength;
            this._schedule();
        }
    };
    /* Emit beat event, and give the global time of next beat */
    Metronome.prototype._schedule = function () {
        this.eventEmitter.emit('beat', this.startTime + this.nextBeat);
    };
    /**
     * Public method use to obtain global next beat time
     * @returns {float} time in seconds of the beat
     */
    Metronome.prototype.getNextBeatTime = function () {
        this._fixBeat();
        return this.startTime + this.nextBeat;
    };
    /**
     * Public method use to obtain global nth next beat time
     * @param {number} beats - Number of beats
     * @returns {float} time in seconds of the beat
     */
    Metronome.prototype.getNextNthBeatTime = function (beats) {
        this._fixBeat();
        return this.startTime + this.nextBeat + (beats - 1) * this.beatLength;
    };
    /**
     * Get the offset in seconds of the given time relatively to the closest beat before it
     * @param {float} time - time in seconds from an audio context
     * @returns {float} time since last beat
     */
    Metronome.prototype.getOffset = function (time) {
        var offset = (time - this.startTime) % this.beatLength;
        return areEquals(this.beatLength, offset) ? 0 : offset;
    };
    /**
     * Gets the position of the given time in an absolute bar of n beats
     * @param {float} time
     * @param {number} barSize - Number of beats in a bar
     * @returns {number} position (from 0 to n - 1)
     */
    Metronome.prototype.getBeatPosition = function (time, barSize) {
        var barLength = this.beatLength * barSize;
        var barPosition = (time - this.startTime) % barLength;
        if (areEquals(barLength, barPosition))
            return 0;
        var position = Math.floor(barPosition / this.beatLength);
        return !areEquals(this.beatLength, Math.abs(barPosition - position * this.beatLength))
            ? position
            : (position + 1) % barSize;
    };
    Metronome.prototype.stop = function () {
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
        }
    };
    /*
     * If the getter methods are called just on a beat, check if the next beat value is still valid
     * This is to avoid giving a next beat value that is actually in the past
     */
    Metronome.prototype._fixBeat = function () {
        var currentTime = this.context.currentTime - this.startTime;
        if (currentTime >= this.nextBeat || areEquals(this.nextBeat, currentTime)) {
            this.nextBeat += this.beatLength;
            this._schedule();
        }
    };
    return Metronome;
}());
export default Metronome;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cm9ub21lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21ldHJvbm9tZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDeEIsU0FBUyxTQUFTLENBQUMsQ0FBUyxFQUFFLENBQVM7SUFDckMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDbEMsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSDtJQUtFLG1CQUNFLEdBQVcsRUFDSCxPQUFxQixFQUNyQixZQUEwQjtRQUQxQixZQUFPLEdBQVAsT0FBTyxDQUFjO1FBQ3JCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBTDVCLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFDckIsY0FBUyxHQUFXLENBQUMsQ0FBQztRQU01QixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQseUJBQUssR0FBTCxVQUFNLFNBQWlCO1FBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUVoQyxzQkFBc0I7UUFDdEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2pCLGlCQUFpQjtRQUNqQixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRDs7O09BR0c7SUFDSywwQkFBTSxHQUFkO1FBQ0UsNENBQTRDO1FBQzVDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDNUQsOENBQThDO1FBQzlDLElBQUksV0FBVyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUMxRSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ25CLENBQUM7SUFDSCxDQUFDO0lBRUQsNERBQTREO0lBQ3BELDZCQUFTLEdBQWpCO1FBQ0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxtQ0FBZSxHQUFmO1FBQ0UsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsc0NBQWtCLEdBQWxCLFVBQW1CLEtBQWE7UUFDOUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDeEUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCw2QkFBUyxHQUFULFVBQVUsSUFBWTtRQUNwQixJQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN6RCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN6RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxtQ0FBZSxHQUFmLFVBQWdCLElBQVksRUFBRSxPQUFlO1FBQzNDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO1FBQzVDLElBQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDeEQsSUFBSSxTQUFTLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsU0FBUyxDQUNmLElBQUksQ0FBQyxVQUFVLEVBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FDbkQ7WUFDQyxDQUFDLENBQUMsUUFBUTtZQUNWLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDL0IsQ0FBQztJQUVELHdCQUFJLEdBQUo7UUFDRSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN0QixhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssNEJBQVEsR0FBaEI7UUFDRSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzVELElBQUksV0FBVyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUMxRSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDakMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ25CLENBQUM7SUFDSCxDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBNUdELElBNEdDO0FBRUQsZUFBZSxTQUFTLENBQUMifQ==