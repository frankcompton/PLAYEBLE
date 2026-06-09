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
let currentSymbolHeight = gameConfig.grid.symbolHeight;
const SPIN_FILLER_COUNT = gameConfig.grid.fillerCount;

const REEL_SPIN_BASE_DURATION = gameConfig.timings.reelSpinBaseDuration;
const REEL_SPIN_STEP_DURATION = gameConfig.timings.reelSpinStepDuration;

const WIN_REEL_GLOW_DURATION = gameConfig.timings.winReelGlowDuration;

const COIN_PARTICLE_COUNT = gameConfig.effects.coinParticleCount;
const COIN_PARTICLE_DURATION = gameConfig.timings.coinParticleDuration;

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

function startSpinAnimation() {
    return null;
}
function finishSpin(spinAnimation, outcome) {
    prepareReelsForSpin(outcome);

    animateReelsToResult(outcome);
}
function startSpin() {
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
    console.log("Go to offer");
}

function startSpinVisuals() {
    lockSpinButton();

    slotArea.classList.remove("result-ready");

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

    for (let i = 0; i < winReels.length; i++) {
        const reelIndex = winReels[i];

        highlightReel(reelIndex);
        spawnCoinParticlesFromReel(reelIndex);
    }

    slotArea.classList.add("small-win");

    setTimeout(() => {
        slotArea.classList.remove("small-win");
    }, SMALL_WIN_GLOW_DURATION);
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

    spinCount = 0;
    isSpinning = false;
    isCtaActive = false;

    spinBtn.classList.remove("cta-ready");

    slotArea.classList.remove("jackpot-state");
    slotArea.classList.remove("jackpot-flash");
    slotArea.classList.remove("small-win");

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
    reelStrips[reelIndex].style.transform = `translateY(-${startOffset}px)`;
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
            reelStrips[reelIndex].style.transform = "translateY(0)";
        }, 20);
    }

    if (outcome.anticipationReel !== undefined) {
        setTimeout(() => {
            reels[outcome.anticipationReel].classList.add("anticipation-reel");
        }, outcome.anticipationDelay);
    }

    const totalDuration = Math.max(...reelDurations);

    setTimeout(() => {
        if (outcome.anticipationReel !== undefined) {
            reels[outcome.anticipationReel].classList.remove("anticipation-reel");
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
    const coin = document.createElement("div");

    coin.classList.add("coin-particle");
    coin.textContent = "$";

    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;

    const flyX = Math.random() * 160 - 80;
    const flyY = Math.random() * -140 - 40;

    coin.style.setProperty("--fly-x", `${flyX}px`);
    coin.style.setProperty("--fly-y", `${flyY}px`);

    document.body.appendChild(coin);

    setTimeout(() => {
        coin.remove();
    }, COIN_PARTICLE_DURATION);
}
function spawnCoinParticlesFromReel(reelIndex) {
    const reels = document.querySelectorAll(".reel");
    const reelRect = reels[reelIndex].getBoundingClientRect();

    const startX = reelRect.left + reelRect.width / 2;
    const startY = reelRect.top + reelRect.height / 2;

    for (let i = 0; i < COIN_PARTICLE_COUNT; i++) {
        setTimeout(() => {
            createCoinParticle(startX, startY);
        }, i * 35);
    }
}

function highlightWinReels(outcome) {
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
        reelStrips[reelIndex].style.transform = "translateY(0)";

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
function animateBalanceTo(targetBalance, duration) {
    const startBalance = currentBalance;
    const difference = targetBalance - startBalance;
    const startTime = performance.now();

    if (duration === 0 || difference === 0) {
        setBalance(targetBalance);
        return;
    }

    function updateBalance(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentValue = startBalance + difference * progress;

        topWinPanel.textContent = formatBalance(currentValue);

        if (progress < 1) {
            requestAnimationFrame(updateBalance);
        } else {
            setBalance(targetBalance);
        }
    }

    requestAnimationFrame(updateBalance);
}
function finishOutcome(outcome) {
    renderReels(outcome);

    slotArea.classList.add("result-ready");

    popSymbols();

    handleOutcomeType(outcome);

    const delay = outcome.balanceDelay || 0;

    setTimeout(() => {
        animateBalanceTo(outcome.balance, outcome.balanceCountDuration);
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

            setTimeout(() => {
                symbolElement.classList.add("pulsing");
            }, WIN_SYMBOL_POP_DURATION);
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

    document.body.style.background = `
        linear-gradient(${theme.bodyOverlayTop}, ${theme.bodyOverlayBottom}),
        url("${gameConfig.assets.background}") center center / cover no-repeat
    `;
}
function applyGameLayout() {
    const isMobile = window.innerWidth <= 600;
    const layout = isMobile ? gameConfig.layout.mobile : gameConfig.layout;

    currentSymbolHeight = layout.symbolHeight || gameConfig.grid.symbolHeight;

    game.style.gap = `${layout.gameGap}px`;

    topWinPanel.style.width = layout.balancePanelWidth;
    topWinPanel.style.maxWidth = layout.balancePanelMaxWidth;
    topWinPanel.style.height = layout.balancePanelHeight;
    topWinPanel.style.fontSize = layout.balancePanelFontSize;
    topWinPanel.style.marginBottom = layout.balancePanelMarginBottom;

    slotStage.style.width = layout.slotStageWidth;
    slotStage.style.maxWidth = layout.slotStageMaxWidth;
    slotStage.style.paddingTop = layout.slotStagePaddingTop;

    gameLogo.style.width = layout.logoWidth;
    gameLogo.style.maxWidth = layout.logoMaxWidth;

    slotArea.style.setProperty("--symbol-height", `${currentSymbolHeight}px`);
    slotArea.style.width = layout.slotWidth;
    slotArea.style.maxWidth = layout.slotMaxWidth;
    slotArea.style.height = layout.slotHeight;
    slotArea.style.padding = layout.slotPadding;

    spinBtn.style.width = layout.spinButtonSize;
    spinBtn.style.height = layout.spinButtonSize;

    spinText.style.fontSize = layout.spinButtonFontSize;

    document.documentElement.style.setProperty("--coin-value-font-size", layout.coinValueFontSize || "24px");
}
function applyGameTheme() {
    const theme = gameConfig.theme;

    topWinPanel.style.background = `linear-gradient(${theme.balancePanelTop}, ${theme.balancePanelBottom})`;
    topWinPanel.style.borderColor = theme.balancePanelBorder;
    topWinPanel.style.color = theme.balanceText;

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
}
function getCurrentSymbolHeight() {
    const firstSymbol = reelStrips[0]?.querySelector(".symbol");

    if (firstSymbol) {
        return firstSymbol.getBoundingClientRect().height / getCurrentScale();
    }

    return gameConfig.grid.symbolHeight;
}
function getCurrentScale() {
    const scaleValue = getComputedStyle(gameScaler).getPropertyValue("--game-scale");

    return parseFloat(scaleValue) || 1;
}
function updateGameScale() {
    const baseWidth = 430;
    const baseHeight = 760;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const scaleByWidth = viewportWidth / baseWidth;
    const scaleByHeight = viewportHeight / baseHeight;

    const scale = Math.min(scaleByWidth, scaleByHeight);

    gameScaler.style.setProperty("--game-scale", scale);
}

//Events
spinBtn.addEventListener("click", handleSpinButtonClick);
ctaButton.addEventListener("click", goToOffer);
window.addEventListener("resize", () => {
    updateGameScale();
});

initGame();
