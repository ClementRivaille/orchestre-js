import BufferLoader from './buffer-loader';
import SoundLoop from './sound-loop';
import Metronome from './metronome';
import EventEmitter from './event-emitter';

/**
* Manage sounds and activate them as instruments
*/
class Orchestra {
  constructor(bpm, context) {
    this.instruments = {};
    this.context = context || new (window.AudioContext || window.webkitAudioContext)();
    this.eventEmitter = new EventEmitter();
    this.metronome = new Metronome(bpm, this.context, this.eventEmitter);
    this.loader = new BufferLoader(this.context, listSounds);
  }

  /**
  * Prepare sounds
  */
  loadSounds(eventEmitter) {
    // Load sounds files
    return this.loader.loadAll().then(buffers => {
      // Store sounds into instruments
      for (let key in buffers) {
        if (!buffers.hasOwnProperty(key)) return;
        let sound = this.sounds[key];
        // Each sound is connected to a gain
        sound.gainNode = this.context.createGain();
        // Confuration according to type (loop or sound)
        if (sound.type === 'relativeLoop' || sound.type === 'globalLoop') {
          sound.soundLoop = new SoundLoop(this.context, buffers[key], sound.gainNode, eventEmitter, sound.nbBeats);
        }
        else {
          sound.buffer = buffers[key];
        }

        // Connect effects
        let endNode = sound.gainNode;
        if (sound.effects) {
          for (let effectKey in sound.effects) {
            if (!sound.effects.hasOwnProperty(effectKey)) return;
            let effectConfig = sound.effects[effectKey];
            let effect;

            // Filters
            if (effectConfig.type === 'lowpassFilter' || effectConfig.type === 'highpassFilter') {
              effect = this.context.createBiquadFilter();
              effect.type = effectConfig.type === 'lowpassFilter' ? 'lowpass' : 'highpass';
              effect.frequency.value = effectConfig.init.frequency;
              effect.Q.value = effectConfig.init.Q;
              effectConfig.node = effect;
            }

            // Distorsion
            if (effectConfig.type === 'distorsion') {
              effect = this.context.createWaveShaper();
              effect.curve = makeDistortionCurve(effectConfig.init.curve || 0);
              effectConfig.node = effect;
            }

            // Then, connect effect node
            if (effect) {
              endNode.connect(effect);
              endNode = effect;
            }
          }
        }

        // Connect instrument to destination
        endNode.connect(this.context.destination);
      }
    });
  }

  /**
  * Trigger a sound, according to its kind
  */
  triggerSound(name, startTime) {
    let sound = this.sounds[name] || {};

    // Relative loops start immediately, and stop when asked
    if (sound.type === 'relativeLoop') {
      if (!sound.playing) {
        sound.soundLoop.start(startTime);
      }
      else {
        sound.soundLoop.stop(startTime);
      }
      sound.playing = !sound.playing;
    }
    // Global loop are always playing. Gain is used to turn them up and down.
    else if (sound.type === 'globalLoop') {
      sound.gainNode.gain.linearRampToValueAtTime(sound.playing ? 0 : 1, startTime);
      sound.playing = !sound.playing;
    }
    // Sounds are just played once
    else if (sound.type === 'sound' || 'transition') {
      let source = this.context.createBufferSource();
      source.buffer = sound.buffer;
      source.connect(sound.gainNode);
      // If detune option, randomly change the pitch
      if (sound.type === 'sound' && sound.detune) {
        source.detune.value = Math.round(Math.random() * 100 * 12 *2 - 100 * 12);
      }
      source.start(sound.type === 'transition' ? startTime : this.context.currentTime);
    }

    // Return the state of the instrument
    return sound.playing;
  }

  /**
  * Change value of an effect for an instrument
  */
  setEffect(sound, effectKey, value, startTime) {
    if (this.sounds[sound] && this.sounds[sound].effects && this.sounds[sound].effects[effectKey] && this.sounds[sound].effects[effectKey].node) {
      let effect = this.sounds[sound].effects[effectKey];
      // Filter
      if (effect.type === 'lowpassFilter' || effect.type === 'highpassFilter') {
        let filterValue = effect.min + value * (effect.max - effect.min);
        if (!effect.fade) {
          effect.node[effect.property].value = filterValue;
        }
        else {
          effect.node[effect.property].linearRampToValueAtTime(filterValue, startTime + (effect.delay || 0));
        }
      }
      // distorsion
      else if (effect.type === 'distorsion') {
        effect.node.curve = makeDistortionCurve(effect.min + value * (effect.max - effect.min));
      }
    }
  }

  /**
  * Activate a global loop
  */
  activateLoop(soundName, volume, startTime) {
    let sound = this.sounds[soundName];
    sound.soundLoop.start(startTime);
    sound.gainNode.gain.value = volume;
    sound.playing = volume > 0;
  }

  /**
  * Deactivate a loop
  */
  deactivateLoop(soundName, stopTime) {
    let sound = this.sounds[soundName];
    if (sound.playing) {
      sound.soundLoop.stop(stopTime);
      sound.playing = false;
    }
  }
}

function makeDistortionCurve(amount) {
  let k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

export default Orchestra;
