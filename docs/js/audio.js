// Audio Context and state
let audioContext = null;
let isPlaying = false;

// Rain sound variables
let rainBuffer = null;
let rainSource = null;
let backgroundGain = null;

// Load rain sound
async function loadRainSound() {
    if (rainBuffer) return; // Already loaded
    
    try {
        const response = await fetch('assets/light-rain-109591.mp3');
        const arrayBuffer = await response.arrayBuffer();
        rainBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error('Error loading rain sound:', error);
    }
}

function startBackgroundSound() {
    if (!backgroundSound || !rainBuffer) return;
    
    rainSource = audioContext.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;
    
    backgroundGain = audioContext.createGain();
    backgroundGain.gain.value = backgroundVolume / 100;
    
    rainSource.connect(backgroundGain);
    backgroundGain.connect(audioContext.destination);
    
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