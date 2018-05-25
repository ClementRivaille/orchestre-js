function areEqual(a, b) {
  return Math.abs(a - b) < 0.00001;
}

/**
* Count beats, and give the time of next beat occurence
*/
class Metronome {
  constructor(bpm, context, eventEmitter) {
    this.context = context;
    this.eventEmitter = eventEmitter;

    this.beatLength = 60 / bpm;
  }

  start(startTime) {
    this.startTime = startTime;
    this.nextBeat = this.beatLength;

    // Emit the first beat
    this.schedule();
    // Start the loop
    this.loopInterval = setInterval(this.clock, 50);
  }

  /**
  * Loop checking time each frame
  * The metronom is always one beat ahead, and calculate the time of the upcoming beat
  */
  clock() {
    // Get current time (relative to start time)
    let currentTime = this.context.currentTime - this.startTime;
    // When next beat is reached, update its value
    if (currentTime >= this.nextBeat || areEquals(currentTime, this.nextBeat)) {
      this.nextBeat += this.beatLength;
      this.schedule();
    }
  }

  /** Emit beat event, and give the global time of next beat */
  schedule() {
    this.eventEmitter.emit('beat', this.startTime + this.nextBeat);
  }

  /** Public method use to obtain global next beat time */
  getNextBeatTime() {
    this.fixBeat();
    return this.startTime + this.nextBeat;
  }

  /**
   * Public method use to obtain global nth next beat time
   * @param nbBeats {int} nth beat, 1 being the next
   */
  getNextNthBeatTime(nbBeats) {
    this.fixBeat();
    return this.startTime + this.nextBeat + (nbBeats - 1) * this.beatLength;
  }

  getOffset(time) {
    return (time - this.startTime)%this.beatLength;
  }

  getBeatPosition(time, measureSize) {
    const measureLength = this.beatLength * measureSize;
    const measurePosition = (time - this.startTime) % measureLength;
    return Math.floor(measureLength / measurePosition);
  }


  stop() {
    clearInterval(this.loopInterval);
  }

  /**
  * If the getter methods are called just on a beat, check if the next beat value is still valid
  * This is to avoid giving a next beat value that is actually in the past
  */
  fixBeat() {
    let currentTime = this.context.currentTime - this.startTime;
    if (currentTime >= this.nextBeat || Math.abs(this.nextBeat - currentTime) < 0.00001) {
      this.nextBeat += this.beatLength;
      this.schedule();
    }
  }
}

export default Metronom;
