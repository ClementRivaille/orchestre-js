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
});

window.chords = function() {
  orchestre.trigger('chords');
}
window.guitar = function() {
  orchestre.trigger('guitar');
}
window.bass = function() {
  orchestre.trigger('bass');
}
