import { gameConfig } from "./config.js";

const gameScaler = document.getElementById("gameScaler");
const game = document.getElementById("game");
const preloader = document.getElementById("preloader");
const preloaderLogo = document.getElementById("preloaderLogo");
const preloaderProgress = document.getElementById("preloaderProgress");
const overlay = document.getElementById("overlay");
const ctaPopup = document.getElementById("ctaPopup");
const ctaTitle = document.getElementById("ctaTitle");
const ctaText = document.getElementById("ctaText");
const ctaAmount = document.getElementById("ctaAmount");
const ctaButton = document.getElementById("ctaButton");
const ctaHint = document.getElementById("ctaHint");
const ctaCountdown = document.getElementById("ctaCountdown");
const ctaCountdownLabel = document.getElementById("ctaCountdownLabel");
const ctaCountdownTime = document.getElementById("ctaCountdownTime");

const scratchLogo = document.getElementById("scratchLogo");
const scratchCharacter = document.getElementById("scratchCharacter");
const scratchInfoPanelArt = document.getElementById("scratchInfoPanelArt");
const scratchCards = document.getElementById("scratchCards");
const scratchAmount = document.getElementById("scratchAmount");
const scratchSubtitle = document.getElementById("scratchSubtitle");
const scratchInfoNumber = document.getElementById("scratchInfoNumber");
const scratchInfoLabel = document.getElementById("scratchInfoLabel");
const scratchInstruction = document.getElementById("scratchInstruction");

const scratchConfig = gameConfig.scratch;
const scratchAssets = gameConfig.assets.scratch;
const cards = [];

let revealedCards = 0;
let isCtaQueued = false;
let activeScratchCard = null;
let ctaCountdownIntervalId = null;
let ctaCountdownEndTime = 0;

init();

function init() {
    applySceneAssets();
    setupCta();
    createScratchCards();
    resizeGame();
    window.addEventListener("resize", handleResize);

    preloadAssets().then(() => {
        preloader.classList.add("hidden");
    });
}

function applySceneAssets() {
    document.body.style.backgroundImage = `url("${scratchAssets.background}")`;
    preloaderLogo.src = scratchAssets.logo;
    scratchLogo.src = scratchAssets.logo;
    scratchCharacter.src = scratchAssets.character;
    scratchInfoPanelArt.src = scratchAssets.infoPanel;

    scratchAmount.textContent = scratchConfig.topAmount;
    scratchAmount.dataset.text = scratchConfig.topAmount;
    scratchSubtitle.textContent = scratchConfig.subtitle;
    scratchInfoNumber.textContent = scratchConfig.infoNumber;
    scratchInfoLabel.textContent = scratchConfig.infoText;
    scratchInstruction.textContent = scratchConfig.instruction;
}

function setupCta() {
    ctaTitle.textContent = gameConfig.cta.title;
    ctaAmount.textContent = gameConfig.cta.amount;
    ctaAmount.style.display = gameConfig.cta.amount ? "block" : "none";
    ctaText.innerHTML = gameConfig.cta.description
        ? gameConfig.cta.description.split("\n").map((line) => `<span>${escapeHtml(line)}</span>`).join("")
        : "";
    ctaButton.textContent = gameConfig.cta.buttonText;
    ctaHint.innerHTML = gameConfig.cta.hint
        ? gameConfig.cta.hint.split("\n").map((line) => `<span>${escapeHtml(line)}</span>`).join("")
        : "";
    ctaCountdownLabel.textContent = gameConfig.cta.countdownLabel;
    ctaCountdownTime.textContent = `${String(gameConfig.cta.countdownMinutes).padStart(2, "0")}:00`;
    ctaCountdown.style.display = gameConfig.cta.countdownEnabled === false ? "none" : "flex";

    ctaButton.addEventListener("click", goToOffer);
    overlay.addEventListener("click", goToOffer);
}

function createScratchCards() {
    scratchCards.innerHTML = "";

    for (let index = 0; index < 6; index++) {
        const card = document.createElement("button");
        card.className = "scratch-card";
        card.type = "button";
        card.setAttribute("aria-label", `Scratch card ${index + 1}`);

        card.innerHTML = `
            <div class="scratch-card-prize">
                <img class="scratch-card-win-art" src="${scratchAssets.cardWin}" alt="">
                <div class="scratch-prize-text">
                    <span>${scratchConfig.prizeLine1}</span>
                    <span>${scratchConfig.prizeLine2}</span>
                </div>
            </div>
            <canvas class="scratch-cover" width="300" height="420"></canvas>
            <div class="scratch-card-label">
                <span class="scratch-card-label-text">${scratchConfig.cardLabel}</span>
            </div>
        `;

        scratchCards.appendChild(card);

        const canvas = card.querySelector(".scratch-cover");
        const context = canvas.getContext("2d", { willReadFrequently: false });
        const state = {
            card,
            canvas,
            context,
            scratchedCells: new Set(),
            isPointerDown: false,
            isRevealed: false
        };

        cards.push(state);
        initScratchCover(state);
        bindScratchEvents(state);
    }

    fitScratchCardLabels();
}

