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
        // Ensure audio context exists
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume audio context if it's suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        // Get current script path and go up to root
        const currentPath = window.location.pathname;

        const response = await fetch(`${currentPath}assets/light-rain-109591.mp3`);
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