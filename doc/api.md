# API

## Classes

<dl>
<dt><a href="#Orchestre">Orchestre</a></dt>
<dd><p>Manage sounds and activate them as players</p>
</dd>
<dt><a href="#Metronome">Metronome</a></dt>
<dd><p>Count beats, and give the time of next beat occurence</p>
</dd>
</dl>

<a name="Orchestre"></a>

## Orchestre
Manage sounds and activate them as players

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| context | <code>AudioContext</code> | Audio context |
| metronome | [<code>Metronome</code>](#Metronome) |  |
| started | <code>boolean</code> |  |


* [Orchestre](#Orchestre)
    * [new Orchestre(bpm, context)](#new_Orchestre_new)
    * [.start(players)](#Orchestre+start)
    * [.fullStop()](#Orchestre+fullStop)
    * [.addPlayers(players)](#Orchestre+addPlayers)
    * [.addPlayer(name, url, length, [absolute], [destination])](#Orchestre+addPlayer)
    * [.connect(name, destination)](#Orchestre+connect)
    * [.disconnect(name, destination)](#Orchestre+disconnect)
    * [.trigger(name, [options])](#Orchestre+trigger)
    * [.play(name, [options])](#Orchestre+play)
    * [.stop(name, [options])](#Orchestre+stop)
    * [.isPlaying(name)](#Orchestre+isPlaying)
    * [.schedule(name, beats, [action], [options])](#Orchestre+schedule)
    * [.onBeat(callback, [beats], [options])](#Orchestre+onBeat)
    * [.removeListener()](#Orchestre+removeListener) ⇒ <code>boolean</code>

<a name="new_Orchestre_new"></a>

### new Orchestre(bpm, context)

| Param | Type | Description |
| --- | --- | --- |
| bpm | <code>number</code> | Beats per minute |
| context | <code>AudioContext</code> |  |

<a name="Orchestre+start"></a>

### orchestre.start(players)
Start metronome

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type | Description |
| --- | --- | --- |
| players | <code>Array.&lt;string&gt;</code> | names of players to start immediately |

<a name="Orchestre+fullStop"></a>

### orchestre.fullStop()
Immediately stop all the instruments, then stop the metronome

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
<a name="Orchestre+addPlayers"></a>

### orchestre.addPlayers(players)
Prepare sounds

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| players | <code>Array.&lt;object&gt;</code> |  | Players configuration |
| player.name | <code>string</code> |  | Player's identifier |
| player.url | <code>string</code> |  | URL of the sound file |
| player.length | <code>number</code> |  | Number of beats that the sound contains |
| [player.absolute] | <code>boolean</code> | <code>false</code> | Indicates that the player is aligned absolutely in the song |
| [player.destination] | <code>AudioNode</code> |  | Audio node to connect the player to |

<a name="Orchestre+addPlayer"></a>

### orchestre.addPlayer(name, url, length, [absolute], [destination])
Prepare a single sound

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Player's identifier |
| url | <code>string</code> |  | URL of the sound file |
| length | <code>number</code> |  | Number of beats that the sound contains |
| [absolute] | <code>boolean</code> | <code>false</code> | Indicates that the player is aligned absolutely in the song |
| [destination] | <code>AudioNode</code> |  | Audio node to connect the player to |

<a name="Orchestre+connect"></a>

### orchestre.connect(name, destination)
Connect a player to an audio node

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| destination | <code>AudioNode</code> | 

<a name="Orchestre+disconnect"></a>

### orchestre.disconnect(name, destination)
Disconnect a player from all its destination or one audio node

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 
| destination | <code>AudioNode</code> | 

<a name="Orchestre+trigger"></a>

### orchestre.trigger(name, [options])
Trigger a sound, according to its kind

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Player identifier |
| [options] | <code>object</code> | <code>{}</code> |  |
| [options.fade] | <code>float</code> |  | Time constant for fade in or fade out |
| [options.now] | <code>boolean</code> |  | If true, sound will start / stop immediately. Otherwise, it waits for next beat. |
| [options.once] | <code>boolean</code> |  | Play sound only once, then stop |

<a name="Orchestre+play"></a>

### orchestre.play(name, [options])
Start a player

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Player identifier |
| [options] | <code>object</code> | <code>{}</code> |  |
| [options.fade] | <code>float</code> |  | Time constant for fade in |
| [options.now] | <code>boolean</code> |  | If true, sound will start immediately. Otherwise, it waits for next beat. |
| [options.once] | <code>boolean</code> |  | Play sound only once, then stop |

<a name="Orchestre+stop"></a>

### orchestre.stop(name, [options])
Stop a player

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | LAYER identifier |
| [options] | <code>object</code> | <code>{}</code> |  |
| [options.fade] | <code>float</code> |  | Time constant for fade out |
| [options.now] | <code>boolean</code> |  | If true, sound will stop immediately. Otherwise, it waits for next beat. |

<a name="Orchestre+isPlaying"></a>

### orchestre.isPlaying(name)
Check if a player is active

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type |
| --- | --- |
| name | <code>string</code> | 

<a name="Orchestre+schedule"></a>

### orchestre.schedule(name, beats, [action], [options])
Schedule an action (play, stop, or trigger) for a player on an incoming beat

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Player identifier |
| beats | <code>number</code> |  | Number of beat to wait before action |
| [action] | <code>string</code> | <code>&quot;&#x27;trigger&#x27;&quot;</code> | Either 'play', 'stop' or 'trigger' |
| [options] | <code>object</code> | <code>{}</code> |  |
| [options.fade] | <code>float</code> |  | Time constant for fade in or fade out |
| [options.once] | <code>boolean</code> |  | Play sound only once, then stop |
| [options.absolute] | <code>boolean</code> |  | Action will be performed on the next absolute nth beat (next measure of n beat) |
| [options.offset] | <code>number</code> |  | Use with absolute to set a position in the measure |

<a name="Orchestre+onBeat"></a>

### orchestre.onBeat(callback, [beats], [options])
Wait a number of beats before calling a function

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| callback | <code>function</code> |  |  |
| [beats] | <code>number</code> | <code>1</code> | number of beats to wait |
| [options] | <code>objects</code> | <code>{}</code> |  |
| [options.listener] | <code>boolean</code> |  | Callback will be called every n beats |
| [options.absolute] | <code>boolean</code> |  | Callback will be called on the next absolute nth beat (next measure of n beats) |
| [options.offset] | <code>number</code> |  | Use with absolute to set a position in the measure |

<a name="Orchestre+removeListener"></a>

### orchestre.removeListener() ⇒ <code>boolean</code>
Remove an existing listener

**Kind**: instance method of [<code>Orchestre</code>](#Orchestre)  
**Returns**: <code>boolean</code> - true if found  
<a name="Metronome"></a>

## Metronome
Count beats, and give the time of next beat occurence

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| beatLength | <code>float</code> | Length of a beat in seconds |
| context | <code>AudioContext</code> |  |


* [Metronome](#Metronome)
    * [new Metronome(bpm, context, eventEmitter)](#new_Metronome_new)
    * [.getNextBeatTime()](#Metronome+getNextBeatTime) ⇒ <code>float</code>
    * [.getNextNthBeatTime(beats)](#Metronome+getNextNthBeatTime) ⇒ <code>float</code>
    * [.getOffset(time)](#Metronome+getOffset)
    * [.getBeatPosition(time, measureSize)](#Metronome+getBeatPosition) ⇒ <code>number</code>

<a name="new_Metronome_new"></a>

### new Metronome(bpm, context, eventEmitter)

| Param | Type | Description |
| --- | --- | --- |
| bpm | <code>number</code> |  |
| context | <code>AudioContext</code> | audio context |
| eventEmitter | <code>EventEmitter</code> |  |

<a name="Metronome+getNextBeatTime"></a>

### metronome.getNextBeatTime() ⇒ <code>float</code>
Public method use to obtain global next beat time

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>float</code> - time in seconds of the beat  
<a name="Metronome+getNextNthBeatTime"></a>

### metronome.getNextNthBeatTime(beats) ⇒ <code>float</code>
Public method use to obtain global nth next beat time

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>float</code> - time in seconds of the beat  

| Param | Type | Description |
| --- | --- | --- |
| beats | <code>number</code> | nth beat, 1 being the next |

<a name="Metronome+getOffset"></a>

### metronome.getOffset(time)
Get the offset in seconds of the given time relatively to the closest beat before it

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>float</code> | time in seconds from an audio context |

<a name="Metronome+getBeatPosition"></a>

### metronome.getBeatPosition(time, measureSize) ⇒ <code>number</code>
Gets the position of the given time in an absolute measure of n beats

**Kind**: instance method of [<code>Metronome</code>](#Metronome)  
**Returns**: <code>number</code> - position (from 0 to n - 1)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>float</code> |  |
| measureSize | <code>number</code> | Number of beats in the measure |
