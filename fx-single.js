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
            background: radial-gradient(circle, rgba(255, 246, 170, 0.98), rgba(255, 204, 60, 0.55) 42%, rgba(255, 190, 40, 0));
            box-shadow: 0 0 15px rgba(255, 225, 95, 0.95);
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
            box-shadow: 0 0 16px rgba(255, 235, 130, 0.95);
            opacity: 0;
            animation: singleTwinkle var(--duration) ease-in-out infinite;
            animation-delay: var(--delay);
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
            box-shadow: inset 0 2px rgba(255,255,255,0.62), inset 0 -4px 6px rgba(70,30,0,0.45), 0 0 18px rgba(255, 210, 50, 0.92);
            animation: singleCoinFall var(--duration) linear forwards;
        }

        .single-fx-coin-burst {
            animation: singleCoinBurst var(--duration) cubic-bezier(0.12, 0.72, 0.18, 1) forwards;
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
            transform-origin: center center;
            animation: singleConfetti var(--duration) ease-in forwards;
        }

        .single-fx-rays {
            left: 50%;
            top: var(--y);
            width: 1020px;
            height: 1020px;
            margin-left: -510px;
            margin-top: -510px;
            border-radius: 50%;
            background: repeating-conic-gradient(from 0deg, rgba(255, 236, 110, 0.34) 0deg 6deg, rgba(255, 236, 110, 0) 6deg 17deg);
            mix-blend-mode: screen;
            opacity: 0;
            animation: singleRays var(--duration) ease-out forwards;
        }

        .single-fx-flash {
            position: fixed;
            inset: 0;
            background: rgba(255, 238, 165, 0.82);
            opacity: 0;
            animation: singleFlash var(--duration) ease-out forwards;
        }

        @keyframes singleIdleFloat {
            from { transform: translate3d(0, 115vh, 0) scale(0.82); opacity: 0; }
            14% { opacity: 0.78; }
            88% { opacity: 0.72; }
            to { transform: translate3d(var(--drift), -20vh, 0) scale(1.25); opacity: 0; }
        }

        @keyframes singleTwinkle {
            0%, 100% { opacity: 0; transform: rotate(45deg) scale(0.45); }
            50% { opacity: 0.92; transform: rotate(45deg) scale(1.08); }
        }

        @keyframes singleCoinFall {
            from { transform: translate(-50%, -50%) translate(0, -52px) scale(0.72) rotate(0deg); opacity: 0; }
            9% { opacity: 1; }
            to { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(var(--end-scale)) rotate(var(--rot)); opacity: 0; }
        }

        @keyframes singleCoinBurst {
            0% { transform: translate(-50%, -50%) translate(0, 0) scale(0.42) rotate(0deg); opacity: 0; }
            9% { opacity: 1; }
            34% { transform: translate(-50%, -50%) translate(calc(var(--dx) * 0.58), var(--burst-y)) scale(1.05) rotate(calc(var(--rot) * 0.35)); opacity: 1; }
            100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(var(--end-scale)) rotate(var(--rot)); opacity: 0; }
        }

        @keyframes singleConfetti {
            0% { transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) rotateY(0deg); opacity: 0; }
            8% { opacity: 1; }
            100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--rot)) rotateY(540deg); opacity: 0; }
        }

        @keyframes singleRays {
            0% { opacity: 0; transform: scale(0.72) rotate(0deg); }
            20% { opacity: 0.88; }
            100% { opacity: 0; transform: scale(1.18) rotate(42deg); }
        }

        @keyframes singleFlash {
            0% { opacity: 0; }
            18% { opacity: 0.65; }
            100% { opacity: 0; }
        }
    `;

    document.head.appendChild(style);
}

function createIdleSparks() {
    const count = Math.min(gameConfig.fx.idleSparkCount || 40, 54);

    for (let i = 0; i < count; i++) {
        const spark = document.createElement("div");

        spark.className = "single-fx-particle single-fx-idle";
        spark.style.setProperty("--x", `${random(0, 100)}vw`);
        spark.style.setProperty("--y", `${random(-25, 112)}vh`);
        spark.style.setProperty("--size", `${random(4, 10)}px`);
        spark.style.setProperty("--drift", `${random(-48, 48)}px`);
        spark.style.setProperty("--duration", `${random(7.2, 14.5)}s`);
        spark.style.setProperty("--delay", `${random(-14, 0)}s`);

        fxLayer.appendChild(spark);
    }
}

function createTwinkleStars() {
    const count = Math.min(gameConfig.fx.twinkleStarCount || 14, 22);

    for (let i = 0; i < count; i++) {
        const star = document.createElement("div");

        star.className = "single-fx-star single-fx-twinkle";
        star.style.setProperty("--x", `${random(4, 96)}vw`);
        star.style.setProperty("--y", `${random(4, 82)}vh`);
        star.style.setProperty("--size", `${random(5, 11)}px`);
        star.style.setProperty("--duration", `${random(1.8, 4.2)}s`);
        star.style.setProperty("--delay", `${random(-4, 0)}s`);

        fxLayer.appendChild(star);
    }
}

function playSpinStartFx() {
    // No-op for Moloco single: avoids the small center wave effect during reel spin.
}

function playReelStopFx(reelIndex) {
    // No-op for Moloco single: removes bubble particles on reel stops.
}

function playAnticipationFx(reelIndex) {
    // No-op for Moloco single: avoids bubble particles before the winning stop.
}

function stopAnticipationFx() {
    if (anticipationTimer) {
        clearInterval(anticipationTimer);
        anticipationTimer = null;
    }
}

function playSmallWinFx(winReels) {
    // No-op for Moloco single: removes bubble particles around win symbols.
}

function playSlotShineFx() {
    // No-op for Moloco single: removes central bubble particles.
}

function playBalanceSparkFx() {
    // No-op for Moloco single: removes bubble particles near the balance panel.
}

function playCtaFx() {
    spawnConfetti(Math.min(gameConfig.fx.ctaConfettiCount || 72, 82), gameConfig.fx.ctaConfettiDuration || 2700);
    startCoinRain(2600);
}

function playJackpotFx() {
    if (gameConfig.fx.jackpotFlashEnabled) {
        spawnFlash(gameConfig.fx.jackpotFlashDuration || 520);
    }

    if (gameConfig.fx.jackpotRaysEnabled) {
        spawnRays(gameConfig.fx.jackpotRaysY || 370, gameConfig.fx.jackpotRaysDuration || 1400);
    }

    spawnCoinBurst();
    startCoinRain(3200);
}

function startCoinRain(duration) {
    if (!gameConfig.fx.coinRainEnabled || !fxLayer) {
        return;
    }

    stopCoinRain();

    const interval = 42;
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

function spawnCoin() {
    const coin = document.createElement("div");
    const size = random(24, 42);
    const duration = random(1800, 4200);

    coin.className = "single-fx-coin";
    coin.textContent = gameConfig.fx.coinRainText || gameConfig.currency.effectCoinText || "$";
    coin.style.setProperty("--x", `${random(4, 96)}vw`);
    coin.style.setProperty("--y", "-30px");
    coin.style.setProperty("--size", `${size}px`);
    coin.style.setProperty("--dx", `${random(-105, 105)}px`);
    coin.style.setProperty("--dy", `${window.innerHeight + random(120, 260)}px`);
    coin.style.setProperty("--rot", `${random(280, 1080)}deg`);
    coin.style.setProperty("--end-scale", `${random(1.05, 1.7)}`);
    coin.style.setProperty("--duration", `${duration}ms`);

    fxLayer.appendChild(coin);
    removeAfter(coin, duration + 160);
}

function spawnCoinBurst() {
    if (!fxLayer) {
        return;
    }

    const point = getScreenPointFromGamePoint(
        gameConfig.scene.baseWidth / 2,
        gameConfig.fx.jackpotBurstY || 380
    );
    const count = Math.min(gameConfig.fx.jackpotBurstCount || 42, 54);

    for (let i = 0; i < count; i++) {
        const coin = document.createElement("div");
        const angle = random(Math.PI * 0.08, Math.PI * 0.92);
        const distance = random(115, 330);
        const dx = Math.cos(angle) * distance;
        const burstY = -random(90, 235);
        const dy = random(150, 390);
        const size = random(26, 50);
        const duration = random(1150, 2300);

        coin.className = "single-fx-coin single-fx-coin-burst";
        coin.textContent = gameConfig.fx.coinRainText || gameConfig.currency.effectCoinText || "$";
        coin.style.setProperty("--x", `${point.x + random(-28, 28)}px`);
        coin.style.setProperty("--y", `${point.y + random(-18, 18)}px`);
        coin.style.setProperty("--size", `${size}px`);
        coin.style.setProperty("--dx", `${dx}px`);
        coin.style.setProperty("--burst-y", `${burstY}px`);
        coin.style.setProperty("--dy", `${dy}px`);
        coin.style.setProperty("--rot", `${random(360, 1320)}deg`);
        coin.style.setProperty("--end-scale", `${random(0.85, 1.45)}`);
        coin.style.setProperty("--duration", `${duration}ms`);

        setTimeout(() => {
            fxLayer.appendChild(coin);
            removeAfter(coin, duration + 120);
        }, i * random(5, 18));
    }
}

function spawnConfetti(count, duration) {
    const colors = ["#ffd45a", "#ff6b6b", "#7df6ff", "#ff85c8", "#8bff7a", "#ffffff"];
    const baseDuration = Math.max(duration * 2.15, 5200);

    for (let i = 0; i < count; i++) {
        const piece = document.createElement("div");
        const pieceDuration = random(baseDuration * 0.72, baseDuration * 1.18);

        piece.className = "single-fx-confetti";
        piece.style.setProperty("--x", `${random(10, 90)}vw`);
        piece.style.setProperty("--y", `${random(4, 18)}vh`);
        piece.style.setProperty("--w", `${random(6, 12)}px`);
        piece.style.setProperty("--h", `${random(10, 18)}px`);
        piece.style.setProperty("--dx", `${random(-130, 130)}px`);
        piece.style.setProperty("--dy", `${random(520, 980)}px`);
        piece.style.setProperty("--rot", `${random(360, 1380)}deg`);
        piece.style.setProperty("--duration", `${pieceDuration}ms`);
        piece.style.setProperty("--color", colors[Math.floor(random(0, colors.length))]);

        fxLayer.appendChild(piece);
        removeAfter(piece, pieceDuration + 180);
    }
}

function spawnRays(gameY, duration) {
    const rays = document.createElement("div");
    const point = getScreenPointFromGamePoint(gameConfig.scene.baseWidth / 2, gameY);

    rays.className = "single-fx-rays";
    rays.style.setProperty("--y", `${point.y}px`);
    rays.style.setProperty("--duration", `${duration}ms`);

    fxLayer.appendChild(rays);
    removeAfter(rays, duration + 100);
}

function spawnFlash(duration) {
    const flash = document.createElement("div");

    flash.className = "single-fx-flash";
    flash.style.setProperty("--duration", `${duration}ms`);

    fxLayer.appendChild(flash);
    removeAfter(flash, duration + 100);
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
