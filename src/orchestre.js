import BufferLoader from './buffer-loader';
import SoundLoop from './sound-loop';
import Metronome from './metronome';
import EventEmitter from './event-emitter';

/**
* Manage sounds and activate them as players
*/
class Orchestre {
  constructor(bpm, context) {
    this.players = {};
    this.context = context || new (window.AudioContext || window.webkitAudioContext)();
    this.eventEmitter = new EventEmitter();
    this.metronome = new Metronome(bpm, this.context, this.eventEmitter);
    this.loader = new BufferLoader(this.context);
  }

  /** Start metronome */
  start() {
    this.context.resume();
    this.metronome.start(this.context.currentTime + 0.1);
  }

  /**
  * Prepare sounds
  */
  addPlayers(sounds) {
    // Load sounds files
    return this.loader.loadAll(sounds).then(buffers => {
      // Store sounds into players
      for (let key in buffers) {
        if (!buffers.hasOwnProperty(key)) return;

        const player = Object.assign({}, sounds[key]);
        player.soundLoop = new SoundLoop(this.context, buffers[key], this.eventEmitter, player.length, player.absolute);
        this.players[key] = player;
      }
    });
  }

  /** Prepare a single sound */
  addPlayer(name, url, length, absolute) {
    return this.loader.load(name, url).then(buffer => {
      this.players[name] = {
        name,
        url,
        length,
        absolute,
        soundLoop: new SoundLoop(this.context, buffer, this.eventEmitter, length, absolute)
      };
    });
  }

  /**
  * Trigger a sound, according to its kind
  */
  trigger(name, fade, now) {
    let player = this.players[name];
    if (!player) throw new Error(`Player ${name} does not exist`);

    if (!player.playing) {
      player.soundLoop.start(now ? this.context.currentTime : this.metronome.getNextBeatTime(), this.metronome, fade || 0);
    }
    else {
      player.soundLoop.stop(now ? this.context.currentTime : this.metronome.getNextBeatTime(), fade || 0);
    }
    player.playing = !player.playing;

    // Return the state of the instrument
    return player.playing;
  }

  startPlayer(name, fade, now) {
    let player = this.players[name];
    if (!player) throw new Error(`Player ${name} does not exist`);
    player.soundLoop.start(now ? this.context.currentTime : this.metronome.getNextBeatTime(), this.metronome, fade || 0);
  }

  stopPlayer(name, fade, now) {
    let player = this.players[name];
    if (!player) throw new Error(`Player ${name} does not exist`);
    player.soundLoop.stop(now ? this.context.currentTime : this.metronome.getNextBeatTime(), fade || 0);
  }

  isPlaying(name) {
    return this.players[name].playing;
  }
}

export default Orchestre;
