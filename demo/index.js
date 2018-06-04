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
});

window.startLoop = function() {
  orchestre.play('chords');
  orchestre.play('guitar');
}
