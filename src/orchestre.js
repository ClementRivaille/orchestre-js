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
  addPlayers(players) {
    // Load sounds files
    return this.loader.loadAll(players).then(buffers => {
      // Store sounds into players
      for (const sound of players) {
        if (!buffers[sound.name]) return;

        const player = Object.assign({}, sound);
        player.soundLoop = new SoundLoop(this.context, buffers[sound.name], this.eventEmitter, player.length, player.absolute);
        this.players[sound.name] = player;
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

  play(name, fade, now) {
    let player = this.players[name];
    if (!player) throw new Error(`play: player ${name} does not exist`);
    player.soundLoop.start(now ? this.context.currentTime : this.metronome.getNextBeatTime(), this.metronome, fade || 0);
    player.isPlaying = true;
  }

  stop(name, fade, now) {
    let player = this.players[name];
    if (!player) throw new Error(`stop: player ${name} does not exist`);
    player.soundLoop.stop(now ? this.context.currentTime : this.metronome.getNextBeatTime(), fade || 0);
    player.isPlaying = false;
  }

  isPlaying(name) {
    return this.players[name].playing;
  }

  schedule(name, beats, action, fade) {
    const player = this.players[name];
    if (!player) throw new Error(`schedule: player ${name} does not exist`);
    if (beats <= 0) throw new Error(`schedule: beats must be a positive number`);

    action = action || 'trigger';
    const eventTime = this.metronome.getNextNthBeatTime(beats);
    if (action === 'play' || (action === 'trigger' && !player.isPlaying)) {
      player.soundLoop.start(eventTime, this.metronome, fade || 0);
      player.isPlaying = true;
    }
    else if (action === 'stop' || (action === 'trigger' && player.isPlaying)) {
      player.soundLoop.stop(eventTime, this.metronome, fade || 0);
      player.isPlaying = false;
    }
    else {
      throw new Error(`schedule: action ${action} is not recognized (must be within ['play', 'stop', 'trigger'])`)
    }
  }
}

export default Orchestre;
