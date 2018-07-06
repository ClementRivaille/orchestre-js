import Orchestre from './src/orchestre';

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
let volume = 1;
let listenerId = -1;

window.start = function() {
  document.getElementById('startButton').className = 'hidden';
  orchestre.addPlayers(players).then(() => {
    orchestre.start(['drum']);
    document.getElementsByTagName('main')[0].className = '';
    document.getElementById('control').className = '';
    listenerId = orchestre.onBeat(beat, 2, {repeat: true})
  });
}

window.bass = function() {
  orchestre.switch('bass', {
    fade: 0.01
  });
  document.getElementById('bass-btn').className = orchestre.isPlaying('bass') ? 'active' : '';
};
window.piano = function() {
  orchestre.switch('piano', {
    fade: 0.01
  });
  document.getElementById('piano-btn').className = orchestre.isPlaying('piano') ? 'active' : '';
};
window.melody = function() {
  orchestre.switch('melody', {
    fade: 0.02
  });
  document.getElementById('melody-btn').className = orchestre.isPlaying('melody') ? 'active' : '';
};
window.organ = function() {
  orchestre.switch('organ', {
    fade: 0.02
  });
  document.getElementById('organ-btn').className = orchestre.isPlaying('organ') ? 'active' : '';
};
window.synth = function() {
  orchestre.switch('synth', {
    fade: 1.2,
    now: true
  });
  document.getElementById('synth-btn').className = orchestre.isPlaying('synth') ? 'active' : '';
};
window.jingle = function() {
  orchestre.switch('jingle', {
    once: true
  });

  var jingleBtn = document.getElementById('jingle-btn');
  jingleBtn.className = 'disabled';
  jingleBtn.setAttribute('disabled', true);
  orchestre.onBeat(() => {
    jingleBtn.className = '';
    jingleBtn.removeAttribute('disabled');
  }, 4);
};
window.count = function() {
  orchestre.switch('doremi', {
    once: true
  });
  var countBtn = document.getElementById('count-btn');
  countBtn.className = 'disabled';
  countBtn.setAttribute('disabled', true);
  orchestre.onBeat(() => {
    countBtn.className = '';
    countBtn.removeAttribute('disabled');

    var eightElem = document.getElementById('eight');
    eightElem.className = 'trigger';
    setTimeout(() => {
      eightElem.className = '';
    }, 1500);

  }, 8);
};

function beat() {
  const beatElem = document.getElementById('beat');
  beatElem.className = beatElem.className === 'red' ? 'blue' : 'red';
}

window.animationStop = function() {
  var animBtn = document.getElementById('animation-stop');
  if (listenerId !== -1) {
    orchestre.removeListener(listenerId);
    listenerId = -1;
    animBtn.textContent = 'Start the animation';
  }
  else {
    listenerId = orchestre.onBeat(beat, 2, {repeat: true})
    animBtn.textContent = 'Pause the animation';
  }
}

window.pause = function() {
  if (orchestre.paused) {
    orchestre.resume();
  }
  else {
    orchestre.suspend();
  }
}

window.changeVolume = function(positive) {
  volume = volume + (positive ? 0.1 : -0.1);
  orchestre.setVolume(volume);
}
