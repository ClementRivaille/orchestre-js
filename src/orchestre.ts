import BufferLoader from './buffer-loader';
import EventEmitter from './event-emitter';
import Metronome from './metronome';
import Player, { PlayerConfiguration, PlayerPosition } from './player';
import SoundLoop from './sound-loop';

interface Subscription {
  id: number;
  callback: (nextBeat: number) => void;
  length: number;
  repeat: boolean;
  wait: number;
}

export interface PlayerOptions {
  fade?: number;
  now?: boolean;
  once?: boolean;
  keep?: boolean;
}

export interface EventOptions {
  absolute?: boolean;
  offset?: number;
}

export type PlayerEventOptions = EventOptions & Omit<PlayerOptions, 'now'>;

/**
 * Positioning of a player's track in the song
 * @typedef {"absolute"|"relative"} PlayerPosition
 */

/**
 * Manage sounds and activate them as players
 * @param {number} bpm - Beats per minute
 * @param {AudioContext} context
 * @property {AudioContext} context - Audio context
 * @property {GainNode} master - Gain connected to context's destination
 * @property {Metronome} metronome
 * @property {boolean} started
 * @property {boolean} paused - True when orchestre has been suspended
 */
class Orchestre {
  private context: AudioContext;
  private eventEmitter: EventEmitter;
  private loader: BufferLoader;
  public master: GainNode;
  public metronome: Metronome;
  public paused: boolean;
  private players: { [key: string]: Player };
  public started: boolean;
  private subId: number;
  private subscribers: Record<number, Subscription> = {};

  constructor(
    private bpm: number,
    context?: AudioContext,
  ) {
    this.players = {};
    this.context =
      context ||
      new (window.AudioContext || (window as any).webkitAudioContext)();
    this.eventEmitter = new EventEmitter();
    this.metronome = new Metronome(this.bpm, this.context, this.eventEmitter);
    this.loader = new BufferLoader(this.context);

    // Master volume
    this.master = this.context.createGain();
    this.master.connect(this.context.destination);
    this.master.gain.setValueAtTime(1, 0);

    // Events
    this.subscribers = {};
    this.subId = -1;
    this._updateEvents = this._updateEvents.bind(this);

    this.started = false;
    this.paused = false;
  }

  /**
   * Create a new Orchestre instance with the same players and connected to the same output
   * @param {Orcheste} orchestre
   */
  static from(orchestre: Orchestre): Orchestre {
    const duplicate = new Orchestre(orchestre.bpm, orchestre.context);

    Object.entries(orchestre.players).forEach(([name, player]) => {
      duplicate.players[name] = {
        ...player,
        soundLoop: SoundLoop.from(
          player.soundLoop,
          duplicate.metronome,
          duplicate.eventEmitter,
          player.destination,
        ),
        playing: false,
      };
    });

    return duplicate;
  }

  /*
   * At each beat, call eventual subscribers
   * @param {float} time - Time in seconds of the beat
   */
  private _updateEvents(time: number) {
    if (Object.keys(this.subscribers).length > 0) {
      for (const sub of Object.values(this.subscribers)) {
        // Decrease the number of beat to wait
        sub.wait -= 1;
        if (sub.wait <= 0) {
          // Call subscriber function
          try {
            sub.callback(time);
          } catch (err) {
            throw err;
          } finally {
            if (sub.repeat)
              // Repeat
              sub.wait = sub.length;
            else delete this.subscribers[sub.id];
          }
        }
      }
    }
  }

  /**
   * Start metronome
   * @param {string[]} [players=[]] - names of players to start immediately
   */
  start(players: string[] = []) {
    if (this.started) throw new Error('Orchestre is already started');
    this.context.resume();
    this.metronome.start(this.context.currentTime);

    this.eventEmitter.subscribe('beat', this._updateEvents);
    this.started = true;
    this.paused = false;

    for (const player of players) {
      this.play(player, { now: true });
    }
  }