function handleResize() {
    resizeGame();
    fitScratchCardLabels();
}

function fitScratchCardLabels() {
    const labels = Array.from(document.querySelectorAll(".scratch-card-label-text"));

    for (let index = 0; index < labels.length; index++) {
        fitTextInside(labels[index], 13, 20);
    }
}

function fitTextInside(element, minFontSize, maxFontSize) {
    const parent = element.parentElement;

    if (!parent) {
        return;
    }

    element.style.fontSize = `${maxFontSize}px`;

    const availableWidth = parent.clientWidth;

    if (availableWidth <= 0 || element.scrollWidth <= availableWidth) {
        return;
    }

    let low = minFontSize;
    let high = maxFontSize;
    let best = minFontSize;

    while (high - low > 0.25) {
        const mid = (low + high) / 2;
        element.style.fontSize = `${mid}px`;

        if (element.scrollWidth <= availableWidth) {
            best = mid;
            low = mid;
        } else {
            high = mid;
        }
    }

    element.style.fontSize = `${best}px`;
}

function initScratchCover(state) {
    const coverImage = new Image();

    coverImage.onload = () => {
        state.context.clearRect(0, 0, state.canvas.width, state.canvas.height);
        state.context.drawImage(coverImage, 0, 0, state.canvas.width, state.canvas.height);
    };

    coverImage.src = scratchAssets.cardCover;
}

function bindScratchEvents(state) {
    state.card.addEventListener("pointerdown", (event) => {
        if (!canScratch(state)) {
            return;
        }

        unlockAudio();
        state.isPointerDown = true;
        state.card.setPointerCapture(event.pointerId);
        scratchAtPointer(state, event);
    });

    state.card.addEventListener("pointermove", (event) => {
        if (!state.isPointerDown || !canScratch(state)) {
            return;
        }

        scratchAtPointer(state, event);
    });

    state.card.addEventListener("pointerup", (event) => {
        if (state.card.hasPointerCapture(event.pointerId)) {
            state.card.releasePointerCapture(event.pointerId);
        }

        state.isPointerDown = false;

        if (canScratch(state) && state.scratchedCells.size >= 6) {
            revealCard(state);
        }
    });

    state.card.addEventListener("pointercancel", () => {
        state.isPointerDown = false;
    });
}

function canScratch(state) {
    return (
        !state.isRevealed &&
        revealedCards < scratchConfig.cardsToReveal &&
        !isCtaQueued &&
        (!activeScratchCard || activeScratchCard === state)
    );
}

function scratchAtPointer(state, event) {
    event.preventDefault();

    if (!activeScratchCard) {
        activeScratchCard = state;
    }

    const rect = state.canvas.getBoundingClientRect();
    const scaleX = state.canvas.width / rect.width;
    const scaleY = state.canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const radius = 38;

    state.context.globalCompositeOperation = "destination-out";
    state.context.beginPath();
    state.context.arc(x, y, radius, 0, Math.PI * 2);
    state.context.fill();
    state.context.globalCompositeOperation = "source-over";

    const cellX = Math.floor(x / 36);
    const cellY = Math.floor(y / 36);
    state.scratchedCells.add(`${cellX}:${cellY}`);

    if (state.scratchedCells.size >= 16) {
        revealCard(state);
    }
}

function revealCard(state) {
    if (state.isRevealed) {
        return;
    }

    state.isRevealed = true;
    revealedCards++;
    activeScratchCard = null;

    state.context.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.card.classList.add("revealed");

    playCardWinSound();

    playDomCoinBurst(state.card);

    if (revealedCards >= scratchConfig.cardsToReveal) {
        queueCta();
    }
}

function unlockAudio() {
    if (window.unlockSfx) {
        window.unlockSfx();
    }

    if (window.primeSfx) {
        window.primeSfx(["smallWin", "jackpot"]);
    }
}

function playCardWinSound() {
    if (!window.playSfx) {
        return;
    }

    requestAnimationFrame(() => {
        window.playSfx("smallWin");
    });
}

