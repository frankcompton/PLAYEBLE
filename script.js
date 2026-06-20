import { gameConfig } from "./config.js";

// Elements
const spinBtn = document.getElementById("spinBtn");
const topWinPanel = document.getElementById("topWinPanel");
const topWinPanelArt = document.getElementById("topWinPanelArt");
const slotArea = document.getElementById("slotArea");
const gameLogo = document.getElementById("gameLogo");
const ctaPopup = document.getElementById("ctaPopup");
const ctaTitle = document.getElementById("ctaTitle");
const ctaAmount = document.getElementById("ctaAmount");
const ctaButton = document.getElementById("ctaButton");
const overlay = document.getElementById("overlay");
const topWinPanelText = document.getElementById("topWinPanelText");
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
let currentSpinSfx = null;
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

const VISIBLE_ROWS = gameConfig.grid.rows;
const SPIN_FILLER_COUNT = gameConfig.grid.fillerCount;

const REEL_SPIN_BASE_DURATION = gameConfig.timings.reelSpinBaseDuration;
const REEL_SPIN_STEP_DURATION = gameConfig.timings.reelSpinStepDuration;

const WIN_REEL_GLOW_DURATION = gameConfig.timings.winReelGlowDuration;

const COIN_PARTICLE_COUNT = gameConfig.effects.coinParticleCount;
const COIN_PARTICLE_DURATION = gameConfig.effects.coinParticleDuration;

const WIN_SYMBOL_POP_DURATION = gameConfig.timings.winSymbolPopDuration;
const JACKPOT_FLASH_DURATION = gameConfig.timings.jackpotFlashDuration;

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


// Data
const startScreenReels = gameConfig.startScreen;
const outcomes = gameConfig.spins;
const symbolMap = gameConfig.assets.symbols;
const reelSymbols = gameConfig.reelSymbols;

// Functions
function lockSpinButton() {
    isSpinning = true;
    addClasses(spinBtn, "disabled");
}

