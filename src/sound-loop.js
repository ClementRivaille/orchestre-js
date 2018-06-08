/**
* Sound loop that stays in sync with the beats
*/
class SoundLoop {
  constructor(context, buffer, eventEmitter, nbBeats, absolute, destination) {
    this.context = context;
    this.buffer = buffer;
    this.eventEmitter = eventEmitter;
    this.nbBeats = nbBeats;
    this.absolute = absolute;

    this.stopped = true;
    this.stopQueue = 0;

    this.beatSchedule = this.beatSchedule.bind(this);

    this.gainNode = context.createGain();
    this.gainNode.connect(destination || context.destination);
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
  start(startTime, metronome, fadeIn, once) {
    if (this.stopped) {
      this.startTime = startTime;
      this.stopped = once || false;
      // Absolute loop, start at nth beat
      if (this.absolute) {
        const offset = metronome.getOffset(startTime);
        const beatPos = metronome.getBeatPosition(startTime, this.nbBeats);

        this.loop(startTime, beatPos * metronome.beatLength + offset);
        this.nextMeasure = this.nbBeats - beatPos;
      }
      // Relative loop, starts at first beat
      else {
        this.loop(startTime, metronome.getOffset(startTime));
        this.nextMeasure = this.nbBeats;
      }

      // If called immediately, we must ensure the next loop
      if (startTime <= this.context.currentTime) {
        this.beatSchedule(metronome.getNextBeatTime());
      }
    }

    // Fading
    this.gainNode.gain.setTargetAtTime(1, startTime, fadeIn || 0);

    // Subscribe to beat events
    if (!this.subscribed && !once) {
      this.eventEmitter.subscribe('beat', this.beatSchedule);
      this.subscribed = true;
    }

    this.playing = !once;
  }

  beatSchedule(nextBeat) {
    // Decrease beats remaining, unless we're at the very first beat
    this.nextMeasure = nextBeat > this.startTime && Math.abs(nextBeat - this.startTime) > 0.0001 ? this.nextMeasure - 1 : this.nextMeasure;

    // Restart the loop
    if (this.nextMeasure <= 0 && !this.stopped) {
      this.loop(nextBeat);
      this.nextMeasure = this.nbBeats;
    }

    // Stop the sound when asked to
    if (this.stopTime && (nextBeat >= this.stopTime || Math.abs(nextBeat - this.stopTime) <= 0.0001)) {
      this.fadeOut(this.stopTime, this.fadeOutLength);
    }
  }

  fadeOut(stopTime, fadeOutLength) {
    this.gainNode.gain.setTargetAtTime(0, stopTime, fadeOutLength);
    this.playing = false;
    this.stopTime = 0;
    this.stopQueue += 1;

    setTimeout(() => {
      this.stopQueue -= 1;
      if (!this.playing && this.stopQueue <= 0) {
        this.source.stop(this.stopTime);
        this.stopped = true;
        this.eventEmitter.unsubscribe('beat', this.beatSchedule);
        this.subscribed = false;
      }
    }, (stopTime - this.context.currentTime) * 1000 + (fadeOutLength || 0) * 3000);
  }

  /** Schedule a stop */
  stop(stopTime, fadeOutLength) {
    fadeOutLength = fadeOutLength || 0;
    if (stopTime >= this.context.currentTime) {
      this.fadeOut(stopTime, fadeOutLength);
    }
    else {
      this.stopTime = stopTime;
      this.fadeOutLength = fadeOutLength;
    }
  }

  connect(destination) {
    this.gainNode.connect(destination);
  }

  disconnect(destination) {
    this.gainNode.disconnect(destination);
  }
}

export default SoundLoop;
