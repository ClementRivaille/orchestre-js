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
        player.soundLoop = new SoundLoop(this.context, buffers[sound.name], this.eventEmitter, player.length, player.absolute, player.destination);
        this.players[sound.name] = player;
      }
    });
  }

  /** Prepare a single sound */
  addPlayer(name, url, length, absolute, destination) {
    return this.loader.load(name, url).then(buffer => {
      this.players[name] = {
        name,
        url,
        length,
        absolute,
        soundLoop: new SoundLoop(this.context, buffer, this.eventEmitter, length, absolute, destination)
      };
    });
  }

  /** Connect a player to an audio node */
  connect(name, destination) {
    this.players[name].soundLoop.connect(destination);
  }

  /** Disconnect a player from all its destination or one audio node */
  disconnect(name, destination) {
    this.players[name].soundLoop.disconnect(destination);
  }

  /**
  * Trigger a sound, according to its kind
  * @param name {string} player identifier
  * @param options {object} (optional)
  *     * fade (float): time constant for fade in or fade out
  *     * now (bool): if true, sound will start / stop immediately. Otherwise, it waits for next beat.
  *     * once (bool): play sound only once, then stop
  */
  trigger(name, options) {
    let player = this.players[name];
    if (!player) throw new Error(`Player ${name} does not exist`);
    options = options || {};


    if (!player.soundLoop.playing) {
      player.soundLoop.start(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), this.metronome, options.fade || 0, options.once);
    }
    else {
      player.soundLoop.stop(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), options.fade || 0);
    }

    // Return the state of the instrument
    return player.playing;
  }

  /**
  * Start a player
  * @param name {string} player identifier
  * @param options {object} (optional)
  *     * fade (float): time constant for fade in
  *     * now (bool): if true, sound will start immediately. Otherwise, it waits for next beat.
  *     * once (bool): play sound only once, then stop
  */
  play(name, options) {
    let player = this.players[name];
    if (!player) throw new Error(`play: player ${name} does not exist`);
    options = options || {};
    player.soundLoop.start(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), this.metronome, options.fade || 0, options.once);
  }

  /**
  * Stop a player
  * @param name {string} player identifier
  * @param options {object} (optional)
  *     * fade (float): time constant for fade out
  *     * now (bool): if true, sound will stop immediately. Otherwise, it waits for next beat.
  */
  stop(name, options) {
    let player = this.players[name];
    if (!player) throw new Error(`stop: player ${name} does not exist`);
    options = options || {};
    player.soundLoop.stop(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), options.fade || 0);
  }

  /** Check if a player is active */
  isPlaying(name) {
    return this.players[name].soundLoop.playing;
  }

  /** Schedule an action (play, stop, or trigger) for a player on an incoming beat
  * @param name {string} player identifier
  * @param beats {number} number of beat to wait before action
  * @param action {string} either 'play', 'stop' or 'trigger'
  * @param options {object} (optional)
  *     * fade (float): time constant for fade in or fade out
  *     * once (bool): play sound only once, then stop
  */
  schedule(name, beats, action, options) {
    const player = this.players[name];
    if (!player) throw new Error(`schedule: player ${name} does not exist`);
    if (beats <= 0) throw new Error(`schedule: beats must be a positive number`);
    options = options || {};

    action = action || 'trigger';
    const eventTime = this.metronome.getNextNthBeatTime(beats);
    if (action === 'play' || (action === 'trigger' && !player.soundLoop.playing)) {
      player.soundLoop.start(eventTime, this.metronome, options.fade || 0, options.once);
    }
    else if (action === 'stop' || (action === 'trigger' && player.soundLoop.playing)) {
      player.soundLoop.stop(eventTime, this.metronome, options.fade || 0);
    }
    else {
      throw new Error(`schedule: action ${action} is not recognized (must be within ['play', 'stop', 'trigger'])`)
    }
  }
}

export default Orchestre;
