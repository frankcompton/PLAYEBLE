import { gameConfig } from "./config.js";

// Elements
const spinBtn = document.getElementById("spinBtn");
const topWinPanel = document.getElementById("topWinPanel");
const topWinPanelArt = document.getElementById("topWinPanelArt");
const slotArea = document.getElementById("slotArea");
const slotFrameImg = document.getElementById("slotFrameImg");
const gameLogo = document.getElementById("gameLogo");
const sceneZeus = document.getElementById("sceneZeus");
const ctaPopup = document.getElementById("ctaPopup");
const ctaTitle = document.getElementById("ctaTitle");
const ctaAmount = document.getElementById("ctaAmount");
const ctaButton = document.getElementById("ctaButton");
const ctaCountdownLabel = document.getElementById("ctaCountdownLabel");
const ctaCountdownTime = document.getElementById("ctaCountdownTime");
const overlay = document.getElementById("overlay");
const topWinPanelText = document.getElementById("topWinPanelText");
const freeSpinsValue = document.getElementById("freeSpinsValue");
const postSpinActions = document.getElementById("postSpinActions");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const tapHand = document.getElementById("tapHand");
const bottomControls = document.getElementById("bottomControls");
const reelElements = Array.from(document.querySelectorAll("#reels > div"));
const reelStrips = Array.from(document.querySelectorAll("#reels > div > div"));
const gameScaler = document.getElementById("gameScaler");
const preloader = document.getElementById("preloader");
const preloaderLogo = document.getElementById("preloaderLogo");
const preloaderProgress = document.getElementById("preloaderProgress");

// State
let spinCount = 0;
let isSpinning = false;
let isCtaActive = false;
let currentBalance = 0;
let currentFreeSpins = 0;
let currentSpinSfx = null;
let ctaCountdownIntervalId = null;
let ctaCountdownEndTime = 0;
const DEFAULT_SYMBOL_HEIGHT = 82;
let cachedSymbolHeight = DEFAULT_SYMBOL_HEIGHT;
let balancePopFrameId = null;
let balancePopTimeoutId = null;
let balancePulseFrameId = null;
let anticipationFrameId = null;
let anticipationPulseReelIndex = null;

// Settings
const CTA_DELAY = gameConfig.timings.ctaDelay;

const SMALL_WIN_GLOW_DURATION = gameConfig.timings.smallWinGlowDuration;

const GRID_COLUMNS = gameConfig.grid.columns;
const VISIBLE_ROWS = gameConfig.grid.rows;
const SPIN_FILLER_COUNT = gameConfig.grid.fillerCount;

const REEL_SPIN_BASE_DURATION = gameConfig.timings.reelSpinBaseDuration;
const REEL_SPIN_STEP_DURATION = gameConfig.timings.reelSpinStepDuration;

const WIN_REEL_GLOW_DURATION = gameConfig.timings.winReelGlowDuration;

const COIN_PARTICLE_COUNT = gameConfig.effects.coinParticleCount;
const COIN_PARTICLE_DURATION = gameConfig.effects.coinParticleDuration;

const WIN_SYMBOL_POP_DURATION = gameConfig.timings.winSymbolPopDuration;
const JACKPOT_FLASH_DURATION = gameConfig.timings.jackpotFlashDuration;
const CTA_AMOUNT_FIT_MAX_FONT_SIZE = 200;
const CTA_AMOUNT_FIT_MIN_FONT_SIZE = 18;
let billRainActive = false;
let billRainTimeoutIds = [];
let lightningIntervalId = null;

function addClasses(element, ...classNames) {
    element.classList.add(...classNames);
}

function removeClasses(element, ...classNames) {
    element.classList.remove(...classNames);
}

function setDisplayed(element, display) {
    element.style.display = display;
}

function refreshCachedSymbolHeight() {
    const symbolHeight = parseFloat(
        getComputedStyle(slotArea).getPropertyValue("--symbol-height")
    );

    if (Number.isFinite(symbolHeight) && symbolHeight > 0) {
        cachedSymbolHeight = symbolHeight;
    }
}

function fitTextToWidth(element, minFontSize, maxFontSize) {
    if (!element) {
        return;
    }

    const parent = element.parentElement;
    if (!parent) {
        return;
    }

    const availableWidth = element.clientWidth || parent.clientWidth;
    if (availableWidth <= 0) {
        return;
    }

    const originalDisplay = element.style.display;
    const originalWidth = element.style.width;
    const originalWhiteSpace = element.style.whiteSpace;
    const originalWordBreak = element.style.wordBreak;
    const originalOverflowWrap = element.style.overflowWrap;

    element.style.display = "block";
    element.style.width = "100%";
    element.style.whiteSpace = "nowrap";
    element.style.wordBreak = "keep-all";
    element.style.overflowWrap = "normal";

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
    element.style.display = originalDisplay;
    element.style.width = originalWidth;
    element.style.whiteSpace = originalWhiteSpace;
    element.style.wordBreak = originalWordBreak;
    element.style.overflowWrap = originalOverflowWrap;
}

function fitAmountText() {
    if (gameConfig.cta.amount.includes("<br")) {
        return;
    }

    fitTextToWidth(ctaAmount, CTA_AMOUNT_FIT_MIN_FONT_SIZE, CTA_AMOUNT_FIT_MAX_FONT_SIZE);
}


// Data
const startScreenReels = gameConfig.startScreen;
const outcomes = gameConfig.spins;
const symbolMap = gameConfig.assets.symbols;
const reelSymbols = gameConfig.reelSymbols;

// Functions
function lockSpinButton() {
    isSpinning = true;
    addClasses(spinBtn, "disabled");
    addClasses(tryAgainBtn, "disabled");
}

function unlockSpinButton() {
    removeClasses(spinBtn, "disabled");
    if (spinCount > 0 && spinCount < outcomes.length) {
        removeClasses(tryAgainBtn, "disabled");
    }
    isSpinning = false;
}
function showJackpot(outcome) {

    if (window.setMusicDucked) {
        window.setMusicDucked(true);
    }

    if (window.playSfx) {
        window.playSfx("jackpot");
    }

    if (window.playJackpotFx) {
        window.playJackpotFx();
    }

    playLightningBurst(gameConfig.effects.lightningWinCount || 5, true);

    addClasses(slotArea, "jackpot-state", "jackpot-flash");

    highlightWinReels(outcome);
    highlightWinSymbols(outcome);
    spawnBillsFromWinSymbols(outcome, gameConfig.effects.billsPerJackpotSymbol || 5);
    startBillRain();

    setTimeout(() => {
        removeClasses(slotArea, "jackpot-flash");
    }, JACKPOT_FLASH_DURATION);

    setTimeout(() => {
        showCta();
    }, outcome.balanceDelay + outcome.balanceCountDuration + CTA_DELAY);
}


