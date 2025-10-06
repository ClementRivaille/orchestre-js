# API

## Classes

<dl>
<dt><a href="#Orchestre">Orchestre</a></dt>
<dd><p>Manage sounds and activate them as players</p></dd>
<dt><a href="#Metronome">Metronome</a></dt>
<dd><p>Count beats, and give the time of next beat occurrence</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#PlayerPosition">PlayerPosition</a> : <code>&quot;absolute&quot;</code> | <code>&quot;relative&quot;</code></dt>
<dd><p>Positioning of a player's track in the song</p></dd>
</dl>

<a name="Orchestre"></a>

## Orchestre

<p>Manage sounds and activate them as players</p>

**Kind**: global class  
**Properties**

| Name      | Type                                 | Description                                    |
| --------- | ------------------------------------ | ---------------------------------------------- |
| context   | <code>AudioContext</code>            | <p>Audio context</p>                           |
| master    | <code>GainNode</code>                | <p>Gain connected to context's destination</p> |
| metronome | [<code>Metronome</code>](#Metronome) |                                                |
| started   | <code>boolean</code>                 |                                                |
| paused    | <code>boolean</code>                 | <p>True when orchestre has been suspended</p>  |

- [API](#api)
  - [Classes](#classes)
  - [Typedefs](#typedefs)
  - [Orchestre](#orchestre)
    - [new Orchestre(bpm, context)](#new-orchestrebpm-context)
    - [orchestre.start(\[players\])](#orchestrestartplayers)
    - [orchestre.fullStop()](#orchestrefullstop)
    - [orchestre.addPlayers(players) ⇒ Promise](#orchestreaddplayersplayers--promise)
    - [orchestre.addPlayer(name, url, length, \[position\], \[destination\]) ⇒ Promise](#orchestreaddplayername-url-length-position-destination--promise)
    - [orchestre.connect(name, destination)](#orchestreconnectname-destination)
    - [orchestre.disconnect(name, destination)](#orchestredisconnectname-destination)
    - [orchestre.toggle(name, \[options\])](#orchestretogglename-options)
    - [orchestre.play(name, \[options\])](#orchestreplayname-options)
    - [orchestre.stop(name, \[options\])](#orchestrestopname-options)
    - [orchestre.isPlaying(name) ⇒ boolean](#orchestreisplayingname--boolean)
    - [orchestre.schedule(name, beats, \[action\], \[options\])](#orchestreschedulename-beats-action-options)
    - [orchestre.wait(\[beats\], \[options\]) ⇒ Promise.\<number\>](#orchestrewaitbeats-options--promisenumber)
    - [orchestre.addListener(callback, \[beats\], \[options\]) ⇒ number](#orchestreaddlistenercallback-beats-options--number)
    - [orchestre.removeListener(id) ⇒ boolean](#orchestreremovelistenerid--boolean)
    - [orchestre.suspend() ⇒ Promise](#orchestresuspend--promise)
    - [orchestre.resume() ⇒ Promise](#orchestreresume--promise)
    - [orchestre.setVolume(value)](#orchestresetvolumevalue)
    - [Orchestre~beatCallback : function](#orchestrebeatcallback--function)
  - [Metronome](#metronome)
    - [new Metronome(bpm, context, eventEmitter)](#new-metronomebpm-context-eventemitter)
    - [metronome.getNextBeatTime() ⇒ float](#metronomegetnextbeattime--float)
    - [metronome.getNextNthBeatTime(beats) ⇒ float](#metronomegetnextnthbeattimebeats--float)
    - [metronome.getOffset(time) ⇒ float](#metronomegetoffsettime--float)
    - [metronome.getTimeToBeat(\[beat\]) ⇒ float](#metronomegettimetobeatbeat--float)
    - [metronome.getBeatPosition(time, barSize) ⇒ number](#metronomegetbeatpositiontime-barsize--number)
    - [metronome.getBeatsToBar(barSize, \[bar\]) ⇒ number](#metronomegetbeatstobarbarsize-bar--number)
  - [PlayerPosition : "absolute" | "relative"](#playerposition--absolute--relative)

<a name="new_Orchestre_new"></a>

### new Orchestre(bpm, context)

| Param   | Type                      | Description             |
| ------- | ------------------------- | ----------------------- |
| bpm     | <code>number</code>       | <p>Beats per minute</p> |
| context | <code>AudioContext</code> |                         |

<a name="Orchestre+start"></a>

### orchestre.start([players])

<p>Start metronome</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param     | Type                              | Default         | Description                                  |
| --------- | --------------------------------- | --------------- | -------------------------------------------- |
| [players] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | <p>names of players to start immediately</p> |

<a name="Orchestre+fullStop"></a>

### orchestre.fullStop()

<p>Immediately stop all the instruments, then stop the metronome</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
<a name="Orchestre+addPlayers"></a>

### orchestre.addPlayers(players) ⇒ <code>Promise</code>

<p>Prepare sounds</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
**Returns**: <code>Promise</code> - <p>Promise that resolves once all player has been loaded</p>

| Param                   | Type                              | Default                           | Description                                                            |
| ----------------------- | --------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| players                 | <code>Array.&lt;object&gt;</code> |                                   | <p>Players configuration</p>                                           |
| players[].name          | <code>string</code>               |                                   | <p>Player's identifier</p>                                             |
| players[].url           | <code>string</code>               |                                   | <p>URL of the sound file</p>                                           |
| players[].length        | <code>number</code>               |                                   | <p>Number of beats that the track contains</p>                         |
| [players[].position]    | <code>PlayerPosition</code>       | <code>&quot;absolute&quot;</code> | <p>Track positioning, &quot;relative&quot; or &quot;absolute&quot;</p> |
| [players[].destination] | <code>AudioNode</code>            |                                   | <p>Audio node to connect the player to</p>                             |

<a name="Orchestre+addPlayer"></a>

### orchestre.addPlayer(name, url, length, [position], [destination]) ⇒ <code>Promise</code>

<p>Prepare a single sound</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
**Returns**: <code>Promise</code> - <p>Promise that resolves once the player is loaded</p>

| Param         | Type                        | Default                           | Description                                                            |
| ------------- | --------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| name          | <code>string</code>         |                                   | <p>Player's identifier</p>                                             |
| url           | <code>string</code>         |                                   | <p>URL of the sound file</p>                                           |
| length        | <code>number</code>         |                                   | <p>Number of beats that the track contains</p>                         |
| [position]    | <code>PlayerPosition</code> | <code>&quot;absolute&quot;</code> | <p>Track positioning, &quot;relative&quot; or &quot;absolute&quot;</p> |
| [destination] | <code>AudioNode</code>      |                                   | <p>Audio node to connect the player to</p>                             |

<a name="Orchestre+connect"></a>

### orchestre.connect(name, destination)

<p>Connect a player to an audio node</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param       | Type                   |
| ----------- | ---------------------- |
| name        | <code>string</code>    |
| destination | <code>AudioNode</code> |

<a name="Orchestre+disconnect"></a>

### orchestre.disconnect(name, destination)

<p>Disconnect a player from all its destination or one audio node</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param       | Type                   |
| ----------- | ---------------------- |
| name        | <code>string</code>    |
| destination | <code>AudioNode</code> |

<a name="Orchestre+toggle"></a>

### orchestre.toggle(name, [options])

<p>Toggle a sound state between play and stop</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param          | Type                 | Default         | Description                                                                             |
| -------------- | -------------------- | --------------- | --------------------------------------------------------------------------------------- |
| name           | <code>string</code>  |                 | <p>Player identifier</p>                                                                |
| [options]      | <code>object</code>  | <code>{}</code> |                                                                                         |
| [options.fade] | <code>float</code>   |                 | <p>Time constant for fade in or fade out</p>                                            |
| [options.now]  | <code>boolean</code> |                 | <p>If true, sound will start / stop immediately. Otherwise, it waits for next beat.</p> |
| [options.once] | <code>boolean</code> |                 | <p>Play sound only once, then stop</p>                                                  |
| [options.keep] | <code>boolean</code> |                 | <p>On stop, keep track playing until its end</p>                                        |

<a name="Orchestre+play"></a>

### orchestre.play(name, [options])

<p>Start a player</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param          | Type                 | Default         | Description                                                                      |
| -------------- | -------------------- | --------------- | -------------------------------------------------------------------------------- |
| name           | <code>string</code>  |                 | <p>Player identifier</p>                                                         |
| [options]      | <code>object</code>  | <code>{}</code> |                                                                                  |
| [options.fade] | <code>float</code>   |                 | <p>Time constant for fade in</p>                                                 |
| [options.now]  | <code>boolean</code> |                 | <p>If true, sound will start immediately. Otherwise, it waits for next beat.</p> |
| [options.once] | <code>boolean</code> |                 | <p>Play sound only once, then stop</p>                                           |

<a name="Orchestre+stop"></a>

### orchestre.stop(name, [options])

<p>Stop a player</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param          | Type                 | Default         | Description                                                                     |
| -------------- | -------------------- | --------------- | ------------------------------------------------------------------------------- |
| name           | <code>string</code>  |                 | <p>LAYER identifier</p>                                                         |
| [options]      | <code>object</code>  | <code>{}</code> |                                                                                 |
| [options.fade] | <code>float</code>   |                 | <p>Time constant for fade out</p>                                               |
| [options.now]  | <code>boolean</code> |                 | <p>If true, sound will stop immediately. Otherwise, it waits for next beat.</p> |
| [options.keep] | <code>boolean</code> |                 | <p>Keep track playing until its end</p>                                         |

<a name="Orchestre+isPlaying"></a>

### orchestre.isPlaying(name) ⇒ <code>boolean</code>

<p>Check if a player is active</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param | Type                |
| ----- | ------------------- |
| name  | <code>string</code> |

<a name="Orchestre+schedule"></a>

### orchestre.schedule(name, beats, [action], [options])

<p>Schedule an action (play, stop, or toggle) for a player on an incoming beat</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param              | Type                 | Default                                     | Description                                                                        |
| ------------------ | -------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| name               | <code>string</code>  |                                             | <p>Player identifier</p>                                                           |
| beats              | <code>number</code>  |                                             | <p>Number of beat to wait before action</p>                                        |
| [action]           | <code>string</code>  | <code>&quot;&#x27;toggle&#x27;&quot;</code> | <p>Either 'play', 'stop' or 'toggle'</p>                                           |
| [options]          | <code>object</code>  | <code>{}</code>                             |                                                                                    |
| [options.fade]     | <code>float</code>   |                                             | <p>Time constant for fade in or fade out</p>                                       |
| [options.keep]     | <code>boolean</code> |                                             | <p>On stop, keep track playing until its end</p>                                   |
| [options.once]     | <code>boolean</code> |                                             | <p>Play sound only once, then stop</p>                                             |
| [options.absolute] | <code>boolean</code> |                                             | <p>Action will be performed on the next absolute nth beat (next bar of n beat)</p> |
| [options.offset]   | <code>number</code>  |                                             | <p>Use with absolute to set a position in the bar</p>                              |

<a name="Orchestre+wait"></a>

### orchestre.wait([beats], [options]) ⇒ <code>Promise.&lt;number&gt;</code>

<p>Wait for a number of beats</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
**Returns**: <code>Promise.&lt;number&gt;</code> - <p>Resolves on the scheduled beat with its position in seconds</p>

| Param              | Type                 | Default         | Description                                                                        |
| ------------------ | -------------------- | --------------- | ---------------------------------------------------------------------------------- |
| [beats]            | <code>number</code>  | <code>1</code>  | <p>number of beats to wait</p>                                                     |
| [options]          | <code>objects</code> | <code>{}</code> |                                                                                    |
| [options.absolute] | <code>boolean</code> |                 | <p>Callback will be called on the next absolute nth beat (next bar of n beats)</p> |
| [options.offset]   | <code>number</code>  |                 | <p>Use with absolute to set a position in the bar</p>                              |

<a name="Orchestre+addListener"></a>

### orchestre.addListener(callback, [beats], [options]) ⇒ <code>number</code>

<p>Call a function every n beats</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
**Returns**: <code>number</code> - <p>Listener's id</p>

| Param              | Type                                                  | Default         | Description                                                          |
| ------------------ | ----------------------------------------------------- | --------------- | -------------------------------------------------------------------- |
| callback           | [<code>beatCallback</code>](#Orchestre..beatCallback) |                 | <p>Function to call</p>                                              |
| [beats]            | <code>number</code>                                   | <code>1</code>  | <p>number of beats to wait</p>                                       |
| [options]          | <code>objects</code>                                  | <code>{}</code> |                                                                      |
| [options.absolute] | <code>boolean</code>                                  |                 | <p>Callback will be called on absolute nth beat (bar of n beats)</p> |
| [options.offset]   | <code>number</code>                                   |                 | <p>Use with absolute to set a position in the bar</p>                |

<a name="Orchestre+removeListener"></a>

### orchestre.removeListener(id) ⇒ <code>boolean</code>

<p>Remove an existing listener</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
**Returns**: <code>boolean</code> - <p>true if found</p>

| Param | Type                | Description          |
| ----- | ------------------- | -------------------- |
| id    | <code>number</code> | <p>Listener's id</p> |

<a name="Orchestre+suspend"></a>

### orchestre.suspend() ⇒ <code>Promise</code>

<p>Suspend metronome and players</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
**Returns**: <code>Promise</code> - <p>resolves with void</p>  
<a name="Orchestre+resume"></a>

### orchestre.resume() ⇒ <code>Promise</code>

<p>Resume metronome and players if they have been suspended</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
**Returns**: <code>Promise</code> - <p>resolves with void</p>  
<a name="Orchestre+setVolume"></a>

### orchestre.setVolume(value)

<p>Change volume of the orchestra</p>

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)

| Param | Type               | Description                                                                  |
| ----- | ------------------ | ---------------------------------------------------------------------------- |
| value | <code>float</code> | <p>0 is mute, 1 is default. Set in between to lower, higher to increase.</p> |

<a name="Orchestre..beatCallback"></a>

### Orchestre~beatCallback : <code>function</code>

<p>Callback function called on beat event</p>

**Kind**: inner typedef of [<code>Orchestre</code>](#Orchestre)

| Param    | Type               | Description                                    |
| -------- | ------------------ | ---------------------------------------------- |
| nextBeat | <code>float</code> | <p>Time of the next coming beat in seconds</p> |

<a name="Metronome"></a>

## Metronome

<p>Count beats, and give the time of next beat occurrence</p>

**Kind**: global class  
**Properties**

| Name       | Type                      | Description                        |
| ---------- | ------------------------- | ---------------------------------- |
| beatLength | <code>float</code>        | <p>Length of a beat in seconds</p> |
| context    | <code>AudioContext</code> |                                    |

- [Metronome](#Metronome)
  - [new Metronome(bpm, context, eventEmitter)](#new_Metronome_new)
  - [.getNextBeatTime()](#Metronome+getNextBeatTime) ⇒ <code>float</code>
  - [.getNextNthBeatTime(beats)](#Metronome+getNextNthBeatTime) ⇒ <code>float</code>
  - [.getOffset(time)](#Metronome+getOffset) ⇒ <code>float</code>
  - [.getTimeToBeat([beat])](#Metronome+getTimeToBeat) ⇒ <code>float</code>
  - [.getBeatPosition(time, barSize)](#Metronome+getBeatPosition) ⇒ <code>number</code>
  - [.getBeatsToBar(barSize, [bar])](#Metronome+getBeatsToBar) ⇒ <code>number</code>

<a name="new_Metronome_new"></a>

### new Metronome(bpm, context, eventEmitter)

| Param        | Type                                       | Description                                    |
| ------------ | ------------------------------------------ | ---------------------------------------------- |
| bpm          | <code>number</code>                        |                                                |
| context      | <code>AudioContext</code>                  | <p>audio context</p>                           |
| eventEmitter | [<code>EventEmitter</code>](#EventEmitter) | <p>Internal class used to propagate events</p> |

<a name="Metronome+getNextBeatTime"></a>

### metronome.getNextBeatTime() ⇒ <code>float</code>

<p>Public method use to obtain global next beat time</p>

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>float</code> - <p>time in seconds of the beat</p>  
<a name="Metronome+getNextNthBeatTime"></a>

### metronome.getNextNthBeatTime(beats) ⇒ <code>float</code>

<p>Public method use to obtain global nth next beat time</p>

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>float</code> - <p>time in seconds of the beat</p>

| Param | Type                | Description            |
| ----- | ------------------- | ---------------------- |
| beats | <code>number</code> | <p>Number of beats</p> |

<a name="Metronome+getOffset"></a>

### metronome.getOffset(time) ⇒ <code>float</code>

<p>Get the offset in seconds of the given time relatively to the closest beat before it</p>

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>float</code> - <p>time since last beat</p>

| Param | Type               | Description                                  |
| ----- | ------------------ | -------------------------------------------- |
| time  | <code>float</code> | <p>time in seconds from an audio context</p> |

<a name="Metronome+getTimeToBeat"></a>

### metronome.getTimeToBeat([beat]) ⇒ <code>float</code>

<p>Return the time remaining before a beat</p>

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>float</code> - <p>time in seconds</p>

| Param  | Type                | Default        | Description                    |
| ------ | ------------------- | -------------- | ------------------------------ |
| [beat] | <code>number</code> | <code>1</code> | <p>Number of beats to wait</p> |

<a name="Metronome+getBeatPosition"></a>

### metronome.getBeatPosition(time, barSize) ⇒ <code>number</code>

<p>Get the position of the given time in an absolute bar of n beats</p>

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>number</code> - <p>position (from 0 to n - 1)</p>

| Param   | Type                | Description                     |
| ------- | ------------------- | ------------------------------- |
| time    | <code>float</code>  |                                 |
| barSize | <code>number</code> | <p>Number of beats in a bar</p> |

<a name="Metronome+getBeatsToBar"></a>

### metronome.getBeatsToBar(barSize, [bar]) ⇒ <code>number</code>

<p>Get the number of beats remaining before a bar</p>

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>number</code> - <ul>

<li>Beats remaining</li>
</ul>

| Param   | Type                | Default        | Description           |
| ------- | ------------------- | -------------- | --------------------- |
| barSize | <code>number</code> |                | <p>Bar length</p>     |
| [bar]   | <code>number</code> | <code>1</code> | <p>Number of bars</p> |

<a name="PlayerPosition"></a>

## PlayerPosition : <code>&quot;absolute&quot;</code> \| <code>&quot;relative&quot;</code>

<p>Positioning of a player's track in the song</p>

**Kind**: global typedef
