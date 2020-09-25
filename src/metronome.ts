const MARGIN = 0.000001;
function areEquals(a, b) {
  return Math.abs(a - b) < MARGIN;
}

/**
 * Count beats, and give the time of next beat occurence
 * @param {number} bpm
 * @param {AudioContext} context - audio context
 * @param {EventEmitter} eventEmitter - Internal class used to propagate events
 * @property {float} beatLength - Length of a beat in seconds
 * @property {AudioContext} context
 */
class Metronome {
  constructor(bpm, context, eventEmitter) {
    this.context = context;
    this.eventEmitter = eventEmitter;

    this.beatLength = 60 / bpm;
    this._clock = this._clock.bind(this);
  }

  start(startTime) {
    this.startTime = startTime;
    this.nextBeat = this.beatLength;

    // Emit the first beat
    this._schedule();
    // Start the loop
    this.loopInterval = setInterval(this._clock, 50);
  }

  /*
  * Loop checking time each frame
  * The metronom is always one beat ahead, and calculate the time of the upcoming beat
  */
  _clock() {
    // Get current time (relative to start time)
    let currentTime = this.context.currentTime - this.startTime;
    // When next beat is reached, update its value
    if (currentTime >= this.nextBeat || areEquals(currentTime, this.nextBeat)) {
      this.nextBeat += this.beatLength;
      this._schedule();
    }
  }

  /* Emit beat event, and give the global time of next beat */
  _schedule() {
    this.eventEmitter.emit('beat', this.startTime + this.nextBeat);
  }

  /**
   * Public method use to obtain global next beat time
   * @returns {float} time in seconds of the beat
   */
  getNextBeatTime() {
    this._fixBeat();
    return this.startTime + this.nextBeat;
  }

  /**
   * Public method use to obtain global nth next beat time
   * @param {number} beats - Number of beats
   * @returns {float} time in seconds of the beat
   */
  getNextNthBeatTime(beats) {
    this._fixBeat();
    return this.startTime + this.nextBeat + (beats - 1) * this.beatLength;
  }

  /**
   * Get the offset in seconds of the given time relatively to the closest beat before it
   * @param {float} time - time in seconds from an audio context
   * @returns {float} time since last beat
   */
  getOffset(time) {
    const offset = (time - this.startTime)%this.beatLength;
    return areEquals(this.beatLength, offset) ? 0 : offset;
  }

  /**
   * Gets the position of the given time in an absolute measure of n beats
   * @param {float} time
   * @param {number} measureSize - Number of beats in a measure
   * @returns {number} position (from 0 to n - 1)
   */
  getBeatPosition(time, measureSize) {
    const measureLength = this.beatLength * measureSize;
    const measurePosition = (time - this.startTime) % measureLength;
    if (areEquals(measureLength - measurePosition)) return 0;
    const position = Math.floor(measurePosition / this.beatLength);
    return !areEquals(this.beatLength, Math.abs(measurePosition - (position * this.beatLength))) ?
      position : (position + 1) % measureSize;
  }


  stop() {
    clearInterval(this.loopInterval);
  }

  /*
  * If the getter methods are called just on a beat, check if the next beat value is still valid
  * This is to avoid giving a next beat value that is actually in the past
  */
  _fixBeat() {
    let currentTime = this.context.currentTime - this.startTime;
    if (currentTime >= this.nextBeat || areEquals(this.nextBeat, currentTime)) {
      this.nextBeat += this.beatLength;
      this._schedule();
    }
  }
}

export default Metronome;
