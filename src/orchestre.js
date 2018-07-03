import BufferLoader from './buffer-loader';
import SoundLoop from './sound-loop';
import Metronome from './metronome';
import EventEmitter from './event-emitter';

/**
* Manage sounds and activate them as players
* @param {number} bpm - Beats per minute
* @param {AudioContext} context
* @property {AudioContext} context - Audio context
* @property {Metronome} metronome
* @property {boolean} started
* @property {boolean} paused - True when orchestre has been suspended
*/
class Orchestre {
  constructor(bpm, context) {
    this.players = {};
    this.context = context || new (window.AudioContext || window.webkitAudioContext)();
    this.eventEmitter = new EventEmitter();
    this.metronome = new Metronome(bpm, this.context, this.eventEmitter);
    this.loader = new BufferLoader(this.context);

    this.subscribers = [];
    this.subId = -1;
    this._updateEvents = this._updateEvents.bind(this);

    this.started = false;
    this.paused = false;
  }

  /*
   * At each beat, call eventual subscribers
   * @param {float} time - Time in seconds of the beat
   */
  _updateEvents(time) {
    if (this.subscribers.length > 0) {
      const toRemove = [];
      for (const sub of this.subscribers) {
        // Decrease the number of beat to wait
        sub.wait -= 1;
        if (sub.wait <= 0) {
          // Call subscriber function
          try {sub.callback(time);}
          catch(err) {throw new(err);}
          finally {
            if (sub.repeat)
              // Repeat
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

  /**
   * Start metronome
   * @param {string[]} [players=[]] - names of players to start immediately
   */
  start(players=[]) {
    if (this.started) throw new Error('Orchestre is already started');
    this.context.resume();
    this.metronome.start(this.context.currentTime + 0.1);

    this.eventEmitter.subscribe('beat', this._updateEvents);
    this.started = true;
    this.paused = false;

    for (const player of players) {
      this.play(player, {now: true});
    }
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
    this.paused = false;
  }


  /**
  * Prepare sounds
  * @param {object[]} players - Players configuration
  * @param {string} players[].name - Player's identifier
  * @param {string} players[].url - URL of the sound file
  * @param {number} players[].length - Number of beats that the sound contains
  * @param {boolean} [players[].absolute=false] - Indicates that the player is aligned absolutely in the song
  * @param {AudioNode} [players[].destination] - Audio node to connect the player to
  * @returns {Promise} Promise that resolves once all player has been loaded
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

  /**
   * Prepare a single sound
   * @param {string} name - Player's identifier
   * @param {string} url - URL of the sound file
   * @param {number} length - Number of beats that the sound contains
   * @param {boolean} [absolute=false] - Indicates that the player is aligned absolutely in the song
   * @param {AudioNode} [destination] - Audio node to connect the player to
   * @returns {Promise} Promise that resolves once the player is loaded
   */
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

  /** Connect a player to an audio node
   * @param {string} name
   * @param {AudioNode} destination
   */
  connect(name, destination) {
    this.players[name].soundLoop.connect(destination);
  }

  /** Disconnect a player from all its destination or one audio node
   * @param {string} name
   * @param {AudioNode} destination
   */
  disconnect(name, destination) {
    this.players[name].soundLoop.disconnect(destination);
  }

  /**
   * Switch a sound state between play and stop
   * @param {string} name - Player identifier
   * @param {object} [options={}]
   * @param {float} [options.fade] - Time constant for fade in or fade out
   * @param {boolean} [options.now] - If true, sound will start / stop immediately. Otherwise, it waits for next beat.
   * @param {boolean} [options.once] - Play sound only once, then stop
   */
  switch(name, options={}) {
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
  * @param {string} name - Player identifier
  * @param {object} [options={}]
  * @param {float} [options.fade] - Time constant for fade in
  * @param {boolean} [options.now] - If true, sound will start immediately. Otherwise, it waits for next beat.
  * @param {boolean} [options.once] - Play sound only once, then stop
  */
  play(name, options={}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    let player = this.players[name];
    if (!player) throw new Error(`play: player ${name} does not exist`);
    player.soundLoop.start(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), this.metronome, options.fade || 0, options.once);
  }

  /**
  * Stop a player
  * @param {string} name - LAYER identifier
  * @param {object} [options={}]
  * @param {float} [options.fade] - Time constant for fade out
  * @param {boolean} [options.now] - If true, sound will stop immediately. Otherwise, it waits for next beat.
  */
  stop(name, options={}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    let player = this.players[name];
    if (!player) throw new Error(`stop: player ${name} does not exist`);
    player.soundLoop.stop(options.now ? this.context.currentTime : this.metronome.getNextBeatTime(), options.fade || 0);
  }

  /** Check if a player is active
   * @param {string} name
   * @returns {boolean}
   */
  isPlaying(name) {
    return this.players[name].soundLoop.playing;
  }

  /**
   * Schedule an action (play, stop, or switch) for a player on an incoming beat
   * @param {string} name - Player identifier
   * @param {number} beats - Number of beat to wait before action
   * @param {string} [action='switch'] - Either 'play', 'stop' or 'switch'
   * @param {object} [options={}]
   * @param {float} [options.fade] - Time constant for fade in or fade out
   * @param {boolean} [options.once] - Play sound only once, then stop
   * @param {boolean} [options.absolute] - Action will be performed on the next absolute nth beat (next measure of n beat)
   * @param {number} [options.offset] - Use with absolute to set a position in the measure
   */
  schedule(name, beats, action='switch', options={}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    const player = this.players[name];
    if (!player) throw new Error(`schedule: player ${name} does not exist`);
    if (beats <= 0) throw new Error(`schedule: beats must be a positive number`);

    const beatsToWait = beats -
      (options.absolute ? this.metronome.getBeatPosition(this.context.currentTime, beats) : 0) +
      (options.offset || 0);
    const eventTime = this.metronome.getNextNthBeatTime(beatsToWait);
    if (action === 'play' || (action === 'switch' && !player.soundLoop.playing)) {
      player.soundLoop.start(eventTime, this.metronome, options.fade || 0, options.once);
    }
    else if (action === 'stop' || (action === 'switch' && player.soundLoop.playing)) {
      player.soundLoop.stop(eventTime, this.metronome, options.fade || 0);
    }
    else {
      throw new Error(`schedule: action ${action} is not recognized (must be within ['play', 'stop', 'switch'])`)
    }
  }

  /**
   * Wait a number of beats before calling a function
   * @param {Orchestre~beatCallback} callback - Function to call
   * @param {number} [beats=1] - number of beats to wait
   * @param {objects} [options={}]
   * @param {boolean} [options.repeat] - Callback will be called every n beats
   * @param {boolean} [options.absolute] - Callback will be called on the next absolute nth beat (next measure of n beats)
   * @param {number} [options.offset] - Use with absolute to set a position in the measure
   * @returns {number} Listener's id
   */
  onBeat(callback, beats=1, options={}) {
    this.subId++;
    this.subscribers.push({
      id: this.subId,
      callback,
      length: beats,
      repeat: options.repeat,
      wait: beats -
        (options.absolute ? this.metronome.getBeatPosition(this.context.currentTime, beats) : 0) +
        (options.offset || 0)
    });

    // Return id
    return this.subId;
  }

  /**
   * Remove an existing listener
   * @param {number} id - Listener's id
   * @returns {boolean} true if found
   */
  removeListener(id) {
    const subIndex = this.subscribers.findIndex((sub) => sub.id === id);
    if (subIndex !== -1) {
      this.subscribers.splice(subIndex, 1);
    }
    return subIndex !== -1;
  }

  /**
   * Suspend metronome and players
   * @return {Promise} resolves with void
   */
  suspend() {
    this.paused = true;
    return this.context.suspend();
  }
  /**
   * Resume metronome and players if they have been suspended
   * @return {Promise} resolves with void
   */
  resume() {
    this.paused = false;
    return this.context.resume();
  }
}

/**
* Callback function called on beat event
* @callback Orchestre~beatCallback
* @param {float} nextBeat - Time of the next coming beat in seconds
*/

export default Orchestre;