function getRandomSymbol() {
    return reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function createLightningStrike(isWinStrike = false) {
    const effects = gameConfig.effects;
    const lightningSrc = effects.lightningAsset || gameConfig.assets.lightning;

    if (!effects.lightningEnabled || !lightningSrc) {
        return;
    }

    const lightning = document.createElement("img");
    const minWidth = isWinStrike ? effects.lightningWinWidthMin : effects.lightningAmbientWidthMin;
    const maxWidth = isWinStrike ? effects.lightningWinWidthMax : effects.lightningAmbientWidthMax;
    const width = getRandomNumber(minWidth, maxWidth);
    const left = getRandomNumber(-25, 0);
    const top = effects.lightningTop ?? 0;
    const rotation = getRandomNumber(-16, 16);
    const flip = Math.random() > 0.5 ? -1 : 1;
    const duration = effects.lightningDuration || 520;

    lightning.src = lightningSrc;
    lightning.alt = "";
    lightning.setAttribute("aria-hidden", "true");
    addClasses(lightning, "lightning-strike");

    if (isWinStrike) {
        addClasses(lightning, "strong");
    }

    lightning.style.setProperty("--lightning-left", `${left}vw`);
    lightning.style.setProperty("--lightning-top", `${top}px`);
    lightning.style.setProperty("--lightning-width", `${width}px`);
    lightning.style.setProperty("--lightning-rotation", `${rotation}deg`);
    lightning.style.setProperty("--lightning-flip", flip);
    lightning.style.setProperty("--lightning-duration", `${duration}ms`);

    gameScaler.appendChild(lightning);

    if (window.playSfx) {
        window.playSfx("thunderSingleHit");
    }

    setTimeout(() => {
        lightning.remove();
    }, duration + 120);
}

function playLightningBurst(count, isWinStrike = false) {
    const effects = gameConfig.effects;

    if (!effects.lightningEnabled) {
        return;
    }

    const strikeCount = count || (isWinStrike ? effects.lightningWinCount : effects.lightningAmbientCount);
    const stagger = isWinStrike ? effects.lightningWinStagger || 95 : 0;

    for (let i = 0; i < strikeCount; i++) {
        setTimeout(() => {
            createLightningStrike(isWinStrike);
        }, i * stagger);
    }
}

function startAmbientLightning() {
    const effects = gameConfig.effects;

    if (!effects.lightningEnabled || lightningIntervalId !== null) {
        return;
    }

    lightningIntervalId = setInterval(() => {
        if (!isCtaActive) {
            playLightningBurst(effects.lightningAmbientCount || 1, false);
        }
    }, effects.lightningInterval || 3000);
}

function startSpin() {
    removeClasses(spinBtn, "spin-idle");
    removeClasses(slotArea, "jackpot-state", "jackpot-flash", "small-win");
    clearWinSymbols();
    hideTapHand();
    removeClasses(tryAgainBtn, "disabled");
    spinCount = spinCount + 1;

    if (spinCount > outcomes.length) {
        spinCount = outcomes.length;
        return;
    }

    const currentOutcome = outcomes[spinCount - 1];

    currentSpinSfx = currentOutcome.spinSfx || null;

    if (currentSpinSfx && window.playSfx) {
        window.playSfx(currentSpinSfx);
    }

    if (window.playSfx) {
        window.playSfx("spin");
    }

    startSpinVisuals();

    prepareReelsForSpin(currentOutcome);
    animateReelsToResult(currentOutcome);
}
function handleCtaClick() {
    const delivery = gameConfig.delivery || {};
    const platform = gameConfig.platform || delivery;
    const source = platform.source || delivery.source || "";
    const ctaMode = delivery.ctaMode || "unity";
    const fallbackUrl = gameConfig.unity?.fallbackUrl || "";

    if (source === "snapchat" || ctaMode === "snapchat") {
        if (typeof window.snapchatCta === "function") {
            window.snapchatCta();
            return;
        }

        console.log("Snapchat CTA clicked");
        return;
    }

    if (ctaMode === "unity" || ctaMode === "mraid") {
        if (window.mraid && typeof window.mraid.open === "function") {
            window.mraid.open();
            console.log("Unity CTA click: mraid.open()");
            return;
        }

        if (fallbackUrl) {
            window.open(fallbackUrl, "_blank");
            console.log("Unity CTA click fallback: window.open()");
            return;
        }

        console.log("Unity CTA click fallback: missing fallbackUrl");
        return;
    }

    if (window.FbPlayableAd && typeof window.FbPlayableAd.onCTAClick === "function") {
        window.FbPlayableAd.onCTAClick();
        return;
    }

    console.log("Moloco CTA click");
}

window.handleCtaClick = handleCtaClick;

function showInitialSpinButton() {
    setDisplayed(spinBtn, "flex");
    removeClasses(postSpinActions, "show");
    postSpinActions.setAttribute("aria-hidden", "true");
    showTapHand("unlock");
}

function showPostSpinActions() {
    setDisplayed(spinBtn, "none");
    addClasses(postSpinActions, "show");
    postSpinActions.setAttribute("aria-hidden", "false");

    if (spinCount >= outcomes.length) {
        addClasses(tryAgainBtn, "disabled");
        hideTapHand();
    } else {
        removeClasses(tryAgainBtn, "disabled");
        showTapHand("try-again");
    }
}

function showTapHand(mode = "unlock") {
    if (!tapHand) {
        return;
    }

    removeClasses(tapHand, "hidden");
    if (bottomControls) {
        removeClasses(bottomControls, "hand-hidden", "hand-unlock", "hand-try-again");
        addClasses(bottomControls, mode === "try-again" ? "hand-try-again" : "hand-unlock");
    }
}

function hideTapHand() {
    if (!tapHand) {
        return;
    }

    addClasses(tapHand, "hidden");
    if (bottomControls) {
        removeClasses(bottomControls, "hand-unlock", "hand-try-again");
        addClasses(bottomControls, "hand-hidden");
    }
}

function startSpinVisuals() {
    lockSpinButton();

    if (window.playSpinStartFx) {
        window.playSpinStartFx();
    }

}

function showSmallWin(outcome) {
    if (window.playSfx) {
        window.playSfx("smallWin");
    }

    playLightningBurst(gameConfig.effects.lightningWinCount || 5, true);

    const winReels = outcome.winReels || [];

    if (window.playSmallWinFx) {
        window.playSmallWinFx(winReels);
    }

    if (gameConfig.effects.slotWinGlowEnabled) {
        addClasses(slotArea, "small-win");
    }

    for (let i = 0; i < winReels.length; i++) {
        const reelIndex = winReels[i];

        if (gameConfig.effects.reelWinGlowEnabled) {
            highlightReel(reelIndex);
        }
    }

    highlightWinSymbols(outcome);

    if (gameConfig.effects.coinParticlesEnabled) {
        spawnCoinParticlesFromWinCoins(outcome);
    }

    spawnBillsFromWinSymbols(outcome, gameConfig.effects.billsPerSmallWinSymbol || 1);
}

function handleOutcomeType(outcome) {
    if (outcome.type !== "jackpot" && currentSpinSfx && window.stopSfx) {
        window.stopSfx(currentSpinSfx, 80);
        currentSpinSfx = null;
    }

    if (outcome.type === "lose") {
        if (window.playSfx) {
            window.playSfx("lose");
        }

        unlockSpinButton();
        showPostSpinActions();
        return;
    }

    if (outcome.type === "smallWin") {
        showSmallWin(outcome);
        unlockSpinButton();
        showPostSpinActions();
        return;
    }

    if (outcome.type === "jackpot") {
        currentSpinSfx = null;
        showJackpot(outcome);
        return;
    }

    unlockSpinButton();
}
function showOverlayAndPopup() {
    removeClasses(overlay, "show");
    removeClasses(ctaPopup, "show");
    setDisplayed(overlay, "block");
    setDisplayed(ctaPopup, "flex");

    overlay.offsetHeight;
    ctaPopup.offsetHeight;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            addClasses(overlay, "show");
            addClasses(ctaPopup, "show");
        });
    });
}
function showCta() {
    if (window.setMusicDucked) {
        window.setMusicDucked(false);
    }

    addClasses(spinBtn, "cta-ready");
    addClasses(tryAgainBtn, "disabled");
    spinBtn.blur();

    if (window.playCtaFx) {
        window.playCtaFx();
    }

    startCtaCountdown();

    showOverlayAndPopup();
    fitAmountText();

    isCtaActive = true;

    unlockSpinButton();
}
function handleSpinButtonClick() {
    if (window.startMusic) {
        window.startMusic();
    }

    if (isCtaActive === true) {
        handleCtaClick();
        return;
    }

    if (isSpinning === true) {
        return;
    }

    startSpin();
}
function initGame() {
    updateGameScale();
    applyGameAssets();
    applyGameFonts();
    refreshCachedSymbolHeight();

    addClasses(spinBtn, "spin-idle");

    spinCount = 0;
    isSpinning = false;
    isCtaActive = false;

    removeClasses(spinBtn, "cta-ready");

    removeClasses(slotArea, "jackpot-state", "jackpot-flash", "small-win");

    if (window.stopCoinRain) {
        window.stopCoinRain();
    }

    stopBillRain();

    if (window.stopAnticipationFx) {
        window.stopAnticipationFx();
    }

    setDisplayed(overlay, "none");
    removeClasses(overlay, "show");

    setDisplayed(ctaPopup, "none");
    removeClasses(ctaPopup, "show");

    stopCtaCountdown();
    updateCtaText();
    fitAmountText();

    initReels();

    applyGameTheme();

    setBalance(gameConfig.balance.startValue);
    setFreeSpins(gameConfig.balance.startFreeSpins || 0);
    showInitialSpinButton();
    clearWinSymbols();

    unlockSpinButton();
}


