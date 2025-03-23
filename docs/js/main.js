// Metronome variables
let currentNoteTime = 0;
let tempo = 60;
let lookahead = 25.0;
let scheduleAheadTime = 0.1;
let nextNoteTime = 0.0;
let timerID = null;

// State variables
let speed = 60;
let backgroundSound = true;
let backgroundVolume = 50;

// Update functions
function updateSpeed(value) {
    speed = parseInt(value);
}

function updateBackgroundSound(checked) {
    backgroundSound = checked;
}

function updateVolume(value) {
    backgroundVolume = parseInt(value);
    if (backgroundGain) {
        backgroundGain.gain.value = backgroundVolume / 100;
    }
}

function nextNote() {
    const secondsPerBeat = 60.0 / speed;
    nextNoteTime += secondsPerBeat;
    currentNoteTime++;
}

function scheduleNote(beatNumber, time) {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (beatNumber % 4 === 0) {
        osc.frequency.value = 1000;
    } else {
        osc.frequency.value = 800;
    }

    gainNode.gain.value = 1;
    gainNode.gain.exponentialRampToValueAtTime(1, time + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.start(time);
    osc.stop(time + 0.03);
}

function scheduler() {
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
        scheduleNote(currentNoteTime, nextNoteTime);
        nextNote();
    }
    timerID = window.setTimeout(scheduler, lookahead);
}

function play() {
    if (isPlaying) return;

    if (audioContext === null) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        loadRainSound();
    }

    isPlaying = true;
    currentNoteTime = 0;
    nextNoteTime = audioContext.currentTime + 0.05;
    startBackgroundSound();
    scheduler();
    
    document.getElementById('playButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
}

function stop() {
    isPlaying = false;
    window.clearTimeout(timerID);
    stopBackgroundSound();
    
    document.getElementById('playButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
}

// Initialize audio context on first user interaction
document.addEventListener('click', function() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        loadRainSound();
    }
}, { once: true }); 