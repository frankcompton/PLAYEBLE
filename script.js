console.log("JS connected");

// Elements
const spinBtn = document.getElementById("spinBtn");
const topWinPanel = document.getElementById("topWinPanel");
const slotArea = document.getElementById("slotArea");
const symbolIcons = document.querySelectorAll(".symbol-icon");
const ctaPopup = document.getElementById("ctaPopup");
const overlay = document.getElementById("overlay");
const reelStrips = document.querySelectorAll(".reel-strip");

// State
let spinCount = 0;
let isSpinning = false;
let isCtaActive = false;
let currentBalance = 0;

// Settings
const REEL_CHANGE_SPEED = 100;
const WIN_POP_DURATION = 400;
const JACKPOT_FLASH_DURATION = 600;
const CTA_DELAY = 500;
const SHOW_CLASS_DELAY = 10;
const SMALL_WIN_GLOW_DURATION = 500;
const SYMBOL_POP_DURATION = 250;
const VISIBLE_ROWS = 3;
const SYMBOL_HEIGHT = 90;
const SPIN_FILLER_COUNT = 12;
const REEL_SPIN_BASE_DURATION = 900;
const REEL_SPIN_STEP_DURATION = 300;
const WIN_REEL_GLOW_DURATION = 900;
const COIN_PARTICLE_COUNT = 10;
const COIN_PARTICLE_DURATION = 800;
const WIN_SYMBOL_POP_DURATION = 650;


// Data
const startScreenReels = {
    reels: [
        "coin:100.00", "s3", "s1",
        "coin:250.00", "s1", "s1",
        "s7", "s2", "s1"
    ]
};
const outcomes = [
    {
        type: "lose",
        balance: 0,
        balanceDelay: 0,
        balanceCountDuration: 0,
        reels: [
            "s6", "s6", "s2",
            "s6", "s3", "s1",
            "s5", "s5", "s1"
        ],
        spinDuration: 1200
    },

    {
    type: "smallWin",
    balance: 350,
    balanceDelay: 300,
    balanceCountDuration: 500,
    winReels: [0],
    reels: [
        "coin:100.00", "s3", "s1",
        "coin:250.00", "s1", "s1",
        "s7", "s2", "s1"
    ],
    spinDuration: 1500
},

    {
    type: "jackpot",
    balance: 10350,
    balanceDelay: 500,
    balanceCountDuration: 2000,
    winReels: [0, 1, 2],
    winSymbols: ["bonus"],
    reels: [
        "coin:350.00", "s2", "s1",
        "coin:250.00", "bonus", "s3",
        "bonus", "s7", "bonus"
    ],
    spinDuration: 1800
}
];
const symbolMap = {
    s1: "assets/symbols/cherry.webp",
    s2: "assets/symbols/lemon.webp",
    s3: "assets/symbols/bar.webp",
    s4: "assets/symbols/grape.webp",
    s5: "assets/symbols/melon.webp",
    s6: "assets/symbols/orange.webp",
    s7: "assets/symbols/plum.webp",

    coin: "assets/symbols/coin.webp",
    bonus: "assets/symbols/coin2.webp"
};
const reelSymbols = [
    "s1",
    "s2",
    "s3",
    "s4",
    "s5",
    "s6",
    "s7",
    "bonus"
];
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
    overlay.style.display = "block";
    ctaPopup.style.display = "flex";

    setTimeout(() => {
        overlay.classList.add("show");
        ctaPopup.classList.add("show");
    }, SHOW_CLASS_DELAY);
}
function showCta() {
    spinBtn.textContent = "CLAIM BONUS";

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
    spinCount = 0;
    isSpinning = false;
    isCtaActive = false;

    spinBtn.textContent = "SPIN";


    slotArea.classList.remove("jackpot-state");
    slotArea.classList.remove("jackpot-flash");
    slotArea.classList.remove("small-win");

    overlay.style.display = "none";
    overlay.classList.remove("show");

    ctaPopup.style.display = "none";
    ctaPopup.classList.remove("show");

    initReels();

    setBalance(0);

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
function createFillerSymbols() {
    const fillerSymbols = [];

    for (let i = 0; i < SPIN_FILLER_COUNT; i++) {
        fillerSymbols.push(getRandomSymbol());
    }

    return fillerSymbols;
}
function prepareReelStrip(reelIndex, outcome) {
    const resultSymbols = getOutcomeColumn(outcome, reelIndex);
    const fillerSymbols = createFillerSymbols();

    const stripSymbols = resultSymbols.concat(fillerSymbols);

    reelStrips[reelIndex].innerHTML = stripSymbols
        .map(createSymbolHtml)
        .join("");


    const startOffset = SPIN_FILLER_COUNT * SYMBOL_HEIGHT;

    reelStrips[reelIndex].style.transitionDuration = "0ms";
    reelStrips[reelIndex].style.transform = `translateY(-${startOffset}px)`;
}
function prepareReelsForSpin(outcome) {
    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        prepareReelStrip(reelIndex, outcome);
    }
}
function animateReelsToResult(outcome) {
    for (let reelIndex = 0; reelIndex < reelStrips.length; reelIndex++) {
        const duration = REEL_SPIN_BASE_DURATION + REEL_SPIN_STEP_DURATION * reelIndex;

        setTimeout(() => {
            reelStrips[reelIndex].style.transitionDuration = `${duration}ms`;
            reelStrips[reelIndex].style.transform = "translateY(0)";
        }, 20);
    }

    const totalDuration = REEL_SPIN_BASE_DURATION + REEL_SPIN_STEP_DURATION * (reelStrips.length - 1);

    setTimeout(() => {
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
    return `${Math.floor(value)} A$`;
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


//Events
spinBtn.addEventListener("click", handleSpinButtonClick);
ctaPopup.addEventListener("click", goToOffer);
initGame();
