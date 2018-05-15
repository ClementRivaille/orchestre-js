/**
* Sound loop that stays in sync with the beats
*/
class SoundLoop {
  constructor(context, buffer, eventEmitter, nbBeats, relative, fading) {
    this.context = context;
    this.buffer = buffer;
    this.eventEmitter = eventEmitter;
    this.nbBeats = nbBeats;
    this.relative = relative;
    this.fading = this.fading || 0;
    this.stopped = true;

    this.beatSchedule = this.beatSchedule.bind(this);

    this.gainNode = context.createGain();
    this.gainNode.connect(context.destination);
    this.gainNode.gain.setValueAtTime(0, 0);
  }

  /** Play the sound from the beginning */
  loop(startTime, offset) {
    offset = offset !== undefined ? offset : 0;
    if (this.source && this.source.playing) {
      this.source.stop(startTime);
    }
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    this.source.start(startTime, offset);
  }

  /** Start the loop */
  start(startTime) {
    // Absolute loop, start with offset
    if (!this.relative) {
      if (!this.playing) {
        if (this.stopped) {
          this.loop(this.context.currentTime, this.metronome.getOffset(this.nbBeats));
          if (this.metronome.getStartMeasure(this.nbBeats) > this.context.currentTime) {
            this.loop(this.metronome.getStartMeasure(this.nbBeats), 0);
          }
          this.nextMeasure = this.nbBeats - Math.floor(this.metronome.getOffest(this.nbBeats) / (this.nbBeats / metronom.bpm);
        }
      }
    }
    else {
      this.startTime = startTime;
      this.loop(startTime);
      this.nextMeasure = this.nbBeats;
    }

    
    // Fading
    this.gainNode.gain.setTargetAtTime(1, this.context.currentTime, this.fading);

    // Subscribe to beat events
    if (!this.subscribed) {
      this.subId = this.eventEmitter.subscribe('beat', this.beatSchedule);
      this.subscribed = true;
    }
    this.playing = true;
    this.stopped= false;
  }

  beatSchedule(nextBeat) {
    // Decrease beats remaining, unless we're at the very first beat
    this.nextMeasure = nextBeat > this.startTime && Math.abs(nextBeat - this.startTime) > 0.0001 ? this.nextMeasure - 1 : this.nextMeasure;

    // Restart the loop
    if (this.nextMeasure <= 0 && this.playing) {
      this.loop(nextBeat);
      this.nextMeasure = this.nbBeats;
    }

    // Stop the sound when asked to
    if (this.stopTime && (nextBeat >= this.stopTime || Math.abs(nextBeat - this.stopTime) <= 0.0001)) {
      this.source.stop(this.stopTime);
      this.playing = false;
      this.eventEmitter.unsubscribe('beat', this.subId);
      this.stopTime = 0;
    }
  }

  /** Schedule a stop */
  stop(stopTime) {
    this.stopTime = stopTime;
  }
}

export default SoundLoop;
