console.log("JS connected");

// Elements
const spinBtn = document.getElementById("spinBtn");
const slotWin = document.getElementById("slotWin");
const slotArea = document.getElementById("slotArea");
const symbolIcons = document.querySelectorAll(".symbol-icon");
const ctaPopup = document.getElementById("ctaPopup");
const overlay = document.getElementById("overlay");

// State
let spinCount = 0;
let isSpinning = false;
let isCtaActive = false;

// Settings
const REEL_CHANGE_SPEED = 100;
const WIN_POP_DURATION = 400;
const JACKPOT_FLASH_DURATION = 600;
const CTA_DELAY = 1200;
const SHOW_CLASS_DELAY = 10;
const SMALL_WIN_GLOW_DURATION = 500;
const SYMBOL_POP_DURATION = 250;


// Data
const outcomes = [

    {
        type: "lose",
        win: "$0",
        reels: ["🍋", "💎", "🍒"],
        spinDuration: 1200   
    },

    {
        type: "smallWin",
        win: "$50",
        reels: ["⭐", "⭐", "🍒"],
        spinDuration: 1200
    },

    {
        type: "jackpot",
        win: "BIG WIN",
        reels: ["💎", "💎", "💎"],
        spinDuration: 1800
    }

];
const reelSymbols = ["💎", "🍒", "⭐", "🍋"];
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
function showWinText(text) {
    slotWin.classList.remove("win-pop");

    slotWin.textContent = text || "$0";

    slotWin.classList.add("win-pop");

    setTimeout(() => {
        slotWin.classList.remove("win-pop");
    }, WIN_POP_DURATION);
}
function setReels(reels) {
    for (let i = 0; i < symbolIcons.length; i++) {
        symbolIcons[i].textContent = reels[i] || "?";
    }
}
function showJackpot() {
    showJackpotTextStyle();

    slotArea.classList.add("jackpot-state");
    slotArea.classList.add("jackpot-flash");

    setTimeout(() => {
        slotArea.classList.remove("jackpot-flash");
    }, JACKPOT_FLASH_DURATION);

    setTimeout(() => {
        showCta();
    }, CTA_DELAY);
}
function getRandomSymbol() {
    return reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
}

function startSpinAnimation() {
    const spinAnimation = setInterval(() => {
        for (let i = 0; i < symbolIcons.length; i++) {
            symbolIcons[i].textContent = getRandomSymbol();
        }
    }, REEL_CHANGE_SPEED);

    return spinAnimation;
}
function finishSpin(spinAnimation, outcome) {
    stopSpinVisuals(spinAnimation);

    showOutcome(outcome);

    handleOutcomeType(outcome);
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

    setTimeout(() => {
        finishSpin(spinAnimation, currentOutcome);
    }, currentOutcome.spinDuration || SPIN_DURATION);
}
function goToOffer() {
    console.log("Go to offer");
}

function startSpinVisuals() {
    lockSpinButton();

    slotArea.classList.add("shaking");
    slotWin.textContent = "...";
}

function stopSpinVisuals(spinAnimation) {
    clearInterval(spinAnimation);

    slotArea.classList.remove("shaking");
} 
function showOutcome(outcome) {
    resetWinTextStyle();

    showWinText(outcome.win);
    setReels(outcome.reels);
    popSymbols();
}
function showSmallWin() {
    slotArea.classList.add("small-win");

    setTimeout(() => {
        slotArea.classList.remove("small-win");
    }, SMALL_WIN_GLOW_DURATION);
} 
function handleOutcomeType(outcome) {
    if (outcome.type === "smallWin") {
        showSmallWin();
        unlockSpinButton();
        return;
    }

    if (outcome.type === "jackpot") {
        showJackpot();
        return;
    }

    unlockSpinButton();
}
function resetWinTextStyle() {
    slotWin.classList.remove("jackpot-win");
    slotWin.classList.add("default-win");
}
function showJackpotTextStyle() {
    slotWin.classList.remove("default-win");
    slotWin.classList.add("jackpot-win");
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

    resetWinTextStyle();

    slotArea.classList.remove("jackpot-state");
    slotArea.classList.remove("jackpot-flash");
    slotArea.classList.remove("small-win");
    slotArea.classList.remove("shaking");

    overlay.style.display = "none";
    overlay.classList.remove("show");

    ctaPopup.style.display = "none";
    ctaPopup.classList.remove("show");

    unlockSpinButton();
}
function popSymbols() {
    for (let i = 0; i < symbolIcons.length; i++) {
        symbolIcons[i].classList.remove("pop");

        void symbolIcons[i].offsetWidth;

        symbolIcons[i].classList.add("pop");

        setTimeout(() => {
            symbolIcons[i].classList.remove("pop");
        }, SYMBOL_POP_DURATION);
    }
}

//Events
spinBtn.addEventListener("click", handleSpinButtonClick);
ctaPopup.addEventListener("click", goToOffer);
initGame();
