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

let orchestre;
let volume = 1;
let listenerId = -1;

try {
   orchestre = new Orchestre(120);
}
catch(err) {
  window.addEventListener('load', () => {
    document.getElementById('error').className = '';
    document.getElementById('startButton').className = 'hidden';
    document.getElementById('demo').className = '';
    throw new Error(err);
  }, false);
}

window.start = function() {
  document.getElementById('startButton').className = 'hidden';
  document.getElementById('loading').className = '';
    document.getElementsByTagName('footer')[0].className = 'down';
  orchestre.addPlayers(players).then(() => {
    orchestre.start(['drum']);
    document.getElementById('loading').className = 'hidden';
    document.getElementById('demo').className = '';
    document.getElementById('control').className = '';
    document.getElementsByTagName('footer')[0].className = '';
    listenerId = orchestre.onBeat(beat, 2, {repeat: true})
  }).catch((err) => {
    document.getElementById('loading').className = 'hidden';
    document.getElementById('error').className = '';
    document.getElementById('demo').className = '';
    document.getElementsByTagName('footer')[0].className = '';
    throw new Error(err);
  });
}

window.bass = function() {
  orchestre.toggle('bass', {
    fade: 0.01
  });
  document.getElementById('bass-btn').className = orchestre.isPlaying('bass') ? 'active' : '';
  document.getElementById('bass-btn').setAttribute('aria-pressed', orchestre.isPlaying('bass'));
};
window.piano = function() {
  orchestre.toggle('piano', {
    fade: 0.01
  });
  document.getElementById('piano-btn').className = orchestre.isPlaying('piano') ? 'active' : '';
  document.getElementById('piano-btn').setAttribute('aria-pressed', orchestre.isPlaying('piano'));
};
window.melody = function() {
  orchestre.toggle('melody', {
    fade: 0.02
  });
  document.getElementById('melody-btn').className = orchestre.isPlaying('melody') ? 'active' : '';
  document.getElementById('melody-btn').setAttribute('aria-pressed', orchestre.isPlaying('melody'));
};
window.organ = function() {
  orchestre.toggle('organ', {
    fade: 0.02
  });
  document.getElementById('organ-btn').className = orchestre.isPlaying('organ') ? 'active' : '';
  document.getElementById('organ-btn').setAttribute('aria-pressed', orchestre.isPlaying('organ'));
};
window.synth = function() {
  orchestre.toggle('synth', {
    fade: 1.2,
    now: true
  });
  document.getElementById('synth-btn').className = orchestre.isPlaying('synth') ? 'active' : '';
  document.getElementById('synth-btn').setAttribute('aria-pressed', orchestre.isPlaying('synth'));
};
window.jingle = function() {
  orchestre.toggle('jingle', {
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
  orchestre.toggle('doremi', {
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
  beatElem.className = beatElem.className === 'on' ? 'off' : 'on';
  var beatText = document.getElementById('beat-text');
  beatText.textContent = beatText.textContent === 'on' ? 'off' : 'on';
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
    animBtn.textContent = 'Stop the animation';
  }
}

window.pause = function() {
  const icon = document.getElementById('pause-icon');
  if (orchestre.paused) {
    orchestre.resume();
    icon.setAttribute('src','./assets/pause.svg');
    icon.setAttribute('alt','Pause');
  }
  else {
    orchestre.suspend();
    icon.setAttribute('src','./assets/play.svg');
    icon.setAttribute('alt','Play');
  }
}

window.changeVolume = function(positive) {
  volume = volume + (positive ? 0.1 : -0.1);
  if (volume <= 0) {
    volume = 0;
    document.getElementById('vol-down-btn').setAttribute('disabled', true);
    document.getElementById('vol-down-btn').className = 'disabled';
  }
  else if (volume >= 1) {
    volume = 1;
    document.getElementById('vol-up-btn').setAttribute('disabled', true);
    document.getElementById('vol-up-btn').className = 'disabled';
  }
  else {
    for (let btnId of ['vol-down-btn', 'vol-up-btn']) {
      document.getElementById(btnId).removeAttribute('disabled');
      document.getElementById(btnId).className = '';
    }
  }
  
  orchestre.setVolume(volume);

}
