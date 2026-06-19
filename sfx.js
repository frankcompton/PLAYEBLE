import { gameConfig } from "./config.js";

const sfxPlayers = {};
const sfxFadeTimers = {};

let sfxUnlocked = false;
let sfxInitialized = false;

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
        loadPromises.push(preloadAudio(sfxPlayers[soundName]));
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

function unlockSfx() {
    if (sfxUnlocked) {
        return;
    }

    sfxUnlocked = true;

    for (const soundName in sfxPlayers) {
        const audio = sfxPlayers[soundName];

        audio.load();
        audio.volume = getSfxVolume(soundName);
    }
}

function playSfx(soundName) {
    if (!gameConfig.sfx || !gameConfig.sfx.enabled) {
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
window.playSfx = playSfx;
window.stopSfx = stopSfx;

initSfx();

function stopSfx(soundName, fadeDuration = 80) {
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
