import { gameConfig } from "./config.js";

let fxLayer = null;
let coinRainTimer = null;
let anticipationTimer = null;
let stylesReady = false;

const gameScalerElement = document.getElementById("gameScaler");

function initFx() {
    fxLayer = document.getElementById("fxLayer");

    if (!fxLayer) {
        return;
    }

    ensureFxStyles();
    fxLayer.classList.add("single-fx-layer");

    if (gameConfig.fx.idleSparksEnabled) {
        createIdleSparks();
    }

    if (gameConfig.fx.twinkleStarsEnabled) {
        createTwinkleStars();
    }
}

function preloadFx() {
    return Promise.resolve();
}

function ensureFxStyles() {
    if (stylesReady) {
        return;
    }

    stylesReady = true;

    const style = document.createElement("style");

    style.textContent = `
        .single-fx-layer {
            position: fixed;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 50;
        }

        .single-fx-particle,
        .single-fx-coin,
        .single-fx-confetti,
        .single-fx-star,
        .single-fx-ring,
        .single-fx-rays,
        .single-fx-flash {
            position: absolute;
            pointer-events: none;
            will-change: transform, opacity;
        }

        .single-fx-idle {
            width: var(--size);
            height: var(--size);
            left: var(--x);
            top: var(--y);
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 242, 150, 0.95), rgba(255, 190, 40, 0));
            box-shadow: 0 0 10px rgba(255, 220, 80, 0.8);
            opacity: 0.75;
            animation: singleIdleFloat var(--duration) linear infinite;
            animation-delay: var(--delay);
        }

        .single-fx-twinkle {
            width: var(--size);
            height: var(--size);
            left: var(--x);
            top: var(--y);
            transform: rotate(45deg);
            background: #fff2a0;
            box-shadow: 0 0 12px rgba(255, 235, 130, 0.9);
            opacity: 0;
            animation: singleTwinkle var(--duration) ease-in-out infinite;
            animation-delay: var(--delay);
        }

        .single-fx-burst {
            width: var(--size);
            height: var(--size);
            left: var(--x);
            top: var(--y);
            border-radius: 50%;
            background: var(--color);
            box-shadow: 0 0 12px var(--color);
            animation: singleBurst var(--duration) cubic-bezier(0.12, 0.68, 0.22, 1) forwards;
        }

        .single-fx-coin {
            width: var(--size);
            height: var(--size);
            left: var(--x);
            top: var(--y);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: #7b2500;
            font-family: "Arial Black", Impact, sans-serif;
            font-size: calc(var(--size) * 0.5);
            font-weight: 900;
            background: radial-gradient(circle at 35% 28%, #fff8b8, #ffd84a 30%, #df9700 64%, #814000);
            box-shadow: inset 0 2px rgba(255,255,255,0.62), inset 0 -3px 5px rgba(70,30,0,0.42), 0 0 14px rgba(255, 210, 50, 0.85);
            animation: singleCoinFall var(--duration) linear forwards;
        }

        .single-fx-coin::before {
            content: "";
            position: absolute;
            inset: 22%;
            border: 2px solid rgba(120, 65, 0, 0.35);
            border-radius: 50%;
        }

        .single-fx-confetti {
            width: var(--w);
            height: var(--h);
            left: var(--x);
            top: var(--y);
            background: var(--color);
            border-radius: 2px;
            animation: singleConfetti var(--duration) cubic-bezier(0.16, 0.7, 0.2, 1) forwards;
        }

        .single-fx-ring {
            left: var(--x);
            top: var(--y);
            width: var(--size);
            height: var(--size);
            border: 4px solid rgba(255, 220, 70, 0.9);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0.3);
            box-shadow: 0 0 20px rgba(255, 220, 70, 0.8);
            animation: singleRing var(--duration) ease-out forwards;
        }

        .single-fx-rays {
            left: 50%;
            top: var(--y);
            width: 620px;
            height: 620px;
            margin-left: -310px;
            margin-top: -310px;
            border-radius: 50%;
            background: repeating-conic-gradient(from 0deg, rgba(255, 236, 110, 0.38) 0deg 6deg, rgba(255, 236, 110, 0) 6deg 16deg);
            mix-blend-mode: screen;
            opacity: 0;
            animation: singleRays var(--duration) ease-out forwards;
        }

        .single-fx-flash {
            position: fixed;
            inset: 0;
            background: rgba(255, 238, 165, 0.9);
            opacity: 0;
            animation: singleFlash var(--duration) ease-out forwards;
        }

        @keyframes singleIdleFloat {
            from { transform: translate3d(0, 110vh, 0) scale(0.7); opacity: 0; }
            12% { opacity: 0.75; }
            88% { opacity: 0.75; }
            to { transform: translate3d(var(--drift), -18vh, 0) scale(1.15); opacity: 0; }
        }

        @keyframes singleTwinkle {
            0%, 100% { opacity: 0; transform: rotate(45deg) scale(0.4); }
            50% { opacity: 0.9; transform: rotate(45deg) scale(1); }
        }

        @keyframes singleBurst {
            from { transform: translate(-50%, -50%) translate(0, 0) scale(0.45); opacity: 1; }
            to { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.2); opacity: 0; }
        }

        @keyframes singleCoinFall {
            from { transform: translate(-50%, -50%) translate(0, -40px) scale(0.65) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            to { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(var(--end-scale)) rotate(var(--rot)); opacity: 0; }
        }

        @keyframes singleConfetti {
            from { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg); opacity: 1; }
            to { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
        }

        @keyframes singleRing {
            from { transform: translate(-50%, -50%) scale(0.25); opacity: 0.95; }
            to { transform: translate(-50%, -50%) scale(3.6); opacity: 0; }
        }

        @keyframes singleRays {
            0% { opacity: 0; transform: scale(0.7) rotate(0deg); }
            18% { opacity: 0.9; }
            100% { opacity: 0; transform: scale(1.18) rotate(42deg); }
        }

        @keyframes singleFlash {
            0% { opacity: 0; }
            18% { opacity: 0.72; }
            100% { opacity: 0; }
        }
    `;

    document.head.appendChild(style);
}