function playDomCoinBurst(card) {
    const rect = card.getBoundingClientRect();
    const count = 10;

    for (let index = 0; index < count; index++) {
        const coin = document.createElement("div");
        const angle = -Math.PI + Math.random() * Math.PI;
        const distance = 58 + Math.random() * 82;
        const flyX = Math.cos(angle) * distance;
        const flyY = Math.sin(angle) * distance - Math.random() * 34;
        const fallY = 56 + Math.random() * 82;
        const size = 22 + Math.random() * 9;

        coin.className = "scratch-fx-coin";
        coin.textContent = gameConfig.currency.effectCoinText;
        coin.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.36}px`;
        coin.style.top = `${rect.top + rect.height * 0.42 + (Math.random() - 0.5) * rect.height * 0.28}px`;
        coin.style.width = `${size}px`;
        coin.style.height = `${size}px`;
        coin.style.fontSize = `${size * 0.62}px`;
        coin.style.setProperty("--coin-fly-x", `${flyX}px`);
        coin.style.setProperty("--coin-fly-y", `${flyY}px`);
        coin.style.setProperty("--coin-fall-y", `${fallY}px`);
        const rotation = Math.random() * 520 - 260;
        coin.style.setProperty("--coin-rotate", `${rotation}deg`);
        coin.style.setProperty("--coin-rotate-end", `${rotation * 1.7}deg`);
        coin.style.animationDelay = `${index * 8}ms`;

        document.body.appendChild(coin);
        coin.addEventListener("animationend", () => coin.remove(), { once: true });
    }
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function queueCta() {
    if (isCtaQueued) {
        return;
    }

    isCtaQueued = true;
    scratchCards.classList.add("locked");

    setTimeout(playBigWinEffects, scratchConfig.bigWinDelay);
    setTimeout(showCta, scratchConfig.bigWinDelay + scratchConfig.ctaDelay);
}

function playBigWinEffects() {
    if (window.playSfx) {
        window.playSfx("jackpot");
    }

    if (window.playJackpotFx) {
        window.playJackpotFx();
    }
}

function showCta() {
    startCtaCountdown();
    overlay.classList.remove("show");
    ctaPopup.classList.remove("show");
    overlay.style.display = "block";
    ctaPopup.style.display = "flex";

    overlay.offsetHeight;
    ctaPopup.offsetHeight;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add("show");
            ctaPopup.classList.add("show");
        });
    });
}

function startCtaCountdown() {
    if (gameConfig.cta.countdownEnabled === false) {
        return;
    }

    clearInterval(ctaCountdownIntervalId);
    ctaCountdownEndTime = Date.now() + gameConfig.cta.countdownMinutes * 60 * 1000;
    updateCtaCountdown();
    ctaCountdownIntervalId = setInterval(updateCtaCountdown, 1000);
}

function updateCtaCountdown() {
    const remainingMs = Math.max(0, ctaCountdownEndTime - Date.now());
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    ctaCountdownTime.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function goToOffer() {
    if (!gameConfig.offer.url) {
        return;
    }

    window.location.href = gameConfig.offer.url;
}

function preloadAssets() {
    const imageSources = [
        scratchAssets.background,
        scratchAssets.logo,
        scratchAssets.character,
        scratchAssets.infoPanel,
        scratchAssets.cardCover,
        scratchAssets.cardWin
    ];

    const imagePromises = imageSources.map(loadImage);
    const fxPromise = initScratchFx();
    const sfxPromise = window.preloadSfx ? window.preloadSfx() : Promise.resolve();

    let loaded = 0;
    const total = imagePromises.length + 2;

    const track = (promise) => promise.finally(() => {
        loaded++;
        preloaderProgress.style.width = `${Math.round((loaded / total) * 100)}%`;
    });

    return Promise.all([...imagePromises.map(track), track(fxPromise), track(sfxPromise)]);
}

async function initScratchFx() {
    if (!window.initFx) {
        return;
    }

    await window.initFx();

    if (window.preloadFx) {
        await window.preloadFx();
    }
}

function loadImage(src) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = resolve;
        image.src = src;
    });
}

function resizeGame() {
    const scaleX = window.innerWidth / gameConfig.scene.baseWidth;
    const scaleY = window.innerHeight / gameConfig.scene.baseHeight;
    const scale = Math.min(scaleX, scaleY, gameConfig.scene.maxScale);

    gameScaler.style.width = `${gameConfig.scene.baseWidth}px`;
    gameScaler.style.height = `${gameConfig.scene.baseHeight}px`;
    gameScaler.style.transform = `scale(${scale})`;
    game.style.width = `${gameConfig.scene.baseWidth}px`;
    game.style.height = `${gameConfig.scene.baseHeight}px`;
}
