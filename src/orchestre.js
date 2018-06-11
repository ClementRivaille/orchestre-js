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

    this.subscribers = [];
    this._updateEvents = this._updateEvents.bind(this);

    this.started = false;
  }

  /**
   * At each beat, call eventual subscribers
   */
  _updateEvents() {
    if (this.subscribers.length > 0) {
      const toRemove = [];
      for (const sub of this.subscribers) {
        // Decrease the number of beat to wait
        sub.wait -= 1;
        if (sub.wait <= 0) {
          // Call subscriber function
          try {sub.callback();}
          catch(err) {throw new(err);}
          finally {
            if (sub.interval)
              // Repeat if interval
              sub.wait = sub.length;
            else
              toRemove.push(this.subscribers.indexOf(sub));
          }
        }
      }
      // Remove called subscribers
      for (let i of toRemove) {
        this.subscribers.splice(i, 1);
      }
    }
  }

  /** Start metronome */
  start() {
    if (this.started) throw new Error('Orchestre is already started');
    this.context.resume();
    this.metronome.start(this.context.currentTime + 0.1);

    this.eventEmitter.subscribe('beat', this._updateEvents);
    this.started = true;
  }

  /**
  * Immediately stop all the instruments, then stop the metronome
  */
  fullStop() {
    if (!this.started) throw new Error('Orchestre has not been started');
    for (const player in this.players) {
      if (this.players.hasOwnProperty(player))
        this.players[player].soundLoop.stop(this.context.currentTime);
    }
    this.eventEmitter.unsubscribe('beat', this._updateEvents);
    this.metronome.stop();
    this.started = false;
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
  addPlayer(name, url, length, absolute=false, destination) {
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
  trigger(name, options={}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    let player = this.players[name];
    if (!player) throw new Error(`Player ${name} does not exist`);


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
  play(name, options={}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    let player = this.players[name];
    if (!player) throw new Error(`play: player ${name} does not exist`);
    player.soundLoop.start(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), this.metronome, options.fade || 0, options.once);
  }

  /**
  * Stop a player
  * @param name {string} player identifier
  * @param options {object} (optional)
  *     * fade (float): time constant for fade out
  *     * now (bool): if true, sound will stop immediately. Otherwise, it waits for next beat.
  */
  stop(name, options={}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    let player = this.players[name];
    if (!player) throw new Error(`stop: player ${name} does not exist`);
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
  schedule(name, beats, action='trigger', options={}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    const player = this.players[name];
    if (!player) throw new Error(`schedule: player ${name} does not exist`);
    if (beats <= 0) throw new Error(`schedule: beats must be a positive number`);

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

  /**
  * Wait a number of beats before calling a function
  * @param callback {function}
  * @param nbBeats {number} (optional) number of beats to wait [default=1]
  * @param options {objects}
  *   * absolute (bool) Callback will be called on the next absolute Nth beat (like next measure)
  *   * interval (bool) Callback will be called every n beats
  *   * offset (number) Used with absolute to set a position in the measure
  *
  */
  onBeat(callback, beats=1, options={}) {
    this.subscribers.push({
      callback,
      length: beats,
      interval: options.interval,
      wait: beats -
        (options.absolute ? this.metronome.getBeatPosition(this.context.currentTime, beats) : 0) +
        (options.offset || 0)
    });
  }

  /**
  * Remove an existing interval
  * @return true if found
  */
  removeInterval(callback) {
    const subIndex = this.subscribers.findIndex((sub) => sub.callback === callback);
    if (subIndex !== -1) {
      this.subscribers.splice(subIndex, 1);
    }
    return subIndex !== -1;
  }
}

export default Orchestre;