function createIdleSparks() {
    const count = Math.min(gameConfig.fx.idleSparkCount || 34, 48);

    for (let i = 0; i < count; i++) {
        const spark = document.createElement("div");

        spark.className = "single-fx-particle single-fx-idle";
        spark.style.setProperty("--x", `${random(0, 100)}vw`);
        spark.style.setProperty("--y", `${random(-20, 110)}vh`);
        spark.style.setProperty("--size", `${random(gameConfig.fx.idleSparkMinSize || 2, gameConfig.fx.idleSparkMaxSize || 5)}px`);
        spark.style.setProperty("--drift", `${random(-36, 36)}px`);
        spark.style.setProperty("--duration", `${random(4.8, 9.2)}s`);
        spark.style.setProperty("--delay", `${random(-8, 0)}s`);

        fxLayer.appendChild(spark);
    }
}

function createTwinkleStars() {
    const count = Math.min(gameConfig.fx.twinkleStarCount || 12, 20);

    for (let i = 0; i < count; i++) {
        const star = document.createElement("div");

        star.className = "single-fx-star single-fx-twinkle";
        star.style.setProperty("--x", `${random(4, 96)}vw`);
        star.style.setProperty("--y", `${random(4, 82)}vh`);
        star.style.setProperty("--size", `${random(gameConfig.fx.twinkleStarMinSize || 4, gameConfig.fx.twinkleStarMaxSize || 8)}px`);
        star.style.setProperty("--duration", `${random(1.4, 3.4)}s`);
        star.style.setProperty("--delay", `${random(-3, 0)}s`);

        fxLayer.appendChild(star);
    }
}

function playSpinStartFx() {
    const point = getScreenPointFromGamePoint(gameConfig.scene.baseWidth / 2, gameConfig.fx.spinStartY || 650);
    spawnBurst(point.x, point.y, 18, 45, 360);
    spawnRing(point.x, point.y, 42, 520);
}

function playReelStopFx(reelIndex) {
    const point = getReelCenterPoint(reelIndex);
    spawnBurst(point.x, point.y, 8, 28, 420);
}

function playAnticipationFx(reelIndex) {
    stopAnticipationFx();

    const point = getReelCenterPoint(reelIndex);

    anticipationTimer = setInterval(() => {
        spawnBurst(point.x, point.y, 4, 28, 360);
    }, 120);
}

