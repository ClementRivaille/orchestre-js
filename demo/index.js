import Orchestre from '../src/orchestre';

const players = [{
  name: 'drum',
  url: './assets/drum.ogg',
  length: 4,
}, {
  name: 'bass',
  url: './assets/bass.ogg',
  length: 16,
}, {
  name: 'piano',
  url: './assets/piano.ogg',
  length: 16,
}, {
  name: 'melody',
  url: './assets/melody.ogg',
  length: 8,
  position: "relative",
}, {
  name: 'organ',
  url: './assets/organ.ogg',
  length: 7,
  position: "relative",
}, {
  name: 'synth',
  url: './assets/synth.ogg',
  length: 16,
}, {
  name: 'jingle',
  url: './assets/jingle.ogg',
  length: 4,
  position: "relative",
}, {
  name: 'doremi',
  url: './assets/doremi.ogg',
  length: 12,
  position: "relative",
}, {
  name: 'koto',
  url: './assets/koto.ogg',
  length: 8,
}];

const orchestre = new Orchestre(120);
let eventId;
let volume = 1;
orchestre.addPlayers(players).then(() => {
  orchestre.start(['drum']);
  document.getElementById('control').className = '';
  eventId = orchestre.addListener(beat, 2, { repeat: true })
});


window.bass = function () {
  orchestre.toggle('bass', {
    fade: 0.01
  });
};
window.piano = function () {
  orchestre.toggle('piano', {
    fade: 0.01
  });
};
window.melody = function () {
  orchestre.toggle('melody', {
    fade: 0.02
  });
};
window.organ = function () {
  orchestre.toggle('organ', {
    fade: 0.02
  });
};
window.synth = function () {
  orchestre.toggle('synth', {
    fade: 1.2,
    now: true
  });
};
window.jingle = function () {
  orchestre.toggle('jingle', {
    once: true
  });
};
window.koto = () => {
  orchestre.toggle("koto", {
    keep: true
  });
}

window.count = async function () {
  orchestre.play('doremi', {
    once: true
  });
  await orchestre.wait(8)
  console.log("EIGHT")
};

function beat() {
  const beatElem = document.getElementById('beat');
  beatElem.className = beatElem.className === 'hidden' ? '' : 'hidden';
}

window.stopEvent = function () {
  orchestre.removeListener(eventId);
}

window.stop = function () {
  orchestre.fullStop();
}

window.pause = function () {
  if (orchestre.paused) {
    orchestre.resume();
  }
  else {
    orchestre.suspend();
  }
}

window.changeVolume = function (positive) {
  volume = volume + (positive ? 0.1 : -0.1);
  orchestre.setVolume(volume);
}