function isCoinSymbol(symbol) {
    return symbol === "coin" || symbol.startsWith("coin:");
}
function getCoinValue(symbol) {
    return symbol.replace("coin:", "");
}
function createSymbolHtml(symbol) {
    if (symbol.startsWith("coin:")) {
        return `
            <div class="symbol coin-symbol" data-symbol="${symbol}">
                <img class="symbol-img" src="${symbolMap.coin}" alt="">
                <span class="coin-value">${getCoinValue(symbol)}</span>
            </div>
        `;
    }

    const imagePath = symbolMap[symbol];

    return `
        <div class="symbol" data-symbol="${symbol}">
            <img class="symbol-img" src="${imagePath}" alt="">
        </div>
    `;
}
function getOutcomeColumn(outcome, reelIndex) {
    const columnSymbols = [];

    for (let rowIndex = 0; rowIndex < VISIBLE_ROWS; rowIndex++) {
        columnSymbols.push(outcome.reels[rowIndex * GRID_COLUMNS + reelIndex]);
    }

    return columnSymbols;
}
function createFillerSymbols(count) {
    const fillerSymbols = [];

    for (let i = 0; i < count; i++) {
        fillerSymbols.push(getRandomSymbol());
    }

    return fillerSymbols;
}
function prepareReelStrip(reelIndex, outcome) {
    const resultSymbols = getOutcomeColumn(outcome, reelIndex);

    const fillerCount = outcome.reelFillerCounts
        ? outcome.reelFillerCounts[reelIndex]
        : SPIN_FILLER_COUNT;

    const fillerSymbols = createFillerSymbols(fillerCount);

    const stripSymbols = resultSymbols.concat(fillerSymbols);

    reelStrips[reelIndex].innerHTML = stripSymbols
        .map(createSymbolHtml)
        .join("");

    const startOffset = fillerCount * getCurrentSymbolHeight();

    reelStrips[reelIndex].style.transitionDuration = "0ms";
    reelStrips[reelIndex].style.transform = `translate3d(0, -${startOffset}px, 0)`;
}
function prepareReelsForSpin(outcome) {
    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        prepareReelStrip(reelIndex, outcome);
    }
}
function animateReelsToResult(outcome) {
    const reelDurations = outcome.reelDurations || Array.from(
        { length: reelStrips.length },
        (_, reelIndex) => REEL_SPIN_BASE_DURATION + REEL_SPIN_STEP_DURATION * reelIndex
    );
    const effectiveReelDurations = Array.from(
        { length: reelStrips.length },
        (_, reelIndex) => reelDurations[reelIndex] ?? reelDurations[reelDurations.length - 1]
    );

    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const duration = effectiveReelDurations[reelIndex];

        setTimeout(() => {
            reelStrips[reelIndex].style.transitionDuration = `${duration}ms`;
            reelStrips[reelIndex].style.transform = "translate3d(0, 0, 0)";
        }, 20);

        setTimeout(() => {
            if (window.playReelStopFx) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        window.playReelStopFx(reelIndex);
                    });
                });
            }
        }, duration + 30);
    }

    if (
        outcome.anticipationReel !== undefined &&
        gameConfig.effects.anticipationGlowEnabled
    ) {
        setTimeout(() => {
            addClasses(reelElements[outcome.anticipationReel], "anticipation-reel");
            startAnticipationFramePulse(outcome.anticipationReel);

            if (window.playAnticipationFx) {
                window.playAnticipationFx(outcome.anticipationReel);
            }
        }, outcome.anticipationDelay);
    }

    const totalDuration = Math.max(...effectiveReelDurations);

    setTimeout(() => {
        if (outcome.anticipationReel !== undefined) {
            removeClasses(reelElements[outcome.anticipationReel], "anticipation-reel");
            stopAnticipationFramePulse(outcome.anticipationReel);

            if (window.stopAnticipationFx) {
                window.stopAnticipationFx();
            }
        }

        requestAnimationFrame(() => {
            finishOutcome(outcome);
        });
    }, totalDuration + 80);
}
function highlightReel(reelIndex) {
    addClasses(reelElements[reelIndex], "win-reel");

    setTimeout(() => {
        removeClasses(reelElements[reelIndex], "win-reel");
    }, WIN_REEL_GLOW_DURATION);
}