function stopAnticipationFx() {
    if (anticipationTimer) {
        clearInterval(anticipationTimer);
        anticipationTimer = null;
    }
}

function playSmallWinFx(winReels) {
    const reels = winReels || [0];

    for (const reelIndex of reels) {
        const point = getReelCenterPoint(reelIndex);
        spawnBurst(point.x, point.y - 45, 24, 100, 850);
        spawnRing(point.x, point.y - 20, 38, 560);
    }
}

function playSlotShineFx() {
    const point = getScreenPointFromGamePoint(gameConfig.scene.baseWidth / 2, gameConfig.scene.baseHeight / 2);
    spawnRing(point.x, point.y, 95, 700);
}

function playBalanceSparkFx() {
    const point = getScreenPointFromGamePoint(gameConfig.scene.baseWidth / 2, 88);
    spawnBurst(point.x, point.y, 8, 40, 500);
}

function playCtaFx() {
    spawnConfetti(Math.min(gameConfig.fx.ctaConfettiCount || 56, 72), gameConfig.fx.ctaConfettiDuration || 2500);
    startCoinRain(2200);
}

function playJackpotFx() {
    const point = getScreenPointFromGamePoint(gameConfig.scene.baseWidth / 2, gameConfig.fx.jackpotBurstY || 380);

    if (gameConfig.fx.jackpotFlashEnabled) {
        spawnFlash(gameConfig.fx.jackpotFlashDuration || 520);
    }

    if (gameConfig.fx.jackpotRaysEnabled) {
        spawnRays(gameConfig.fx.jackpotRaysY || 370, gameConfig.fx.jackpotRaysDuration || 1400);
    }

    spawnBurst(point.x, point.y, Math.min(gameConfig.fx.jackpotBurstCount || 60, 80), 210, gameConfig.fx.jackpotBurstDuration || 1500);
    spawnRing(point.x, point.y, 70, gameConfig.fx.jackpotShockwaveDuration || 680);
    startCoinRain(2600);
}

function startCoinRain(duration) {
    if (!gameConfig.fx.coinRainEnabled || !fxLayer) {
        return;
    }

    stopCoinRain();

    const interval = Math.max(35, gameConfig.fx.coinRainInterval || 60);
    const endTime = Date.now() + duration;

    coinRainTimer = setInterval(() => {
        spawnCoin();

        if (Date.now() >= endTime) {
            stopCoinRain();
        }
    }, interval);
}

function stopCoinRain() {
    if (coinRainTimer) {
        clearInterval(coinRainTimer);
        coinRainTimer = null;
    }
}

function spawnBurst(x, y, count, spread, duration) {
    if (!fxLayer) {
        return;
    }

    const colors = ["#ffe27a", "#ffc83d", "#fff2b0", "#7df6ff"];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        const angle = random(0, Math.PI * 2);
        const distance = random(spread * 0.24, spread);
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance - random(16, 70);

        particle.className = "single-fx-particle single-fx-burst";
        particle.style.setProperty("--x", `${x}px`);
        particle.style.setProperty("--y", `${y}px`);
        particle.style.setProperty("--dx", `${dx}px`);
        particle.style.setProperty("--dy", `${dy}px`);
        particle.style.setProperty("--size", `${random(3, 9)}px`);
        particle.style.setProperty("--duration", `${duration}ms`);
        particle.style.setProperty("--color", colors[Math.floor(random(0, colors.length))]);

        fxLayer.appendChild(particle);
        removeAfter(particle, duration + 80);
    }
}

function spawnCoin() {
    const coin = document.createElement("div");
    const size = random(gameConfig.fx.coinRainMinSize || 14, gameConfig.fx.coinRainMaxSize || 26);

    coin.className = "single-fx-coin";
    coin.textContent = gameConfig.fx.coinRainText || gameConfig.currency.effectCoinText || "$";
    coin.style.setProperty("--x", `${random(4, 96)}vw`);
    coin.style.setProperty("--y", "-24px");
    coin.style.setProperty("--size", `${size}px`);
    coin.style.setProperty("--dx", `${random(-80, 80)}px`);
    coin.style.setProperty("--dy", `${window.innerHeight + 120}px`);
    coin.style.setProperty("--rot", `${random(240, 920)}deg`);
    coin.style.setProperty("--end-scale", `${random(1.0, 1.55)}`);
    coin.style.setProperty("--duration", `${random(1200, gameConfig.fx.coinRainDropDuration || 2600)}ms`);

    fxLayer.appendChild(coin);
    removeAfter(coin, gameConfig.fx.coinRainDropDuration + 250 || 2850);
}

