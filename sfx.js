import { gameConfig } from "./config.js";

const sfxPlayers = {};
const sfxFadeTimers = {};
const decodedBuffers = {};
const activeBufferNodes = {};

let sfxUnlocked = false;
let sfxInitialized = false;
let audioContext = null;

function initSfx() {
    if (sfxInitialized) {
        return;
    }

    sfxInitialized = true;

    if (!gameConfig.sfx || !gameConfig.sfx.enabled) {
        return;
    }

    const sounds = gameConfig.sfx.sounds;

    for (const soundName in sounds) {
        const soundConfig = sounds[soundName];

        if (!soundConfig.src) {
            continue;
        }

        const audio = new Audio(soundConfig.src);

        audio.preload = "auto";
        audio.volume = getSfxVolume(soundName);

        sfxPlayers[soundName] = audio;
    }
}

function preloadSfx() {
    initSfx();

    const loadPromises = [];

    for (const soundName in sfxPlayers) {
        loadPromises.push(
            preloadAudio(sfxPlayers[soundName]),
            decodeSoundBuffer(soundName)
        );
    }

    return Promise.all(loadPromises);
}

function preloadAudio(audio) {
    return new Promise((resolve) => {
        const finish = () => {
            audio.removeEventListener("canplaythrough", finish);
            audio.removeEventListener("loadeddata", finish);
            audio.removeEventListener("error", finish);
            resolve();
        };

        if (audio.readyState >= 3) {
            resolve();
            return;
        }

        audio.addEventListener("canplaythrough", finish, { once: true });
        audio.addEventListener("loadeddata", finish, { once: true });
        audio.addEventListener("error", finish, { once: true });

        try {
            audio.load();
        } catch {
            resolve();
        }
    });
}

function getSfxVolume(soundName) {
    const masterVolume = gameConfig.sfx.masterVolume ?? 1;
    const soundVolume = gameConfig.sfx.sounds[soundName]?.volume ?? 1;

    return masterVolume * soundVolume;
}

function getAudioContext() {
    if (audioContext) {
        return audioContext;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        return null;
    }

    audioContext = new AudioContextClass();
    return audioContext;
}

async function resumeAudioContext() {
    const context = getAudioContext();

    if (!context || context.state === "running") {
        return context;
    }

    try {
        await context.resume();
    } catch {
        // Ignore resume failures; HTMLAudio fallback still works.
    }

    return context;
}

function unlockSfx() {
    if (sfxUnlocked) {
        return;
    }

    sfxUnlocked = true;
    void resumeAudioContext();
}

function primeSfx(soundNames = []) {
    initSfx();

    const names = soundNames.length > 0 ? soundNames : Object.keys(sfxPlayers);

    return Promise.all(names.map((soundName) => decodeSoundBuffer(soundName)));
}

function decodeSoundBuffer(soundName) {
    if (decodedBuffers[soundName]) {
        return Promise.resolve(decodedBuffers[soundName]);
    }

    const audio = sfxPlayers[soundName];

    if (!audio || !audio.src) {
        return Promise.resolve(null);
    }

    const context = getAudioContext();

    if (!context) {
        return Promise.resolve(null);
    }

    return fetch(audio.src)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${soundName}`);
            }

            return response.arrayBuffer();
        })
        .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
        .then((buffer) => {
            decodedBuffers[soundName] = buffer;
            return buffer;
        })
        .catch(() => null);
}

function playDecodedSfx(soundName) {
    const buffer = decodedBuffers[soundName];
    const context = getAudioContext();

    if (!buffer || !context) {
        return false;
    }

    stopDecodedSfx(soundName, 0);

    const source = context.createBufferSource();
    const gainNode = context.createGain();

    gainNode.gain.value = getSfxVolume(soundName);
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);

    activeBufferNodes[soundName] = {
        source,
        gainNode,
        stopTimer: null
    };

    source.onended = () => {
        if (activeBufferNodes[soundName]?.source === source) {
            delete activeBufferNodes[soundName];
        }
    };

    try {
        source.start(0);
        return true;
    } catch {
        delete activeBufferNodes[soundName];
        return false;
    }
}

function stopDecodedSfx(soundName, fadeDuration = 80) {
    const activeNode = activeBufferNodes[soundName];

    if (!activeNode) {
        return false;
    }

    const context = activeNode.source.context;
    const now = context.currentTime;

    if (activeNode.stopTimer) {
        clearTimeout(activeNode.stopTimer);
        activeNode.stopTimer = null;
    }

    if (fadeDuration <= 0) {
        try {
            activeNode.source.stop();
        } catch {
            // Ignore already-stopped nodes.
        }
        delete activeBufferNodes[soundName];
        return true;
    }

    activeNode.gainNode.gain.cancelScheduledValues(now);
    activeNode.gainNode.gain.setValueAtTime(activeNode.gainNode.gain.value, now);
    activeNode.gainNode.gain.linearRampToValueAtTime(0, now + fadeDuration / 1000);

    activeNode.stopTimer = setTimeout(() => {
        try {
            activeNode.source.stop();
        } catch {
            // Ignore already-stopped nodes.
        }

        delete activeBufferNodes[soundName];
    }, fadeDuration + 20);

    return true;
}

function playSfx(soundName) {
    if (!gameConfig.sfx || !gameConfig.sfx.enabled) {
        return;
    }

    if (playDecodedSfx(soundName)) {
        return;
    }

    const audio = sfxPlayers[soundName];

    if (!audio) {
        return;
    }

    if (sfxFadeTimers[soundName]) {
        clearInterval(sfxFadeTimers[soundName]);
        sfxFadeTimers[soundName] = null;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.volume = getSfxVolume(soundName);

    const playPromise = audio.play();

    if (playPromise) {
        playPromise.catch(() => {
            // Браузер мог заблокировать звук до первого клика.
        });
    }
}

window.initSfx = initSfx;
window.preloadSfx = preloadSfx;
window.unlockSfx = unlockSfx;
window.primeSfx = primeSfx;
window.playSfx = playSfx;
window.stopSfx = stopSfx;

initSfx();

function stopSfx(soundName, fadeDuration = 80) {
    if (stopDecodedSfx(soundName, fadeDuration)) {
        return;
    }

    const audio = sfxPlayers[soundName];

    if (!audio) {
        return;
    }

    if (sfxFadeTimers[soundName]) {
        clearInterval(sfxFadeTimers[soundName]);
        sfxFadeTimers[soundName] = null;
    }

    if (fadeDuration <= 0) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = getSfxVolume(soundName);
        return;
    }

    const startVolume = audio.volume;
    const stepTime = 16;
    const steps = Math.max(1, Math.round(fadeDuration / stepTime));
    let currentStep = 0;

    sfxFadeTimers[soundName] = setInterval(() => {
        currentStep++;

        const progress = currentStep / steps;
        audio.volume = startVolume * (1 - progress);

        if (currentStep >= steps) {
            clearInterval(sfxFadeTimers[soundName]);
            sfxFadeTimers[soundName] = null;

            audio.pause();
            audio.currentTime = 0;
            audio.volume = getSfxVolume(soundName);
        }
    }, stepTime);
}
