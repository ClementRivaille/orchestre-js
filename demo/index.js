import Orchestre from '../src/orchestre';

const players = [{
  name: 'drum',
  url: './assets/drum.ogg',
  length: 4,
  absolute: true
}, {
  name: 'bass',
  url: './assets/bass.ogg',
  length: 16,
  absolute: true
}, {
  name: 'piano',
  url: './assets/piano.ogg',
  length: 16,
  absolute: true
}, {
  name: 'melody',
  url: './assets/melody.ogg',
  length: 8,
  absolute: false
}, {
  name: 'organ',
  url: './assets/organ.ogg',
  length: 7,
  absolute: false
}, {
  name: 'synth',
  url: './assets/synth.ogg',
  length: 16,
  absolute: true
}, {
  name: 'jingle',
  url: './assets/jingle.ogg',
  length: 4,
  absolute: false
}, {
  name: 'doremi',
  url: './assets/doremi.ogg',
  length: 12,
  absolute: false
}];

const orchestre = new Orchestre(120);
let eventId;
orchestre.addPlayers(players).then(() => {
  orchestre.start(['drum']);
  document.getElementById('control').className = '';
  eventId = orchestre.onBeat(beat, 2, {repeat: true})
});

window.bass = function() {
  orchestre.switch('bass', {
    fade: 0.01
  });
};
window.piano = function() {
  orchestre.switch('piano', {
    fade: 0.01
  });
};
window.melody = function() {
  orchestre.switch('melody', {
    fade: 0.02
  });
};
window.organ = function() {
  orchestre.switch('organ', {
    fade: 0.02
  });
};
window.synth = function() {
  orchestre.switch('synth', {
    fade: 1.2,
    now: true
  });
};
window.jingle = function() {
  orchestre.switch('jingle', {
    once: true
  });
};
window.count = function() {
  orchestre.switch('doremi', {
    once: true
  });
};

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

window.pause = function() {
  if (orchestre.paused) {
    orchestre.resume();
  }
  else {
    orchestre.suspend();
  }
}