function startAnticipationFramePulse(reelIndex) {
    const reel = reelElements[reelIndex];

    if (!reel) {
        return;
    }

    if (anticipationFrameId !== null) {
        cancelAnimationFrame(anticipationFrameId);
        anticipationFrameId = null;
    }

    anticipationPulseReelIndex = reelIndex;
    addClasses(slotArea, "anticipation-slot");
}

function stopAnticipationFramePulse(reelIndex) {
    if (reelIndex !== undefined && anticipationPulseReelIndex !== reelIndex) {
        return;
    }

    anticipationPulseReelIndex = null;

    if (anticipationFrameId !== null) {
        cancelAnimationFrame(anticipationFrameId);
        anticipationFrameId = null;
    }

    removeClasses(slotArea, "anticipation-slot");

    if (reelIndex === undefined) {
        for (let i = 0; i < reelElements.length; i++) {
            reelElements[i].style.transform = "";
            reelElements[i].style.borderColor = "";
            reelElements[i].style.boxShadow = "";
        }
        return;
    }

    const reel = reelElements[reelIndex];

    if (!reel) {
        return;
    }

    reel.style.transform = "";
    reel.style.borderColor = "";
    reel.style.boxShadow = "";
}
function createCoinParticle(startX, startY) {
    const effects = gameConfig.effects;

    const coin = document.createElement("div");

    addClasses(coin, "coin-particle");
    coin.textContent = gameConfig.currency.effectCoinText || "$";

    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;

    const coinSize = getRandomNumber(
        effects.coinParticleMinSize,
        effects.coinParticleMaxSize
    );

    const flyX = getRandomNumber(
        -effects.coinParticleSpreadX,
        effects.coinParticleSpreadX
    );

    const burstY = -getRandomNumber(
        effects.coinParticleBurstUpMin,
        effects.coinParticleBurstUpMax
    );

    const fallY = getRandomNumber(
        effects.coinParticleFallMin,
        effects.coinParticleFallMax
    );

    const endScale = getRandomNumber(
        effects.coinParticleEndScaleMin,
        effects.coinParticleEndScaleMax
    );

    const rotation = getRandomNumber(240, 900);

    coin.style.setProperty("--coin-size", `${coinSize}px`);
    coin.style.setProperty("--coin-duration", `${effects.coinParticleDuration}ms`);

    coin.style.setProperty("--fly-x", `${flyX}px`);
    coin.style.setProperty("--burst-y", `${burstY}px`);
    coin.style.setProperty("--fall-y", `${fallY}px`);

    coin.style.setProperty("--coin-start-scale", effects.coinParticleStartScale);
    coin.style.setProperty("--coin-end-scale", endScale);

    coin.style.setProperty("--coin-rotation", `${rotation}deg`);
    coin.style.setProperty("--coin-rotation-quarter", `${rotation / 4}deg`);

    document.body.appendChild(coin);

    setTimeout(() => {
        coin.remove();
    }, effects.coinParticleDuration);
}
function spawnCoinParticlesFromPoint(startX, startY, count) {
    const stagger = gameConfig.effects.coinParticleStagger;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            createCoinParticle(startX, startY);
        }, i * stagger);
    }
}

function spawnCoinParticlesFromReel(reelIndex) {
    if (!gameConfig.effects.coinParticlesFromReelEnabled) {
        return;
    }

    const reel = reelElements[reelIndex];

    if (!reel) {
        return;
    }

    const reelRect = reel.getBoundingClientRect();

    const startX = reelRect.left + reelRect.width / 2;
    const startY = reelRect.top + reelRect.height / 2;

    spawnCoinParticlesFromPoint(startX, startY, COIN_PARTICLE_COUNT);
}

function spawnCoinParticlesFromWinCoins(outcome) {
    if (!gameConfig.effects.coinParticlesFromWinCoinsEnabled) {
        return;
    }

    const winSymbols = new Set(outcome.winSymbols || []);
    const particlesPerCoin = gameConfig.effects.coinParticlesPerWinCoin || 6;

    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const symbolsInReel = reelStrips[reelIndex].children;

        for (let rowIndex = 0; rowIndex < VISIBLE_ROWS; rowIndex++) {
            const symbolElement = symbolsInReel[rowIndex];

            if (!symbolElement) {
                continue;
            }

            const symbolName = symbolElement.dataset.symbol;

            if (!isCoinSymbol(symbolName)) {
                continue;
            }

            if (!winSymbols.has(symbolName)) {
                continue;
            }

            const rect = symbolElement.getBoundingClientRect();

            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;

            spawnCoinParticlesFromPoint(startX, startY, particlesPerCoin);
        }
    }
}

