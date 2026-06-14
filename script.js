console.log("JS connected");

// Elements
const spinBtn = document.getElementById("spinBtn");
const topWinPanel = document.getElementById("topWinPanel");
const slotArea = document.getElementById("slotArea");
const gameLogo = document.getElementById("gameLogo");
const symbolIcons = document.querySelectorAll(".symbol-icon");
const ctaPopup = document.getElementById("ctaPopup");
const ctaTitle = document.getElementById("ctaTitle");
const ctaAmount = document.getElementById("ctaAmount");
const ctaButton = document.getElementById("ctaButton");
const overlay = document.getElementById("overlay");
const reelStrips = document.querySelectorAll(".reel-strip");
const game = document.getElementById("game");
const slotStage = document.getElementById("slotStage");
const spinText = document.getElementById("spinText");
const gameScaler = document.getElementById("gameScaler");

// State
let spinCount = 0;
let isSpinning = false;
let isCtaActive = false;
let currentBalance = 0;

// Settings
const CTA_DELAY = gameConfig.timings.ctaDelay;
const SHOW_CLASS_DELAY = 10;

const SMALL_WIN_GLOW_DURATION = gameConfig.timings.smallWinGlowDuration;
const SYMBOL_POP_DURATION = 250;

const VISIBLE_ROWS = gameConfig.grid.rows;
let currentSymbolHeight = 82;
const SPIN_FILLER_COUNT = gameConfig.grid.fillerCount;

const REEL_SPIN_BASE_DURATION = gameConfig.timings.reelSpinBaseDuration;
const REEL_SPIN_STEP_DURATION = gameConfig.timings.reelSpinStepDuration;

const WIN_REEL_GLOW_DURATION = gameConfig.timings.winReelGlowDuration;

const COIN_PARTICLE_COUNT = gameConfig.effects.coinParticleCount;
const COIN_PARTICLE_DURATION = gameConfig.effects.coinParticleDuration;

const WIN_SYMBOL_POP_DURATION = gameConfig.timings.winSymbolPopDuration;
const JACKPOT_FLASH_DURATION = gameConfig.timings.jackpotFlashDuration;


// Data
const startScreenReels = gameConfig.startScreen;
const outcomes = gameConfig.spins;
const symbolMap = gameConfig.assets.symbols;
const reelSymbols = gameConfig.reelSymbols;
console.log(spinBtn);

// Functions
function lockSpinButton() {
    isSpinning = true;
    spinBtn.classList.add("disabled");
}

