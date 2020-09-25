export interface Sound {
  name: string;
  url: string;
}

class BufferLoader {
  buffers: { [key: string]: AudioBuffer } = {};
  /**
   * context {object} Audio context
   * soundsUrls {array} List of objects contening name and urls of sounds
   */
  constructor(private context: AudioContext) {}

  /**
   * Load a sound from url
   */
  async load(name: string, url: string) {
    // Prepare request
    const request = new Request(url);

    // return promise once request is complete
    const response = await fetch(request);
    const buffer = await response.arrayBuffer();
    // Decode buffer and add it to list
    const audioData = await this.context.decodeAudioData(buffer);
    this.buffers[name] = audioData;

    return audioData;
  }

  /**
   * Load a list of sounds
   */
  async loadAll(sounds: Sound[]) {
    const promises = [];
    for (let soundUrl of sounds) {
      promises.push(this.load(soundUrl.name, soundUrl.url));
    }

    // Return buffers in an object
    await Promise.all(promises);
    return this.buffers;
  }
}

export default BufferLoader;