function getBillTargetPoint() {
    const targetElement = topWinPanelText || topWinPanel;

    if (!targetElement) {
        return {
            x: window.innerWidth / 2,
            y: 90
        };
    }

    const rect = targetElement.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function createBillParticle(startX, startY, index = 0) {
    const effects = gameConfig.effects;

    if (!effects.billParticlesEnabled) {
        return;
    }

    const target = getBillTargetPoint();
    const bill = document.createElement("div");
    const width = effects.billParticleWidth || 72;
    const duration = effects.billParticleDuration || 980;
    const arcY = -getRandomNumber(70, 125);
    const startRotation = 0;
    const midRotation = 0;
    const endRotation = 0;

    addClasses(bill, "bill-particle");

    bill.style.setProperty("--bill-width", `${width}px`);
    bill.style.setProperty("--bill-duration", `${duration}ms`);
    bill.style.setProperty("--bill-start-x", `${startX}px`);
    bill.style.setProperty("--bill-start-y", `${startY}px`);
    bill.style.setProperty("--bill-mid-x", `${startX + (target.x - startX) * 0.35}px`);
    bill.style.setProperty("--bill-mid-y", `${startY + (target.y - startY) * 0.35 + arcY}px`);
    bill.style.setProperty("--bill-end-x", `${target.x}px`);
    bill.style.setProperty("--bill-end-y", `${target.y}px`);
    bill.style.setProperty("--bill-pop-scale", effects.billParticlePopScale || 1.08);
    bill.style.setProperty("--bill-target-scale", effects.billParticleTargetScale || 0.24);
    bill.style.setProperty("--bill-rotation-start", `${startRotation}deg`);
    bill.style.setProperty("--bill-rotation-mid", `${midRotation}deg`);
    bill.style.setProperty("--bill-rotation-end", `${endRotation}deg`);

    document.body.appendChild(bill);

    setTimeout(() => {
        bill.remove();
    }, duration + 80);
}

function warmupBillParticles() {
    if (!gameConfig.effects.billParticlesEnabled) {
        return;
    }

    const bill = document.createElement("div");
    const width = gameConfig.effects.billParticleWidth || 72;

    addClasses(bill, "bill-particle");

    bill.style.visibility = "hidden";
    bill.style.opacity = "0";
    bill.style.animation = "none";
    bill.style.setProperty("--bill-width", `${width}px`);
    bill.style.setProperty("--bill-duration", "1ms");
    bill.style.setProperty("--bill-start-x", "-120px");
    bill.style.setProperty("--bill-start-y", "-120px");
    bill.style.setProperty("--bill-mid-x", "-120px");
    bill.style.setProperty("--bill-mid-y", "-120px");
    bill.style.setProperty("--bill-end-x", "-120px");
    bill.style.setProperty("--bill-end-y", "-120px");
    bill.style.setProperty("--bill-pop-scale", gameConfig.effects.billParticlePopScale || 1.08);
    bill.style.setProperty("--bill-target-scale", gameConfig.effects.billParticleTargetScale || 0.24);
    bill.style.setProperty("--bill-rotation-start", "0deg");
    bill.style.setProperty("--bill-rotation-mid", "0deg");
    bill.style.setProperty("--bill-rotation-end", "0deg");

    document.body.appendChild(bill);
    bill.getBoundingClientRect();
    requestAnimationFrame(() => {
        bill.remove();
    });
}

function spawnBillsFromPoint(startX, startY, count) {
    const stagger = gameConfig.effects.billParticleStagger || 95;

    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            createBillParticle(startX, startY, i);
        }, i * stagger);
    }
}

function spawnBillsFromWinSymbols(outcome, countPerSymbol) {
    if (!gameConfig.effects.billParticlesEnabled || countPerSymbol <= 0) {
        return;
    }

    const winSymbols = new Set(outcome.winSymbols || []);

    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const symbolsInReel = reelStrips[reelIndex].children;

        for (let rowIndex = 0; rowIndex < VISIBLE_ROWS; rowIndex++) {
            const symbolElement = symbolsInReel[rowIndex];

            if (!symbolElement) {
                continue;
            }

            const symbolName = symbolElement.dataset.symbol;

            if (!winSymbols.has(symbolName)) {
                continue;
            }

            const rect = symbolElement.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;

            spawnBillsFromPoint(startX, startY, countPerSymbol);
        }
    }
}

function createBillRainDrop(index = 0) {
    const effects = gameConfig.effects;
    const bill = document.createElement("div");
    const width = getRandomNumber(effects.billRainWidthMin || 54, effects.billRainWidthMax || 86);
    const startX = getRandomNumber(-20, window.innerWidth - width + 20);
    const startY = -getRandomNumber(60, 180);
    const endY = window.innerHeight + getRandomNumber(90, 220);
    const driftX = getRandomNumber(-85, 85);
    const duration = getRandomNumber(
        (effects.billRainDuration || 3200) * 0.85,
        (effects.billRainDuration || 3200) * 1.25
    );
    const rotationStart = getRandomNumber(-35, 35);
    const rotationEnd = rotationStart + getRandomNumber(210, 420) * (Math.random() > 0.5 ? 1 : -1);

    addClasses(bill, "bill-rain");

    bill.style.setProperty("--bill-rain-width", `${width}px`);
    bill.style.setProperty("--bill-rain-start-x", `${startX}px`);
    bill.style.setProperty("--bill-rain-start-y", `${startY}px`);
    bill.style.setProperty("--bill-rain-end-x", `${startX - driftX * 0.35}px`);
    bill.style.setProperty("--bill-rain-end-y", `${endY}px`);
    bill.style.setProperty("--bill-rain-duration", `${duration}ms`);
    bill.style.setProperty("--bill-rain-rotation-start", `${rotationStart}deg`);
    bill.style.setProperty("--bill-rain-rotation-end", `${rotationEnd}deg`);

    document.body.appendChild(bill);

    setTimeout(() => {
        bill.remove();
    }, duration + 120);
}

function startBillRain() {
    const effects = gameConfig.effects;

    if (!effects.billRainEnabled || billRainActive) {
        return;
    }

    billRainActive = true;
    billRainTimeoutIds = [];

    const count = effects.billRainCount || 24;
    const stagger = effects.billRainStagger || 110;

    for (let i = 0; i < count; i++) {
        const timeoutId = setTimeout(() => {
            if (billRainActive) {
                createBillRainDrop(i);
            }
        }, i * stagger);

        billRainTimeoutIds.push(timeoutId);
    }

    const stopTimeoutId = setTimeout(() => {
        billRainActive = false;
        billRainTimeoutIds = [];
    }, count * stagger + (effects.billRainDuration || 3200));

    billRainTimeoutIds.push(stopTimeoutId);
}

function stopBillRain() {
    billRainActive = false;

    for (let i = 0; i < billRainTimeoutIds.length; i++) {
        clearTimeout(billRainTimeoutIds[i]);
    }

    billRainTimeoutIds = [];

    document.querySelectorAll(".bill-rain").forEach((bill) => {
        bill.remove();
    });
}

