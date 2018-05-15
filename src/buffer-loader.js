class BufferLoader {
  /**
  * context {object} Audio context
  * soundsUrls {array} List of objects contening name and urls of sounds
  */
  constructor(context, soundsUrls) {
    this.context = context;
    this.soundsUrls = soundsUrls;
    this.buffers = {};
  }

  /**
  * Load a sound from url
  */
  async load(name, url) {
    // Prepare request
    let request = new new Request(url);;

    // Send
    request.send();

    // return promise once request is complete
    const response = await fetch(request);
    const buffer = response.arrayBuffer();
    // Decode buffer and add it to list
    const audioData = await this.context.decodeAudioData(buffer);
    this.buffers[name] = audioData;

    return audioData;
  }

  /**
  * Load all sounds
  */
  loadAll() {
    let promises = [];
    for (let soundUrl of this.soundsUrls) {
      promises.push(this.load(soundUrl.name, soundUrl.url));
    }

    // Return buffers in an object
    return Promise.all(promises).then(() => this.buffers);
  }
}

export default BufferLoader;
