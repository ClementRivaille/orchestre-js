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
orchestre.addPlayers(players).then(() => {
  orchestre.start();
  document.getElementById('control').className = '';
  orchestre.onBeat(beat, 2, {listener: true})
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


window.stop = function() {
  orchestre.fullStop();
}
