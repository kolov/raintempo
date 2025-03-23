// Audio Context
let audioContext = null;
let isPlaying = false;
let currentNoteTime = 0;
let tempo = 60;
let lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
let scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
let nextNoteTime = 0.0; // when the next note is due
let timerID = null;
let oscillator = null;
let gainNode = null;

// Background sound variables
let rainBuffer = null;
let rainSource = null;
let backgroundGain = null;

// Load rain sound
async function loadRainSound() {
    if (rainBuffer) return; // Already loaded
    
    try {
        const response = await fetch('light-rain-109591.mp3');
        const arrayBuffer = await response.arrayBuffer();
        rainBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error('Error loading rain sound:', error);
    }
}

function nextNote() {
    // Advance current note and time by a quarter note
    const secondsPerBeat = 60.0 / speed;
    nextNoteTime += secondsPerBeat; // Add beat length to last beat time
    currentNoteTime++;
}

function scheduleNote(beatNumber, time) {
    // Create oscillator and gain node for the click
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set click sound properties
    if (beatNumber % 4 === 0) {
        osc.frequency.value = 1000; // Higher pitch for first beat
    } else {
        osc.frequency.value = 800; // Normal pitch for other beats
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

function startBackgroundSound() {
    if (!backgroundSound || !rainBuffer) return;
    
    // Create audio source from buffer
    rainSource = audioContext.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;
    
    // Create gain node for volume control
    backgroundGain = audioContext.createGain();
    backgroundGain.gain.value = backgroundVolume / 100;
    
    // Connect nodes
    rainSource.connect(backgroundGain);
    backgroundGain.connect(audioContext.destination);
    
    // Start the sound
    rainSource.start();
}

function stopBackgroundSound() {
    if (rainSource) {
        rainSource.stop();
        rainSource.disconnect();
        rainSource = null;
        backgroundGain.disconnect();
        backgroundGain = null;
    }
}

function play() {
    if (isPlaying) return;

    if (audioContext === null) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        loadRainSound(); // Load the rain sound when audio context is created
    }

    isPlaying = true;
    currentNoteTime = 0;
    nextNoteTime = audioContext.currentTime + 0.05;
    startBackgroundSound();
    scheduler();
    
    // Update button states
    document.getElementById('playButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
}

function stop() {
    isPlaying = false;
    window.clearTimeout(timerID);
    stopBackgroundSound();
    
    // Update button states
    document.getElementById('playButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
}

// Initialize audio context on first user interaction
document.addEventListener('click', function() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}, { once: true });