function unlockSpinButton() {
    removeClasses(spinBtn, "disabled");
    isSpinning = false;
}
function showJackpot(outcome) {

    if (window.playSfx) {
        window.playSfx("jackpot");
    }

    if (window.playJackpotFx) {
        window.playJackpotFx();
    }

    highlightWinReels(outcome);
    highlightWinSymbols(outcome);

    addClasses(slotArea, "jackpot-state", "jackpot-flash");

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

function startSpin() {
    removeClasses(spinBtn, "spin-idle");
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
function goToOffer() {
    const offerUrl = gameConfig.offer.url;

    if (!offerUrl) {
        return;
    }

    window.location.href = offerUrl;
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
    const winReels = outcome.winReels || [];

    if (window.playSmallWinFx) {
        window.playSmallWinFx(winReels);
    }

    for (let i = 0; i < winReels.length; i++) {
        const reelIndex = winReels[i];

        if (gameConfig.effects.reelWinGlowEnabled) {
            highlightReel(reelIndex);
        }
    }

    if (gameConfig.effects.coinParticlesEnabled) {
        spawnCoinParticlesFromWinCoins(outcome);
    }

    if (gameConfig.effects.slotWinGlowEnabled) {
        addClasses(slotArea, "small-win");

        setTimeout(() => {
            removeClasses(slotArea, "small-win");
        }, SMALL_WIN_GLOW_DURATION);
    }
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
        return;
    }

    if (outcome.type === "smallWin") {
        showSmallWin(outcome);
        unlockSpinButton();
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
    addClasses(spinBtn, "cta-ready");
    spinBtn.blur();

    if (window.playCtaFx) {
        window.playCtaFx();
    }

    showOverlayAndPopup();

    isCtaActive = true;

    unlockSpinButton();
}
function handleSpinButtonClick() {
    if (isCtaActive === true) {
        goToOffer();
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

    if (window.stopAnticipationFx) {
        window.stopAnticipationFx();
    }

    setDisplayed(overlay, "none");
    removeClasses(overlay, "show");

    setDisplayed(ctaPopup, "none");
    removeClasses(ctaPopup, "show");

    updateCtaText();

    initReels();

    applyGameTheme();

    setBalance(gameConfig.balance.startValue);
    clearWinSymbols();

    unlockSpinButton();
}


function isCoinSymbol(symbol) {
    return symbol.startsWith("coin:");
}
function getCoinValue(symbol) {
    return symbol.replace("coin:", "");
}
function createSymbolHtml(symbol) {
    if (isCoinSymbol(symbol)) {
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
    return [
        outcome.reels[reelIndex],
        outcome.reels[reelIndex + 3],
        outcome.reels[reelIndex + 6]
    ];
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
    const reelDurations = outcome.reelDurations || [
        REEL_SPIN_BASE_DURATION,
        REEL_SPIN_BASE_DURATION + REEL_SPIN_STEP_DURATION,
        REEL_SPIN_BASE_DURATION + REEL_SPIN_STEP_DURATION * 2
    ];

    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const duration = reelDurations[reelIndex];

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

    const totalDuration = Math.max(...reelDurations);

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

    const startTime = performance.now();

    const animate = (now) => {
        if (anticipationPulseReelIndex !== reelIndex || !reel.classList.contains("anticipation-reel")) {
            reel.style.transform = "";
            reel.style.borderColor = "";
            reel.style.boxShadow = "";
            anticipationFrameId = null;
            return;
        }

        const wave = (Math.sin((now - startTime) * 0.01) + 1) * 0.5;
        const pulseScale = 1 + wave * 0.012;
        const glowAlpha = 0.45 + wave * 0.4;

        reel.style.transformOrigin = "center center";
        reel.style.transform = `scale(${pulseScale})`;
        reel.style.borderColor = `rgba(255, 216, 74, ${0.75 + wave * 0.2})`;
        reel.style.boxShadow = `
            0 0 ${18 + wave * 10}px rgba(255, 216, 74, ${glowAlpha}),
            inset 0 0 18px rgba(255, 216, 74, ${0.35 + wave * 0.1})
        `;

        anticipationFrameId = requestAnimationFrame(animate);
    };

    anticipationFrameId = requestAnimationFrame(animate);
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
    const formattedValue = roundedValue.toLocaleString("en-US").replace(/,/g, " ");

    return `${formattedValue} ${gameConfig.balance.currency}`;
}
function setBalance(value) {
    currentBalance = value;
    if (topWinPanelText) {
        topWinPanelText.textContent = formatBalance(currentBalance);
    } else {
        topWinPanel.textContent = formatBalance(currentBalance);
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

    if (balanceEffect === "pulse") {
        startBalancePulse();
    } else {
        playBalancePop();
    }

    let lastBalanceSparkStep = 0;

    function updateBalance(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentValue = startBalance + difference * progress;

        if (topWinPanelText) {
            topWinPanelText.textContent = formatBalance(currentValue);
        } else {
            topWinPanel.textContent = formatBalance(currentValue);
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
            stopBalancePulse();
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
        animateBalanceTo(outcome.balance, outcome.balanceCountDuration, outcome);
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

            if (gameConfig.effects.bonusPulseEnabled) {
                setTimeout(() => {
                    addClasses(symbolElement, "pulsing");
                }, WIN_SYMBOL_POP_DURATION);
            }
        }
    }
}
function clearWinSymbols() {
    const winSymbols = document.querySelectorAll(".win-symbol");

    for (let i = 0; i < winSymbols.length; i++) {
        removeClasses(winSymbols[i], "win-symbol", "pulsing");
    }
}
function updateCtaText() {
    ctaTitle.textContent = gameConfig.cta.title;
    ctaAmount.textContent = gameConfig.cta.amount;
    ctaButton.textContent = gameConfig.cta.buttonText;
}
function applyGameAssets() {
    document.body.style.backgroundImage = `url("${gameConfig.assets.background}")`;
    gameLogo.src = gameConfig.assets.logo;

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

    ctaPopup.style.background = `linear-gradient(${theme.ctaPopupTop}, ${theme.ctaPopupBottom})`;
    ctaPopup.style.borderColor = theme.ctaPopupBorder;

    ctaButton.style.background = `linear-gradient(${theme.ctaButtonTop}, ${theme.ctaButtonBottom})`;
    ctaButton.style.color = theme.ctaButtonText;

    for (let i = 0; i < reelElements.length; i++) {
        reelElements[i].style.background = `linear-gradient(${theme.reelTop}, ${theme.reelBottom})`;
        reelElements[i].style.borderColor = theme.reelBorder;
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

    return [...new Set(sources.filter(Boolean))];
}

async function bootstrap() {
    updateGameScale();
    applyGameAssets();
    applyGameFonts();

    addClasses(spinBtn, "spin-idle");

    await startPreloader();

    if (window.initFx) {
        await window.initFx();
    }

    initGame();
    hidePreloader();
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
ctaButton.addEventListener("click", goToOffer);

window.addEventListener("resize", () => {
    updateGameScale();
});

window.addEventListener("orientationchange", () => {
    setTimeout(updateGameScale, 300);
});

bootstrap();