function unlockSpinButton() {
    spinBtn.classList.remove("disabled");
    isSpinning = false;
}
function setReels(reels) {
    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const iconsInReel = reelStrips[reelIndex].querySelectorAll(".symbol-icon");

        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            const outcomeIndex = rowIndex * reelStrips.length + reelIndex;

            iconsInReel[rowIndex].textContent = reels[outcomeIndex] || "?";
        }
    }
}
function showJackpot(outcome) {

    if (window.playJackpotFx) {
    window.playJackpotFx();
}


    highlightWinReels(outcome);
    highlightWinSymbols(outcome);

    slotArea.classList.add("jackpot-state");
    slotArea.classList.add("jackpot-flash");

    setTimeout(() => {
        slotArea.classList.remove("jackpot-flash");
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

function startSpinAnimation() {
    return null;
}
function finishSpin(spinAnimation, outcome) {
    prepareReelsForSpin(outcome);

    animateReelsToResult(outcome);
}
function startSpin() {
    spinBtn.classList.remove("spin-idle");
    spinCount = spinCount + 1;

    if (spinCount > outcomes.length) {
        spinCount = outcomes.length;
        console.log("No more outcomes");
        return;
    }

    const currentOutcome = outcomes[spinCount - 1];

    startSpinVisuals();

    const spinAnimation = startSpinAnimation();

    finishSpin(spinAnimation, currentOutcome);
}
function goToOffer() {
    const offerUrl = gameConfig.offer.url;

    if (!offerUrl) {
        console.log("Offer URL is empty");
        return;
    }

    window.location.href = offerUrl;
}

function startSpinVisuals() {
    lockSpinButton();

    slotArea.classList.remove("result-ready");

    if (window.playSpinStartFx) {
        window.playSpinStartFx();
    }

    startReelSpinVisuals();
}

function stopSpinVisuals(spinAnimation) {
    clearInterval(spinAnimation);

    stopReelSpinVisuals();
}

function showOutcome(outcome) {
    setReels(outcome.reels);
    popSymbols();
}
function showSmallWin(outcome) {
    const winReels = outcome.winReels || [];

    if (window.playSmallWinFx) {
        window.playSmallWinFx(winReels);
    }

    for (let i = 0; i < winReels.length; i++) {
        const reelIndex = winReels[i];

        if (gameConfig.effects.reelWinGlowEnabled) {
            highlightReel(reelIndex);
        }

        if (gameConfig.effects.coinParticlesEnabled) {
            spawnCoinParticlesFromReel(reelIndex);
        }
    }

    if (gameConfig.effects.slotWinGlowEnabled) {
        slotArea.classList.add("small-win");

        setTimeout(() => {
            slotArea.classList.remove("small-win");
        }, SMALL_WIN_GLOW_DURATION);
    }
}
function handleOutcomeType(outcome) {
    if (outcome.type === "smallWin") {
        showSmallWin(outcome);
        unlockSpinButton();
        return;
    }

    if (outcome.type === "jackpot") {
        showJackpot(outcome);
        return;
    }

    unlockSpinButton();
}
function showOverlayAndPopup() {
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
function showCta() {
    spinBtn.classList.add("cta-ready");

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

    spinBtn.classList.add("spin-idle");

    spinCount = 0;
    isSpinning = false;
    isCtaActive = false;

    spinBtn.classList.remove("cta-ready");

    slotArea.classList.remove("jackpot-state");
    slotArea.classList.remove("jackpot-flash");
    slotArea.classList.remove("small-win");

    if (window.stopCoinRain) {
        window.stopCoinRain();
    }

    if (window.stopAnticipationFx) {
        window.stopAnticipationFx();
    }

    overlay.style.display = "none";
    overlay.classList.remove("show");

    ctaPopup.style.display = "none";
    ctaPopup.classList.remove("show");

    updateCtaText();

    initReels();

    applyGameTheme();

    setBalance(gameConfig.balance.startValue);
    clearWinSymbols();

    unlockSpinButton();
}


function popSymbols() {
    const currentSymbolIcons = document.querySelectorAll(".symbol-icon");

    for (let i = 0; i < currentSymbolIcons.length; i++) {
        currentSymbolIcons[i].classList.remove("pop");

        void currentSymbolIcons[i].offsetWidth;

        currentSymbolIcons[i].classList.add("pop");

        setTimeout(() => {
            currentSymbolIcons[i].classList.remove("pop");
        }, SYMBOL_POP_DURATION);
    }
}
function startReelSpinVisuals() {
    // Теперь рилы запускаются через animateReelsToResult()
}
function stopReelSpinVisuals() {
    // Теперь рилы останавливаются сами через transition
}
function setReelResult(reelIndex, reels) {
    const iconsInReel = reelStrips[reelIndex].querySelectorAll(".symbol-icon");

    for (let rowIndex = 0; rowIndex < VISIBLE_ROWS; rowIndex++) {
        const outcomeIndex = rowIndex * reelStrips.length + reelIndex;

        iconsInReel[rowIndex].textContent = reels[outcomeIndex] || "?";
    }
}
function stopReelsSequentially(outcome) {
    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        setTimeout(() => {
            reelStrips[reelIndex].classList.remove("spinning");

            setReelResult(reelIndex, outcome.reels);

            if (reelIndex === reelStrips.length - 1) {
                popSymbols();
                handleOutcomeType(outcome);
            }
        }, REEL_STOP_DELAY * (reelIndex + 1));
    }
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
    const reels = document.querySelectorAll(".reel");

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
                window.playReelStopFx(reelIndex);
            }
        }, duration + 30);
    }

    if (
        outcome.anticipationReel !== undefined &&
        gameConfig.effects.anticipationGlowEnabled
    ) {
        setTimeout(() => {
            reels[outcome.anticipationReel].classList.add("anticipation-reel");

            if (window.playAnticipationFx) {
                window.playAnticipationFx(outcome.anticipationReel);
            }
        }, outcome.anticipationDelay);
    }

    const totalDuration = Math.max(...reelDurations);

    setTimeout(() => {
        if (outcome.anticipationReel !== undefined) {
            reels[outcome.anticipationReel].classList.remove("anticipation-reel");

            if (window.stopAnticipationFx) {
                window.stopAnticipationFx();
            }
        }

        finishOutcome(outcome);
    }, totalDuration + 80);
}
function highlightReel(reelIndex) {
    const reels = document.querySelectorAll(".reel");

    reels[reelIndex].classList.add("win-reel");

    setTimeout(() => {
        reels[reelIndex].classList.remove("win-reel");
    }, WIN_REEL_GLOW_DURATION);
}
function createCoinParticle(startX, startY) {
    const effects = gameConfig.effects;

    const coin = document.createElement("div");

    coin.classList.add("coin-particle");
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
function spawnCoinParticlesFromReel(reelIndex) {
    const reels = document.querySelectorAll(".reel");
    const reelRect = reels[reelIndex].getBoundingClientRect();

    const startX = reelRect.left + reelRect.width / 2;
    const startY = reelRect.top + reelRect.height / 2;

    const stagger = gameConfig.effects.coinParticleStagger;

    for (let i = 0; i < COIN_PARTICLE_COUNT; i++) {
        setTimeout(() => {
            createCoinParticle(startX, startY);
        }, i * stagger);
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
    topWinPanel.textContent = formatBalance(currentBalance);
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

        topWinPanel.textContent = formatBalance(currentValue);

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

    topWinPanel.style.setProperty(
        "--balance-pop-duration",
        `${gameConfig.effects.balancePopDuration}ms`
    );

    topWinPanel.classList.remove("balance-pop");

    void topWinPanel.offsetWidth;

    topWinPanel.classList.add("balance-pop");

    setTimeout(() => {
        topWinPanel.classList.remove("balance-pop");
    }, gameConfig.effects.balancePopDuration);
}

function startBalancePulse() {
    if (!gameConfig.effects.balancePopEnabled) {
        return;
    }

    topWinPanel.classList.remove("balance-pop");
    topWinPanel.classList.add("balance-pulsing");
}

function stopBalancePulse() {
    topWinPanel.classList.remove("balance-pulsing");
}

function finishOutcome(outcome) {
    slotArea.classList.add("result-ready");

    if (
        gameConfig.fx.slotShineEnabled &&
        window.playSlotShineFx &&
        (outcome.type === "smallWin" || outcome.type === "jackpot")
    ) {
        window.playSlotShineFx();
    }

    popSymbols();

    handleOutcomeType(outcome);

    const delay = outcome.balanceDelay || 0;

    setTimeout(() => {
        animateBalanceTo(outcome.balance, outcome.balanceCountDuration, outcome);
    }, delay);
}
function highlightWinSymbols(outcome) {
    const winSymbols = outcome.winSymbols || [];

    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const symbolsInReel = reelStrips[reelIndex].querySelectorAll(".symbol");

        for (let rowIndex = 0; rowIndex < VISIBLE_ROWS; rowIndex++) {
            const symbolElement = symbolsInReel[rowIndex];

            if (!symbolElement) {
                continue;
            }

            const symbolName = symbolElement.dataset.symbol;

            if (!winSymbols.includes(symbolName)) {
                continue;
            }

            symbolElement.classList.remove("win-symbol");
            symbolElement.classList.remove("pulsing");

            void symbolElement.offsetWidth;

            symbolElement.classList.add("win-symbol");

            if (gameConfig.effects.bonusPulseEnabled) {
                setTimeout(() => {
                    symbolElement.classList.add("pulsing");
                }, WIN_SYMBOL_POP_DURATION);
            }
        }
    }
}
function clearWinSymbols() {
    const winSymbols = document.querySelectorAll(".win-symbol");

    for (let i = 0; i < winSymbols.length; i++) {
        winSymbols[i].classList.remove("win-symbol");
        winSymbols[i].classList.remove("pulsing");
    }
}
function updateCtaText() {
    ctaTitle.textContent = gameConfig.cta.title;
    ctaAmount.textContent = gameConfig.cta.amount;
    ctaButton.textContent = gameConfig.cta.buttonText;
}
function applyGameAssets() {
    const theme = gameConfig.theme;

    gameLogo.src = gameConfig.assets.logo;

    document.documentElement.style.setProperty(
    "--balance-panel-image",
    `url("${gameConfig.assets.ui.balancePanel}")`
);

    document.body.style.background = `
        linear-gradient(${theme.bodyOverlayTop}, ${theme.bodyOverlayBottom}),
        url("${gameConfig.assets.background}") center center / cover no-repeat
    `;
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


    const reels = document.querySelectorAll(".reel");

    for (let i = 0; i < reels.length; i++) {
        reels[i].style.background = `linear-gradient(${theme.reelTop}, ${theme.reelBottom})`;
        reels[i].style.borderColor = theme.reelBorder;
    }
topWinPanel.style.color = theme.balanceText;
}

function applyGameFonts() {
    const fonts = gameConfig.fonts;

    topWinPanel.style.fontFamily = fonts.balancePanel;

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
    const firstSymbol = reelStrips[0]?.querySelector(".symbol");

    if (firstSymbol) {
        return firstSymbol.getBoundingClientRect().height / getCurrentScale();
    }

    return 82;
}
function getCurrentScale() {
    const scaleValue = getComputedStyle(gameScaler).getPropertyValue("--game-scale");

    return parseFloat(scaleValue) || 1;
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

//Events
spinBtn.addEventListener("click", handleSpinButtonClick);
ctaButton.addEventListener("click", goToOffer);

window.addEventListener("resize", () => {
    updateGameScale();
});

window.addEventListener("orientationchange", () => {
    setTimeout(updateGameScale, 300);
});

initGame();
