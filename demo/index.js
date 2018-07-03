import Orchestre from '../src/orchestre';

const players = [{
  name: 'chords',
  url: './assets/beginning-chords.ogg',
  length: 16,
  absolute: true
}, {
  name: 'bass',
  url: './assets/beg-bass.ogg',
  length: 8,
}, {
  name: 'guitar',
  url: './assets/beg-guitar.ogg',
  length: 8,
  absolute: true
}];

const orchestre = new Orchestre(115);
let eventId;
orchestre.addPlayers(players).then(() => {
  orchestre.start();
  document.getElementById('control').className = '';
  eventId = orchestre.onBeat(beat, 2, {repeat: true})
});

window.chords = function() {
  orchestre.switch('chords', {fade: 1});
}
window.guitar = function() {
  orchestre.switch('guitar', {fade: 1, now: true});
}
window.bass = function() {
  orchestre.switch('bass', {once: false});
}

function beat() {
  const beatElem = document.getElementById('beat');
  beatElem.className = beatElem.className === 'hidden' ? '' : 'hidden';
}

window.stopEvent = function() {
  orchestre.removeListener(eventId);
}

window.stop = function() {
  orchestre.fullStop();
}