  /**
   * Immediately stop all the instruments, then stop the metronome
   */
  fullStop() {
    if (!this.started) throw new Error('Orchestre has not been started');
    for (const player in this.players) {
      if (this.players.hasOwnProperty(player))
        this.players[player].soundLoop.forceStop();
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
   * @param {number} players[].length - Number of beats that the track contains
   * @param {PlayerPosition} [players[].position="absolute"] -Track positioning, "relative" or "absolute"
   * @param {AudioNode} [players[].destination] - Audio node to connect the player to
   * @returns {Promise} Promise that resolves once all player has been loaded
   */
  async addPlayers(players: PlayerConfiguration[]): Promise<void> {
    // Load sounds files
    const buffers = await this.loader.loadAll(players);
    // Store sounds into players
    for (const sound of players) {
      if (!buffers[sound.name]) return;
      const position = sound.position ?? 'absolute';

      const player: Player = {
        ...sound,
        position,
        soundLoop: new SoundLoop(
          this.context,
          this.metronome,
          buffers[sound.name],
          this.eventEmitter,
          sound.length,
          position === 'absolute',
          sound.destination || this.master,
        ),
        playing: false,
      };
      this.players[sound.name] = player;
    }
  }

  /**
   * Prepare a single sound
   * @param {string} name - Player's identifier
   * @param {string} url - URL of the sound file
   * @param {number} length - Number of beats that the track contains
   * @param {PlayerPosition} [position="absolute"] - Track positioning, "relative" or "absolute"
   * @param {AudioNode} [destination] - Audio node to connect the player to
   * @returns {Promise} Promise that resolves once the player is loaded
   */
  addPlayer(
    name: string,
    url: string,
    length: number,
    position: PlayerPosition = 'absolute',
    destination?: AudioNode,
  ): Promise<void> {
    return this.loader.load(name, url).then((buffer) => {
      this.players[name] = {
        name,
        url,
        length,
        position,
        destination,
        soundLoop: new SoundLoop(
          this.context,
          this.metronome,
          buffer,
          this.eventEmitter,
          length,
          position === 'absolute',
          destination || this.master,
        ),
        playing: false,
      };
    });
  }

  /** Connect a player to an audio node
   * @param {string} name
   * @param {AudioNode} destination
   */
  connect(name: string, destination: AudioNode) {
    this.players[name].soundLoop.connect(destination);
  }

  /** Disconnect a player from all its destination or one audio node
   * @param {string} name
   * @param {AudioNode} destination
   */
  disconnect(name: string, destination: AudioNode) {
    this.players[name].soundLoop.disconnect(destination);
  }

  /**
   * Toggle a sound state between play and stop
   * @param {string} name - Player identifier
   * @param {object} [options={}]
   * @param {float} [options.fade] - Time constant for fade in or fade out
   * @param {boolean} [options.now] - If true, sound will start / stop immediately. Otherwise, it waits for next beat.
   * @param {boolean} [options.once] - Play sound only once, then stop
   * @param {boolean} [options.keep] - On stop, keep track playing until its end
   */
  toggle(name: string, options: PlayerOptions = {}): boolean {
    if (!this.started) throw new Error('Orchestre has not been started');
    let player = this.players[name];
    if (!player) throw new Error(`Player ${name} does not exist`);

    if (!player.soundLoop.playing) {
      player.soundLoop.start(
        options.now
          ? this.context.currentTime
          : this.metronome.getNextBeatTime(),
        options.fade || 0,
        options.once,
      );
    } else {
      player.soundLoop.stop(
        options.now
          ? this.context.currentTime
          : this.metronome.getNextBeatTime(),
        options.fade || 0,
        options.keep,
      );
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
  play(name: string, options: PlayerOptions = {}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    let player = this.players[name];
    if (!player) throw new Error(`play: player ${name} does not exist`);
    player.soundLoop.start(
      options.now ? this.context.currentTime : this.metronome.getNextBeatTime(),
      options.fade || 0,
      options.once,
    );
  }

  /**
   * Stop a player
   * @param {string} name - LAYER identifier
   * @param {object} [options={}]
   * @param {float} [options.fade] - Time constant for fade out
   * @param {boolean} [options.now] - If true, sound will stop immediately. Otherwise, it waits for next beat.
   * @param {boolean} [options.keep] - Keep track playing until its end
   */
  stop(name: string, options: PlayerOptions = {}) {
    if (!this.started) throw new Error('Orchestre has not been started');
    let player = this.players[name];
    if (!player) throw new Error(`stop: player ${name} does not exist`);
    player.soundLoop.stop(
      options.now ? this.context.currentTime : this.metronome.getNextBeatTime(),
      options.fade || 0,
      options.keep,
    );
  }

  /** Check if a player is active
   * @param {string} name
   * @returns {boolean}
   */
  isPlaying(name: string): boolean {
    return this.players[name].soundLoop.playing;
  }

  /**
   * Schedule an action (play, stop, or toggle) for a player on an incoming beat
   * @param {string} name - Player identifier
   * @param {number} beats - Number of beat to wait before action
   * @param {string} [action='toggle'] - Either 'play', 'stop' or 'toggle'
   * @param {object} [options={}]
   * @param {float} [options.fade] - Time constant for fade in or fade out
   * @param {boolean} [options.keep] - On stop, keep track playing until its end
   * @param {boolean} [options.once] - Play sound only once, then stop
   * @param {boolean} [options.absolute] - Action will be performed on the next absolute nth beat (next bar of n beat)
   * @param {number} [options.offset] - Use with absolute to set a position in the bar
   */
  schedule(
    name: string,
    beats: number,
    action: 'play' | 'stop' | 'toggle' = 'toggle',
    options: PlayerEventOptions = {},
  ) {
    if (!this.started) throw new Error('Orchestre has not been started');
    const player = this.players[name];
    if (!player) throw new Error(`schedule: player ${name} does not exist`);
    if (beats <= 0)
      throw new Error(`schedule: beats must be a positive number`);

    const beatsToWait =
      beats -
      (options.absolute
        ? this.metronome.getBeatPosition(this.context.currentTime, beats)
        : 0) +
      (options.offset || 0);
    const eventTime = this.metronome.getNextNthBeatTime(beatsToWait);
    if (
      action === 'play' ||
      (action === 'toggle' && !player.soundLoop.playing)
    ) {
      player.soundLoop.start(eventTime, options.fade || 0, options.once);
    } else if (
      action === 'stop' ||
      (action === 'toggle' && player.soundLoop.playing)
    ) {
      player.soundLoop.stop(eventTime, options.fade || 0, options.keep);
    } else {
      throw new Error(
        `schedule: action ${action} is not recognized (must be within ['play', 'stop', 'toggle'])`,
      );
    }
  }

  /**
   * Wait for a number of beats
   * @param {number} [beats=1] - number of beats to wait
   * @param {objects} [options={}]
   * @param {boolean} [options.absolute] - Callback will be called on the next absolute nth beat (next bar of n beats)
   * @param {number} [options.offset] - Use with absolute to set a position in the bar
   * @returns {Promise<number>} Resolves on the scheduled beat with its position in seconds
   */
  wait(beats = 1, options: EventOptions = {}): Promise<number> {
    this.subId++;
    return new Promise((resolve) => {
      this.subscribers[this.subId] = {
        id: this.subId,
        callback: resolve,
        length: beats,
        repeat: false,
        wait:
          beats -
          (options.absolute
            ? this.metronome.getBeatPosition(this.context.currentTime, beats)
            : 0) +
          (options.offset || 0),
      };
    });
  }

  /**
   * Call a function every n beats
   * @param {Orchestre~beatCallback} callback - Function to call
   * @param {number} [beats=1] - number of beats to wait
   * @param {objects} [options={}]
   * @param {boolean} [options.absolute] - Callback will be called on absolute nth beat (bar of n beats)
   * @param {number} [options.offset] - Use with absolute to set a position in the bar
   * @returns {number} Listener's id
   */
  addListener(
    callback: (beat: number) => void,
    beats = 1,
    options: EventOptions = {},
  ): number {
    this.subId++;
    this.subscribers[this.subId] = {
      id: this.subId,
      callback,
      length: beats,
      repeat: true,
      wait:
        beats -
        (options.absolute
          ? this.metronome.getBeatPosition(this.context.currentTime, beats)
          : 0) +
        (options.offset || 0),
    };
    return this.subId;
  }

  /**
   * Remove an existing listener
   * @param {number} id - Listener's id
   * @returns {boolean} true if found
   */
  removeListener(id: number): boolean {
    const hasIndex = this.subscribers.hasOwnProperty(id);
    if (hasIndex) {
      delete this.subscribers[id];
    }
    return hasIndex;
  }

  /**
   * Suspend metronome and players
   * @return {Promise} resolves with void
   */
  suspend(): Promise<void> {
    this.paused = true;
    return this.context.suspend();
  }
  /**
   * Resume metronome and players if they have been suspended
   * @return {Promise} resolves with void
   */
  resume(): Promise<void> {
    this.paused = false;
    return this.context.resume();
  }

  /**
   * Change volume of the orchestra
   * @param {float} value - 0 is mute, 1 is default. Set in between to lower, higher to increase.
   */
  setVolume(value: number) {
    this.master.gain.setValueAtTime(value, this.context.currentTime);
  }
}

/**
 * Callback function called on beat event
 * @callback Orchestre~beatCallback
 * @param {float} nextBeat - Time of the next coming beat in seconds
 */

export default Orchestre;
