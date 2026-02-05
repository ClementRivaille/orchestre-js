import EventEmitter from './event-emitter';
import Metronome from './metronome';

/**
 * Sound loop that stays in sync with the beats
 */
class SoundLoop {
  private gainNode: GainNode;
  private nextMeasure: number = -1;
  public playing: boolean = false;
  private source: AudioBufferSourceNode | undefined;
  private startTime: number = 0;
  private stopQueue: number;
  private stopped: boolean = true;
  private subscribed: boolean = false;
  private disposedSources: AudioBufferSourceNode[] = [];

  constructor(
    private context: AudioContext,
    private metronome: Metronome,
    private buffer: AudioBuffer,
    private eventEmitter: EventEmitter,
    private nbBeats: number,
    private absolute: boolean,
    destination?: AudioNode,
  ) {
    this.stopped = true;
    this.stopQueue = 0;

    this._beatSchedule = this._beatSchedule.bind(this);

    this.gainNode = context.createGain();
    this.gainNode.connect(destination || context.destination);
    this.gainNode.gain.setValueAtTime(0, 0);
  }

  static from(
    soundLoop: SoundLoop,
    metronome: Metronome,
    eventEmitter: EventEmitter,
    destination?: AudioNode,
  ) {
    return new SoundLoop(
      soundLoop.context,
      metronome,
      soundLoop.buffer,
      eventEmitter,
      soundLoop.nbBeats,
      soundLoop.absolute,
      destination,
    );
  }

  /** Play the sound from the beginning */
  private _loop(startTime: number, offset = 0) {
    if (this.source) {
      // Keep playing and add to disposed sources list
      this.disposedSources.push(this.source);
    }
    // Create a new source node
    const source = this.context.createBufferSource();
    source.loop = false;
    source.buffer = this.buffer;
    source.connect(this.gainNode);
    source.start(startTime, offset);

    // Disconnect and remove the source once it stops
    source.addEventListener('ended', () => {
      source.disconnect(this.gainNode);
      const disposedIdx = this.disposedSources.indexOf(source);
      if (disposedIdx > -1) {
        this.disposedSources.splice(disposedIdx, 1);
      }
    });

    this.source = source;
  }

  /** Start the loop */
  start(startTime: number, fadeIn = 0, once = false) {
    if (this.stopped) {
      this.startTime = startTime;
      this.stopped = once || false;
      // Absolute loop, start at nth beat
      if (this.absolute) {
        const offset = this.metronome.getOffset(startTime);
        const beatPos = this.metronome.getBeatPosition(startTime, this.nbBeats);

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
  }

  private _beatSchedule(nextBeat: number) {
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
  }

  private _fadeOut(stopTime: number, length = 0) {
    this.gainNode.gain.setTargetAtTime(0, stopTime, length);
  }

  /** End loop */
  private _disable(keep = false) {
    if (this.source) {
      this.disposedSources.push(this.source);
    }
    if (!keep) {
      this.disposedSources.forEach((source) =>
        source.stop(this.context.currentTime),
      );
    }
    this.stopped = true;
    this.eventEmitter.unsubscribe('beat', this._beatSchedule);
    this.subscribed = false;
  }

  /** Schedule a stop */
  stop(stopTime: number, fadeOut = 0, keep = false) {
    this.playing = false;
    this.stopQueue += 1;

    if (fadeOut > 0) {
      this._fadeOut(stopTime, fadeOut);
    }

    // Cancel the next loop if already scheduled with keep
    if (keep && this.getBeatPosition(stopTime) === 0) {
      const timeBeforeBeat = stopTime - this.metronome.beatLength / 2;
      const timeToWait = Math.max(0, timeBeforeBeat - this.context.currentTime);
      setTimeout(() => {
        if (!this.playing && this.stopQueue <= 1) {
          this.source?.stop(stopTime);
        }
      }, timeToWait * 1000);
    }

    // Disable loop on the final beat
    let deltaStop = stopTime - this.context.currentTime;
    if (keep) {
      const remainingBeats = Math.max(0, (this.nextMeasure % this.nbBeats) - 1);
      const nbBeatsToWait = Math.ceil(deltaStop / this.metronome.beatLength);
      const extraLoops = Math.floor(nbBeatsToWait / this.nbBeats);
      deltaStop =
        (remainingBeats + this.nbBeats * extraLoops) *
        this.metronome.beatLength;
    }
    setTimeout(
      () => {
        this.stopQueue -= 1;
        if (!this.playing && this.stopQueue <= 0 && !this.stopped) {
          this._disable(keep);
        }
      },
      deltaStop * 1000 + fadeOut * 5000,
    );
  }

  connect(destination: AudioNode) {
    this.gainNode.connect(destination);
  }

  disconnect(destination: AudioNode) {
    this.gainNode.disconnect(destination);
  }

  /**
   * Return the beat position in the loop relatively to when it started
   */
  private getBeatPosition(time: number) {
    const absolutePosition = this.metronome.getBeatPosition(time, this.nbBeats);
    if (this.absolute) return absolutePosition;

    const offset = this.metronome.getBeatPosition(this.startTime, this.nbBeats);
    return (this.nbBeats + absolutePosition - offset) % this.nbBeats;
  }
}

export default SoundLoop;