function highlightWinReels(outcome) {
    if (!gameConfig.effects.reelWinGlowEnabled) {
        return;
    }

    const winReels = outcome.winReels || [];

    for (let i = 0; i < winReels.length; i++) {
        highlightReel(winReels[i]);
    }
}
function renderReels(outcome) {
    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const resultSymbols = getOutcomeColumn(outcome, reelIndex);

        reelStrips[reelIndex].innerHTML = resultSymbols
            .map(createSymbolHtml)
            .join("");

        reelStrips[reelIndex].style.transitionDuration = "0ms";
        reelStrips[reelIndex].style.transform = "translate3d(0, 0, 0)";

    }
}
function initReels() {
    renderReels(startScreenReels);
}
function formatBalance(value) {
    const roundedValue = Math.floor(value);
    const formattedValue = roundedValue.toLocaleString("de-DE");

    return `${formattedValue} ${gameConfig.balance.currency}`;
}
function formatCashBonus(value) {
    const roundedValue = Math.floor(value);
    const formattedValue = roundedValue.toLocaleString("de-DE");

    return `${formattedValue} ${gameConfig.balance.currency}`;
}
function getOutcomeCashBonus(outcome) {
    return outcome.bonusCash ?? outcome.balance ?? 0;
}
function getOutcomeFreeSpins(outcome) {
    return outcome.bonusFreeSpins ?? currentFreeSpins;
}
function setFreeSpins(value) {
    currentFreeSpins = Math.floor(value);

    if (freeSpinsValue) {
        freeSpinsValue.textContent = String(currentFreeSpins);
    }
}
function animateFreeSpinsTo(targetFreeSpins, duration) {
    const startFreeSpins = currentFreeSpins;
    const difference = targetFreeSpins - startFreeSpins;
    const startTime = performance.now();

    if (duration === 0 || difference === 0) {
        setFreeSpins(targetFreeSpins);
        return;
    }

    function updateFreeSpins(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentValue = startFreeSpins + difference * progress;

        setFreeSpins(currentValue);

        if (progress < 1) {
            requestAnimationFrame(updateFreeSpins);
        } else {
            setFreeSpins(targetFreeSpins);
        }
    }

    requestAnimationFrame(updateFreeSpins);
}
function setBalance(value) {
    currentBalance = value;
    if (topWinPanelText) {
        topWinPanelText.textContent = formatCashBonus(currentBalance);
    } else {
        topWinPanel.textContent = formatCashBonus(currentBalance);
    }
}
function animateBalanceTo(targetBalance, duration, outcome) {
    const startBalance = currentBalance;
    const difference = targetBalance - startBalance;
    const startTime = performance.now();

    const balanceEffect = outcome?.balanceEffect || "pop";

    if (duration === 0 || difference === 0) {
        setBalance(targetBalance);
        return;
    }

    const shouldAnimateBonusPanel = false;

    if (shouldAnimateBonusPanel) {
        if (balanceEffect === "pulse") {
            startBalancePulse();
        } else {
            playBalancePop();
        }
    }

    let lastBalanceSparkStep = 0;

    function updateBalance(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentValue = startBalance + difference * progress;

        if (topWinPanelText) {
            topWinPanelText.textContent = formatCashBonus(currentValue);
        } else {
            topWinPanel.textContent = formatCashBonus(currentValue);
        }

        if (difference !== 0 && window.playBalanceSparkFx) {
            const sparkStep = Math.floor(progress * 8);

            if (sparkStep > lastBalanceSparkStep) {
                lastBalanceSparkStep = sparkStep;
                window.playBalanceSparkFx();
            }
        }

        if (progress < 1) {
            requestAnimationFrame(updateBalance);
        } else {
            setBalance(targetBalance);
            if (shouldAnimateBonusPanel) {
                stopBalancePulse();
            }
        }
    }

    requestAnimationFrame(updateBalance);
}
function playBalancePop() {
    if (!gameConfig.effects.balancePopEnabled) {
        return;
    }

    if (balancePopFrameId !== null) {
        cancelAnimationFrame(balancePopFrameId);
        balancePopFrameId = null;
    }

    if (balancePopTimeoutId !== null) {
        clearTimeout(balancePopTimeoutId);
        balancePopTimeoutId = null;
    }

    topWinPanel.style.setProperty(
        "--balance-pop-duration",
        `${gameConfig.effects.balancePopDuration}ms`
    );

    removeClasses(topWinPanel, "balance-pop");

    addClasses(topWinPanel, "balance-pop");

    const duration = gameConfig.effects.balancePopDuration;
    const startTime = performance.now();

    topWinPanel.style.transformOrigin = "center center";
    topWinPanel.style.willChange = "transform";

    const animate = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = progress < 0.28
            ? progress / 0.28
            : progress < 0.55
                ? 1 - (progress - 0.28) / 0.27 * 0.008
                : 1 - (progress - 0.55) / 0.45 * 0.0;

        let scale = 1;

        if (progress < 0.28) {
            scale = 1 + eased * 0.03;
        } else if (progress < 0.55) {
            scale = 1.03 - (progress - 0.28) / 0.27 * 0.038;
        } else {
            scale = 0.992 + (progress - 0.55) / 0.45 * 0.008;
        }

        topWinPanel.style.transform = `scale(${scale})`;

        if (progress < 1) {
            balancePopFrameId = requestAnimationFrame(animate);
            return;
        }

        topWinPanel.style.transform = "";
        topWinPanel.style.willChange = "";
        balancePopFrameId = null;
    };

    balancePopFrameId = requestAnimationFrame(animate);

    balancePopTimeoutId = setTimeout(() => {
        removeClasses(topWinPanel, "balance-pop");
        if (balancePopFrameId !== null) {
            cancelAnimationFrame(balancePopFrameId);
            balancePopFrameId = null;
        }
        topWinPanel.style.transform = "";
        topWinPanel.style.willChange = "";
    }, duration);
}

function startBalancePulse() {
    if (!gameConfig.effects.balancePopEnabled) {
        return;
    }

    removeClasses(topWinPanel, "balance-pop");
    addClasses(topWinPanel, "balance-pulsing");

    if (balancePulseFrameId !== null) {
        cancelAnimationFrame(balancePulseFrameId);
        balancePulseFrameId = null;
    }

    const animate = (now) => {
        if (!topWinPanel.classList.contains("balance-pulsing")) {
            topWinPanel.style.transform = "";
            topWinPanel.style.willChange = "";
            if (topWinPanelArt) {
                topWinPanelArt.style.filter = "";
                topWinPanelArt.style.willChange = "";
            }
            balancePulseFrameId = null;
            return;
        }

        const wave = (Math.sin(now * 0.008) + 1) * 0.5;
        const scale = 1 + wave * 0.018;
        const glow = 0.22 + wave * 0.18;

        topWinPanel.style.transformOrigin = "center center";
        topWinPanel.style.transform = `scale(${scale})`;
        topWinPanel.style.willChange = "transform";
        if (topWinPanelArt) {
            topWinPanelArt.style.filter = `drop-shadow(0 0 ${14 + wave * 10}px rgba(255, 220, 80, ${glow}))`;
            topWinPanelArt.style.willChange = "filter";
        }

        balancePulseFrameId = requestAnimationFrame(animate);
    };

    balancePulseFrameId = requestAnimationFrame(animate);
}

