# Orchestre-JS

Orchestre-JS is an audio library that plays several tracks in loop and keeps them in sync. It can be used to dynamically add and remove instruments in a song, play sounds in rhythm, or call events on beats. Orchestre-JS aims to provides a simple way to create a dynamic soundtrack for your web games.

If you want to see the library in action, you can check out the two games which it comes from: [Moog Memories](https://itooh.itch.io/moog-memories) and [Blood Not Allowed](https://itooh.itch.io/blood-not-allowed).
If you use Orchestre-JS for your game, I would be really glad to see them! Feel free to send them on my Twitter [@Itooh](https://www.twitter.com/Itooh_).

## Install

### npm
```
npm install orchestre-js
```

### From file

Download the [lastest release](https://github.com/ClementRivaille/orchestre-js/releases).

### Load

You can load Orchestre-JS in your script using ES6 *import*:
```javascript
import Orchestre from 'orchestre-js'
```

Or you can add to your HTML:
```html
<script src="./path/to/orchestre.min.js"></script>
```
This will create a global *Orchestre* constructor that you will be able to use in your code.

## How to use

### Create an orchestra

The first thing you need to do is to create an *“orchestre”* (French for orchestra, if you hadn't figured it out yet). The only thing it needs is the song's BPM (beats per minute).

*Note: All the examples below are written in ES6, but Orchestre-JS can still be used in Vanilla Javascript.*

```javascript
const orchestra = new Orchestre(120);
```

### Add players

Then, you will need to add some players. Each player corresponds to one track. For one player, you need:
* A unique **name** that will identify it
* The **URL** of the sound file it will play
* The **length** in beats of the track

*Be aware that you need a local web server to request local files*.

For example, in a 4/4 signature, a track of one measure would have a length of 4, two measures would be 8, etc… But you can also use a track of one measure and three beats (7) and make it phase as it loops!

Player takes also an optional **absolute** parameter. By default, a player is relative, which means that it will play from its beginning when it starts. Absolute players, on the other hand, will calculate their offset relatively from the start of the song. Which mean that every absolute players will always play together. This is useful for players that set the chords or main melodies.

Here is a diagram to better understand what absolute means. Each player here has a length of 4 beats, and are activated at the same time. See how the relative one starts right on the first beat, while the absolute one starts from the second beat.
![Absolute vs relative diagram](doc/absolute-diagram.png)

To add a single player, use:
```javascript
orchestra.addPlayer('bass', './assets/music/bass.ogg', 16, true)
  .then(() => { /* Called once the player is loaded */ });
```
`addPlayer` returns a promise that resolves once the sound file has been fetched. A player can't be used until being fully loaded.

However, you might want to use more than a single player! Therefore, you should use the `addPlayers` function, which takes an array of player configurations, and load them all:
```javascript
const players = [{
  name: 'chords',
  url: './assets/music/chords.ogg',
  length: 16,
  absolute: true
}, {
  name: 'bass',
  url: './assets/music/bass.ogg',
  length: 16,
  absolute: true
}, {
  name: 'guitar',
  url: './assets/music/guitar.ogg',
  length: 8
}];

orchestra.addPlayers(players)
  .then(() => { /* ... */ });
```

You can add players at anytime, even once the orchestra has been started.

### Start the orchestra

Speaking of which, here is how it's done:
```javascript
orchestra.start();
```

This won't play any sound yet. But it will initialize a metronome, that will set the beginning of the music, and count each beat based on the BPM.

If you want to start with some tracks immediately, you can call `start` with an array of player names as parameter.

### Activate players

Once the orchestra has been loaded, you can activate your players:
```javascript
orchestra.play('bass');
```

And to stop them:
```javascript
orchestra.stop('bass');
```

Players will start and stop on the next beat, and automatically stay in rhythm, acording to their type (relative or absolute). It's as simple as that!

You can even call the function `switch`, that just changes the player position between play and stop.

```javascript
orchestra.switch('bass');
```

`play`, `stop` and `switch` can take a second parameter *options*, which is an object that allows you to define some of those properties:
* **fade** *(float)*: time constant in seconds for a fade in or fade out. The length of fading is approximately equal to 1.6 times your constant. See [setTargetAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime) for more details.
* **now** *(bool)*: if true, sound will start / stop immediately instead of waiting for next beat. This should be used with fading.
* **once** *(bool)*: for *play* only. Play sound only once, then stop.

Finally, you can schedule an action on a player several beats in advance with the following method:
```javascript
orchestra.schedule('bass', 4, 'switch'); // bass will be switched after the next 4 beats
orchestra.schedule('guitar', 8, 'play', {absolute: true}); // guitar will play on the next measure of 8 beats
```

*Warning:* Once an action has been scheduled, it can't be cancelled. So be careful with this.

### Trigger events

If you want to call an event function on a beat, you can use `onBeat`:

```javascript
orchestra.onBeat(() => {
  // Do something
}, 4); // Function will be called in 4 beats
```

`onBeat` takes also a third *options* parameter:
* **absolute** *(bool)*: call the function on the absolute measure of n beats
* **listener** *(bool)*: keep calling the function every n beats
* **offset** *(number)*: use with absolute to set a position in the measure

If you want to remove a listener you added with `onBeat`, use `removeListener` with the instance of your function:
```javascript
orchestra.removeListener(callback);
```

### Stop

Once you are done with your song, you can call `fullStop` on the orchestra to immediately stop all the instruments, and stop the metronome.
```javascript
orchestra.fullStop()
```

Note that the orchestra will need to be started to be used again.

That's it! You know all the basics of Orchestre-JS.

## Advanced

### Using the Web Audio API

Orchestre-JS uses the *Web Audio API*. You don't need to know how to use it to use Orchestre-JS, but as always, it can help.
If you're more advanced with the Web Audio API, you might want to have some more complex usage of Orchestre-JS. Here are some options at your disposition.

By default, every new orchestra creates its own audio context. But you can pass your own as a second argument.
```javascript
const context = new (window.AudioContext || window.webkitAudioContext)();
const orchestra = new Orchestre(120, context);
```

You can also access the audio context from the `context` property of the orchestre.

Players are by default connected to the context's destination. You can change that with the `destination` parameter.
```javascript
orchestra.addPlayer('bass', './assets/music/bass.ogg', 16, true, myAudioNode);
// Or
orchestra.addPlayers([{
  name: 'guitar',
  url: './assets/music/guitar.ogg',
  length: 8,
  destination: myAudioNode
}]);
```

Alternatively, you can connect or disconnect players dynamically:
```javascript
orchestra.connect('bass', myAudioNode);
orchestra.disconnect('bass', myAudioNode);
orchestra.disconnect('bass'); // Will disconnect from every nodes
```

### Metronome

Orchestre-JS orchestra use a metronome to sync all tracks. In most use case, you don't need to interact with it. You still can access it from the `metronome` property of a created orchestre.

The metronome gives you access to the property `beatsLength`, which is the length of a beats in seconds. *Beats* are the tiniest unit of time calculated. If you want to be more precise, the better is to adapt your BPM.

Here are some metronome's methods you can use :
* `getNextBeatTime(): float` gives you the time, in second, of the next beat
* `getNextNthBeatTime(beats:number): float` gives you the time, in second, of the next nth beat
* `getOffset(time:float): float` gives in seconds the offset of the given time relatively to the closest beat before it
* `getBeatPosition(time: float, measureSize): number` for absolute measures of *measureSize* beats, gives the position of the given time. For example, for a measure of 4 beat, results may go from 0 (first beat) to 3 (last beat).

For the simple tasks though (such as counting the position in a measure), I would advise not to use these functions and instead use `onBeat` method to manage your own counters.

## API

[API Documentation](doc/api.md)
