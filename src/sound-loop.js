/**
* Sound loop that stays in sync with the beats
*/
class SoundLoop {
  constructor(context, buffer, metronome, eventEmitter, nbBeats, relative, fading) {
    this.context = context;
    this.buffer = buffer;
    this.metronome = metronome;
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
      if (!this.playing && this.stopped) {
        this.loop(this.context.currentTime, this.metronome.getOffset(this.nbBeats));
        this.nextMeasure = this.nbBeats - Math.floor(this.metronome.getOffest(this.nbBeats) / (this.nbBeats / this.metronome.bpm);
        if (this.nextMeasure <= 0) {
          this.loop(this.metronome.getNextBeatTime(), 0);
          this.nextMeasure = this.nbBeats;
        }
      }
    }
    // Relative loop, starts at startTime
    else if (this.stopped) {
      this.startTime = startTime;
      this.loop(startTime);
      this.nextMeasure = this.nbBeats;
    }

    
    // Fading
    this.gainNode.gain.setTargetAtTime(1, startTime, this.fading);

    // Subscribe to beat events
    if (!this.subscribed) {
      this.subId = this.eventEmitter.subscribe('beat', this.beatSchedule);
      this.subscribed = true;
    }
    this.playing = true;
    this.stopped = false;
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
      this.fadeOut(this.stopTime);
    }
  }

  fadeOut(stopTime) {
    this.gainNode.gain.setTargetAtTime(0, stopTime, this.fading);
    this.playing = false;
    this.stopTime = 0;

    setTimeout(() => {
      if (!this.playing && this.gainNode.gain.value < 0.03)
      this.source.stop(this.stopTime);
      this.stopped = true;
      this.eventEmitter.unsubscribe('beat', this.subId);
      this.subscribed = false;
    }, (stopTime - this.context.currentTime) * 1000 + this.fading * 3000);
  }

  /** Schedule a stop */
  stop(stopTime) {
    if (stopTime >= this.context.currentTime) {
      this.fadeOut();
    }
    else {
      this.stopTime = stopTime;
    }
  }
}

export default SoundLoop;