function stopBalancePulse() {
    removeClasses(topWinPanel, "balance-pulsing");

    if (balancePulseFrameId !== null) {
        cancelAnimationFrame(balancePulseFrameId);
        balancePulseFrameId = null;
    }

    topWinPanel.style.transform = "";
    topWinPanel.style.willChange = "";
    if (topWinPanelArt) {
        topWinPanelArt.style.filter = "";
        topWinPanelArt.style.willChange = "";
    }
}

function finishOutcome(outcome) {
    if (
        gameConfig.fx.slotShineEnabled &&
        window.playSlotShineFx &&
        (outcome.type === "smallWin" || outcome.type === "jackpot")
    ) {
        window.playSlotShineFx();
    }

    handleOutcomeType(outcome);

    const delay = outcome.balanceDelay || 0;

    setTimeout(() => {
        animateBalanceTo(getOutcomeCashBonus(outcome), outcome.balanceCountDuration, outcome);
        animateFreeSpinsTo(getOutcomeFreeSpins(outcome), outcome.balanceCountDuration);
    }, delay);
}
function highlightWinSymbols(outcome) {
    const winSymbols = new Set(outcome.winSymbols || []);

    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const symbolsInReel = reelStrips[reelIndex].children;

        for (let rowIndex = 0; rowIndex < VISIBLE_ROWS; rowIndex++) {
            const symbolElement = symbolsInReel[rowIndex];

            if (!symbolElement) {
                continue;
            }

            const symbolName = symbolElement.dataset.symbol;

            if (!winSymbols.has(symbolName)) {
                continue;
            }

            removeClasses(symbolElement, "win-symbol", "pulsing");

            addClasses(symbolElement, "win-symbol");

        }
    }
}
function clearWinSymbols() {
    const winSymbols = document.querySelectorAll(".win-symbol");

    for (let i = 0; i < winSymbols.length; i++) {
        removeClasses(winSymbols[i], "win-symbol", "pulsing");
    }
}
function formatCtaCountdown(milliseconds) {
    const safeMilliseconds = Math.max(0, milliseconds);
    const totalSeconds = Math.ceil(safeMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateCtaCountdownDisplay() {
    if (!ctaCountdownTime) {
        return;
    }

    const remainingTime = ctaCountdownEndTime - Date.now();

    ctaCountdownTime.textContent = formatCtaCountdown(remainingTime);

    if (remainingTime <= 0 && ctaCountdownIntervalId) {
        clearInterval(ctaCountdownIntervalId);
        ctaCountdownIntervalId = null;
    }
}

function stopCtaCountdown() {
    if (ctaCountdownIntervalId) {
        clearInterval(ctaCountdownIntervalId);
        ctaCountdownIntervalId = null;
    }
}

function resetCtaCountdownDisplay() {
    if (!ctaCountdownTime) {
        return;
    }

    const countdownMinutes = gameConfig.cta.countdownMinutes || 30;
    ctaCountdownTime.textContent = formatCtaCountdown(countdownMinutes * 60 * 1000);
}

function startCtaCountdown() {
    stopCtaCountdown();

    const countdownMinutes = gameConfig.cta.countdownMinutes || 30;
    ctaCountdownEndTime = Date.now() + countdownMinutes * 60 * 1000;

    updateCtaCountdownDisplay();

    ctaCountdownIntervalId = setInterval(updateCtaCountdownDisplay, 1000);
}

function updateCtaText() {
    ctaTitle.textContent = gameConfig.cta.title;
    ctaAmount.innerHTML = gameConfig.cta.amount;
    ctaButton.textContent = gameConfig.cta.buttonText;

    if (ctaCountdownLabel) {
        ctaCountdownLabel.textContent = gameConfig.cta.countdownLabel || "ANGEBOT ENDET IN";
    }

    resetCtaCountdownDisplay();
}
function applyGameAssets() {
    document.body.style.backgroundImage = `url("${gameConfig.assets.background}")`;
    gameLogo.src = gameConfig.assets.logo;

    if (sceneZeus && gameConfig.assets.zeus) {
        sceneZeus.src = gameConfig.assets.zeus;
    }

    if (gameConfig.assets.bill) {
        document.documentElement.style.setProperty(
            "--bill-image",
            `url("${gameConfig.assets.bill}")`
        );
    }

    if (gameConfig.assets.slotFrame) {
        document.documentElement.style.setProperty(
            "--slot-frame-image",
            `url("${gameConfig.assets.slotFrame}")`
        );
        if (slotFrameImg) {
            slotFrameImg.src = gameConfig.assets.slotFrame;
        }
        addClasses(slotArea, "asset-slot-frame");
    }

    if (gameConfig.assets.ui.balancePanel) {
        document.documentElement.style.setProperty(
            "--balance-panel-image",
            `url("${gameConfig.assets.ui.balancePanel}")`
        );
    }

    if (gameConfig.assets.ui.spinButton) {
        document.documentElement.style.setProperty(
            "--spin-button-image",
            `url("${gameConfig.assets.ui.spinButton}")`
        );
    }
}
function applyGameTheme() {
    const theme = gameConfig.theme;

    slotArea.style.background = theme.slotBackground;
    slotArea.style.borderColor = theme.slotBorder;
    slotArea.style.boxShadow = `0 0 24px ${theme.slotGlow}`;

    if (gameConfig.assets.slotFrame) {
        slotArea.style.borderColor = "transparent";
        slotArea.style.boxShadow = "inset 0 0 18px rgba(255, 216, 74, 0.12)";
    }

    ctaPopup.style.background = `linear-gradient(${theme.ctaPopupTop}, ${theme.ctaPopupBottom})`;
    ctaPopup.style.borderColor = theme.ctaPopupBorder;

    ctaButton.style.background = `linear-gradient(${theme.ctaButtonTop}, ${theme.ctaButtonBottom})`;
    ctaButton.style.color = theme.ctaButtonText;

    for (let i = 0; i < reelElements.length; i++) {
        reelElements[i].style.background = `linear-gradient(${theme.reelTop}, ${theme.reelBottom})`;
        reelElements[i].style.borderColor = gameConfig.assets.slotFrame ? "transparent" : theme.reelBorder;
    }
    topWinPanel.style.color = theme.balanceText;
}

function applyGameFonts() {
    const fonts = gameConfig.fonts;

    topWinPanel.style.fontFamily = fonts.balancePanel;

    if (ctaAmount) {
        ctaAmount.style.fontFamily = fonts.ctaAmount || fonts.balancePanel;
    }

    document.documentElement.style.setProperty(
        "--coin-value-font-family",
        fonts.coinValue
    );

    document.documentElement.style.setProperty(
        "--coin-particle-font-family",
        fonts.coinParticle
    );

    if (ctaTitle) {
        ctaTitle.style.fontFamily = fonts.ctaTitle;
    }

    if (ctaButton) {
        ctaButton.style.fontFamily = fonts.ctaButton;
    }

    if (ctaCountdownLabel) {
        ctaCountdownLabel.style.fontFamily = fonts.ctaButton;
    }

    if (ctaCountdownTime) {
        ctaCountdownTime.style.fontFamily = fonts.ctaAmount || fonts.balancePanel;
    }
}

async function ensureLocalFontsLoaded() {
    if (!document.fonts || typeof document.fonts.load !== "function") {
        return;
    }

    try {
        await document.fonts.load(`16px ${gameConfig.fonts.balancePanel}`);
        await document.fonts.ready;
    } catch {
        // If the font loader fails, the app can still fall back to system fonts.
    }
}

function getCurrentSymbolHeight() {
    return cachedSymbolHeight;
}
function updateGameScale() {
    const baseWidth = gameConfig.scene.baseWidth;
    const baseHeight = gameConfig.scene.baseHeight;
    const maxScale = gameConfig.scene.maxScale;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const scaleByWidth = viewportWidth / baseWidth;
    const scaleByHeight = viewportHeight / baseHeight;

    const scale = Math.min(scaleByWidth, scaleByHeight, maxScale);

    gameScaler.style.setProperty("--game-scale", scale);
}

function getPreloadImageSources() {
    const sources = [];

    sources.push(gameConfig.assets.background);
    sources.push(gameConfig.assets.logo);
    sources.push(gameConfig.assets.zeus);
    sources.push(gameConfig.assets.bill);
    sources.push(gameConfig.assets.lightning);
    sources.push(gameConfig.assets.slotFrame);

    if (gameConfig.assets.ui) {
        for (const uiAssetName in gameConfig.assets.ui) {
            sources.push(gameConfig.assets.ui[uiAssetName]);
        }
    }

    for (const symbolName in gameConfig.assets.symbols) {
        sources.push(gameConfig.assets.symbols[symbolName]);
    }

    return [...new Set(sources.filter(Boolean))];
}

function preloadImage(src) {
    return new Promise((resolve) => {
        const image = new Image();

        image.onload = () => {
            if (image.decode) {
                image.decode().then(resolve).catch(resolve);
                return;
            }

            resolve();
        };

        image.onerror = resolve;
        image.src = src;
    });
}

function updatePreloaderProgress(progress) {
    if (!preloaderProgress) {
        return;
    }

    const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100);
    preloaderProgress.style.width = `${percent}%`;
}

function hidePreloader() {
    if (!preloader) {
        return;
    }

    updatePreloaderProgress(1);
    addClasses(preloader, "hidden");
}

async function startPreloader() {
    if (!preloader) {
        return;
    }

    const minVisibleTime = 700;
    const startTime = performance.now();
    const imageSources = getPreloadImageSources();
    const soundSources = getPreloadSoundSources();
    const totalSources = imageSources.length + soundSources.length;

    preloader.style.background = `
        linear-gradient(${gameConfig.theme.bodyOverlayTop}, ${gameConfig.theme.bodyOverlayBottom}),
        url("${gameConfig.assets.background}") center center / cover no-repeat
    `;

    if (preloaderLogo) {
        preloaderLogo.src = gameConfig.assets.logo;
    }

    updatePreloaderProgress(0.06);

    const soundPromise = soundSources.length > 0 && window.preloadSfx
        ? window.preloadSfx()
        : Promise.resolve();

    if (totalSources === 0) {
        await new Promise((resolve) => {
            setTimeout(resolve, minVisibleTime);
        });
        return;
    }

    let loadedCount = 0;

    const preloadPromises = [
        ...imageSources.map((src) => {
            return preloadImage(src).then(() => {
                loadedCount += 1;
                updatePreloaderProgress(loadedCount / totalSources);
            });
        }),
        soundPromise.then(() => {
            loadedCount += soundSources.length;
            updatePreloaderProgress(loadedCount / totalSources);
        })
    ];

    await Promise.all(preloadPromises);

    const elapsedTime = performance.now() - startTime;
    const remainingTime = Math.max(0, minVisibleTime - elapsedTime);

    if (remainingTime > 0) {
        await new Promise((resolve) => {
            setTimeout(resolve, remainingTime);
        });
    }
}

function getPreloadSoundSources() {
    const sources = [];

    if (!gameConfig.sfx || !gameConfig.sfx.enabled || !gameConfig.sfx.sounds) {
        return sources;
    }

    for (const soundName in gameConfig.sfx.sounds) {
        const soundConfig = gameConfig.sfx.sounds[soundName];

        if (soundConfig && soundConfig.src) {
            sources.push(soundConfig.src);
        }
    }

    if (gameConfig.sfx.music && gameConfig.sfx.music.src) {
        sources.push(gameConfig.sfx.music.src);
    }

    return [...new Set(sources.filter(Boolean))];
}

async function bootstrap() {
    await ensureLocalFontsLoaded();

    updateGameScale();
    applyGameAssets();
    applyGameFonts();

    addClasses(spinBtn, "spin-idle");

    await startPreloader();

    if (window.initFx) {
        await window.initFx();
    }

    if (window.preloadFx) {
        await window.preloadFx();
    }

    warmupBillParticles();

    initGame();
    hidePreloader();
    startAmbientLightning();
}

function unlockSfxOnFirstInteraction() {
    if (window.unlockSfx) {
        window.unlockSfx();
    }
}

//Events
window.addEventListener("pointerdown", unlockSfxOnFirstInteraction, {
    once: true,
    capture: true,
    passive: true
});
spinBtn.addEventListener("click", handleSpinButtonClick);
tryAgainBtn.addEventListener("click", handleSpinButtonClick);
ctaButton.addEventListener("click", handleCtaClick);

window.addEventListener("resize", () => {
    updateGameScale();
    fitAmountText();
});

window.addEventListener("orientationchange", () => {
    setTimeout(updateGameScale, 300);
    setTimeout(fitAmountText, 300);
});

let playableStarted = false;

function startPlayableOnce() {
    if (playableStarted) {
        return;
    }

    playableStarted = true;
    void bootstrap();
}

function onSdkReady() {
    console.log("MRAID Ready!");
    startPlayableOnce();
}

function initApp() {
    const delivery = gameConfig.delivery || {};

    if ((delivery.ctaMode === "unity" || delivery.ctaMode === "mraid") && window.mraid) {
        if (typeof window.mraid.getState === "function" && window.mraid.getState() === "loading") {
            window.mraid.addEventListener("ready", onSdkReady);
        } else {
            onSdkReady();
        }
    } else {
        onSdkReady();
    }
}

window.addEventListener("load", initApp);