function spawnConfetti(count, duration) {
    const colors = ["#ffd45a", "#ff6b6b", "#7df6ff", "#ff85c8", "#8bff7a", "#ffffff"];

    for (let i = 0; i < count; i++) {
        const piece = document.createElement("div");

        piece.className = "single-fx-confetti";
        piece.style.setProperty("--x", `${random(10, 90)}vw`);
        piece.style.setProperty("--y", `${random(8, 22)}vh`);
        piece.style.setProperty("--w", `${random(5, 10)}px`);
        piece.style.setProperty("--h", `${random(8, 15)}px`);
        piece.style.setProperty("--dx", `${random(-140, 140)}px`);
        piece.style.setProperty("--dy", `${random(260, 650)}px`);
        piece.style.setProperty("--rot", `${random(240, 1040)}deg`);
        piece.style.setProperty("--duration", `${random(duration * 0.72, duration)}ms`);
        piece.style.setProperty("--color", colors[Math.floor(random(0, colors.length))]);

        fxLayer.appendChild(piece);
        removeAfter(piece, duration + 180);
    }
}

function spawnRing(x, y, size, duration) {
    const ring = document.createElement("div");

    ring.className = "single-fx-ring";
    ring.style.setProperty("--x", `${x}px`);
    ring.style.setProperty("--y", `${y}px`);
    ring.style.setProperty("--size", `${size}px`);
    ring.style.setProperty("--duration", `${duration}ms`);

    fxLayer.appendChild(ring);
    removeAfter(ring, duration + 80);
}

function spawnRays(gameY, duration) {
    const rays = document.createElement("div");
    const point = getScreenPointFromGamePoint(gameConfig.scene.baseWidth / 2, gameY);

    rays.className = "single-fx-rays";
    rays.style.setProperty("--y", `${point.y}px`);
    rays.style.setProperty("--duration", `${duration}ms`);

    fxLayer.appendChild(rays);
    removeAfter(rays, duration + 80);
}

function spawnFlash(duration) {
    const flash = document.createElement("div");

    flash.className = "single-fx-flash";
    flash.style.setProperty("--duration", `${duration}ms`);

    fxLayer.appendChild(flash);
    removeAfter(flash, duration + 80);
}

function getReelCenterPoint(reelIndex) {
    const reel = document.querySelectorAll("#reels > div")[reelIndex];

    if (!reel) {
        return getScreenPointFromGamePoint(gameConfig.scene.baseWidth / 2, gameConfig.scene.baseHeight / 2);
    }

    const rect = reel.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function getScreenPointFromGamePoint(gameX, gameY) {
    if (!gameScalerElement) {
        return {
            x: gameX,
            y: gameY
        };
    }

    const rect = gameScalerElement.getBoundingClientRect();

    return {
        x: rect.left + gameX * (rect.width / gameConfig.scene.baseWidth),
        y: rect.top + gameY * (rect.height / gameConfig.scene.baseHeight)
    };
}

function removeAfter(element, delay) {
    setTimeout(() => {
        element.remove();
    }, delay);
}

function random(min, max) {
    return min + Math.random() * (max - min);
}

window.playJackpotFx = playJackpotFx;
window.playSpinStartFx = playSpinStartFx;
window.playReelStopFx = playReelStopFx;
window.playAnticipationFx = playAnticipationFx;
window.stopAnticipationFx = stopAnticipationFx;
window.playSmallWinFx = playSmallWinFx;
window.playSlotShineFx = playSlotShineFx;
window.playBalanceSparkFx = playBalanceSparkFx;
window.playCtaFx = playCtaFx;
window.stopCoinRain = stopCoinRain;
window.initFx = initFx;
window.preloadFx = preloadFx;
