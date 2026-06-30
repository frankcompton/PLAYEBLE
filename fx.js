import { gameConfig } from "./config.js";

let fxApp = null;
let fxLayer = null;

let idleSparks = [];
let burstParticles = [];
let activeParticles = [];
let shockwaveRings = [];
let confettiPieces = [];
let twinkleStars = [];

let flashOverlay = null;
let flashLife = 0;
let flashMaxLife = 1;

let raysContainer = null;
let raysLife = 0;
let raysMaxLife = 1;

let ambientGlow = null;
let slotShine = null;
let slotShineLife = 0;
let slotShineMaxLife = 0;

let anticipationState = null;
let coinRainActive = false;
let coinRainTimer = 0;

let softGlowContainer = null;
let softGlowLife = 0;
let softGlowMaxLife = 1;

let fxViewportWidth = window.innerWidth;
let fxViewportHeight = window.innerHeight;
let fxWarmupArtifacts = [];
const reelElements = Array.from(document.querySelectorAll("#reels > div"));
const gameScalerElement = document.getElementById("gameScaler");

function addClasses(element, ...classNames) {
    element.classList.add(...classNames);
}

function removeClasses(element, ...classNames) {
    element.classList.remove(...classNames);
}

function applyPerformanceProfile() {
    return;
}

function updateFxViewportSize() {
    fxViewportWidth = window.innerWidth;
    fxViewportHeight = window.innerHeight;
}

async function initFx() {
    fxLayer = document.getElementById("fxLayer");

    if (!fxLayer) {
        return;
    }

    const sceneWidth = gameConfig.scene.baseWidth;
    const sceneHeight = gameConfig.scene.baseHeight;

    applyPerformanceProfile();
    updateFxViewportSize();

    fxApp = new PIXI.Application();

    const pixelRatio = window.devicePixelRatio || 1;
    const resolution = Math.min(pixelRatio, 1.5);

    await fxApp.init({
        width: fxViewportWidth,
        height: fxViewportHeight,
        backgroundAlpha: 0,
        antialias: false,
        resolution,
        autoDensity: true,
        powerPreference: "high-performance"
    });

    fxApp.canvas.style.width = "100%";
    fxApp.canvas.style.height = "100%";
    fxApp.canvas.style.display = "block";

    fxLayer.appendChild(fxApp.canvas);

    createAmbientGlow();
    createSoftGlow();
    createRaysContainer();
    createFlashOverlay();
    createSlotShine();

    if (gameConfig.fx.idleSparksEnabled) {
        createIdleSparks();
    }

    if (gameConfig.fx.twinkleStarsEnabled) {
        createTwinkleStars();
    }

    fxApp.ticker.add(updateFx);
}

async function preloadFx() {
    if (!fxApp || !fxApp.canvas) {
        return;
    }

    const canvas = fxApp.canvas;
    const previousVisibility = canvas.style.visibility;
    const previousOpacity = canvas.style.opacity;

    canvas.style.visibility = "hidden";
    canvas.style.opacity = "0";

    try {
        warmupFx();
        await waitForNextFrame();
        await waitForNextFrame();
    } finally {
        clearFxWarmupArtifacts();
        resetWarmupFxState();

        canvas.style.visibility = previousVisibility;
        canvas.style.opacity = previousOpacity;
    }
}

function warmupFx() {
    if (!fxApp) {
        return;
    }

    const centerPoint = getScreenPointFromGamePoint(
        gameConfig.scene.baseWidth / 2,
        gameConfig.scene.baseHeight / 2
    );

    const warmupCoin = createPixiCoin(18);
    warmupCoin.x = centerPoint.x;
    warmupCoin.y = centerPoint.y;
    fxApp.stage.addChild(warmupCoin);
    fxWarmupArtifacts.push(warmupCoin);

    spawnSparkBurst(centerPoint.x, centerPoint.y, {
        count: 1,
        spreadX: 24,
        launchUpMin: 12,
        launchUpMax: 24,
        duration: 240,
        minSize: 2,
        maxSize: 3,
        gravity: 0.04,
        colors: [0xffe27a, 0x7df6ff]
    });

    spawnShockwaveRing(centerPoint.x, centerPoint.y, {
        color: 0xffd45a,
        duration: 240,
        radius: 18,
        width: 2,
        startScale: 0.5,
        expandScale: 2.2,
        peakAlpha: 0.4
    });

    if (gameConfig.fx.ctaConfettiEnabled) {
        const piece = new PIXI.Graphics();

        piece.rect(-4, -7, 8, 14);
        piece.fill({ color: 0xffd45a, alpha: 1 });
        piece.x = centerPoint.x;
        piece.y = centerPoint.y;
        piece.vx = 0;
        piece.vy = 0;
        piece.gravity = 0;
        piece.rotationSpeed = 0;
        piece.life = 0;
        piece.maxLife = 1;

        fxApp.stage.addChild(piece);
        confettiPieces.push(piece);
    }

    if (gameConfig.fx.coinRainEnabled) {
        const previousCoinRainActive = coinRainActive;

        coinRainActive = true;
        spawnCoinRainDrop();
        coinRainActive = previousCoinRainActive;
    }

    if (gameConfig.fx.softGlowEnabled) {
        playSoftGlow();
    }

    if (gameConfig.fx.slotShineEnabled) {
        playSlotShineFx();
    }

    if (gameConfig.fx.jackpotFlashEnabled) {
        playJackpotFlash();
    }

    if (gameConfig.fx.jackpotRaysEnabled) {
        playJackpotRays();
    }

    if (gameConfig.fx.jackpotBurstEnabled) {
        playJackpotBurst();
    }

    if (gameConfig.fx.jackpotShockwaveEnabled) {
        for (let i = 0; i < 3; i++) {
            spawnShockwaveRing(centerPoint.x, centerPoint.y, {
                color: i === 0 ? 0xffffff : 0xffd45a,
                duration: 240,
                radius: 24 + i * 8,
                width: 3 - i * 0.5,
                startScale: 0.3,
                expandScale: 4.5 + i * 0.8,
                peakAlpha: 0.7 - i * 0.15
            });
        }
    }
}

function waitForNextFrame() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => resolve());
    });
}

function clearFxWarmupArtifacts() {
    if (!fxApp) {
        fxWarmupArtifacts = [];
        return;
    }

    for (let i = 0; i < fxWarmupArtifacts.length; i++) {
        const artifact = fxWarmupArtifacts[i];
        fxApp.stage.removeChild(artifact);

        if (artifact.destroy) {
            artifact.destroy({ children: true });
        }
    }

    fxWarmupArtifacts = [];
}

function resetWarmupFxState() {
    for (let i = burstParticles.length - 1; i >= 0; i--) {
        fxApp.stage.removeChild(burstParticles[i]);
    }

    for (let i = activeParticles.length - 1; i >= 0; i--) {
        fxApp.stage.removeChild(activeParticles[i]);
    }

    for (let i = shockwaveRings.length - 1; i >= 0; i--) {
        fxApp.stage.removeChild(shockwaveRings[i]);
    }

    for (let i = confettiPieces.length - 1; i >= 0; i--) {
        fxApp.stage.removeChild(confettiPieces[i]);
    }

    burstParticles = [];
    activeParticles = [];
    shockwaveRings = [];
    confettiPieces = [];

    flashLife = 0;
    flashMaxLife = 1;
    raysLife = 0;
    raysMaxLife = 1;
    slotShineLife = 0;
    slotShineMaxLife = 0;
    softGlowLife = 0;
    softGlowMaxLife = 1;
    coinRainActive = false;
    coinRainTimer = 0;

    if (flashOverlay) {
        flashOverlay.alpha = 0;
    }

    if (raysContainer) {
        raysContainer.alpha = 0;
        raysContainer.visible = false;
        raysContainer.rotation = 0;
    }

    if (slotShine) {
        slotShine.alpha = 0;
        slotShine.visible = false;
    }

    if (softGlowContainer) {
        softGlowContainer.alpha = 0;
        softGlowContainer.visible = false;
    }
}

function createAmbientGlow() {
    if (!gameConfig.fx.ambientGlowEnabled) {
        return;
    }

    const fx = gameConfig.fx;
    const glowPoint = getScreenPointFromGamePoint(
        gameConfig.scene.baseWidth / 2,
        fx.ambientGlowY
    );

    ambientGlow = new PIXI.Graphics();
    ambientGlow.x = glowPoint.x;
    ambientGlow.y = glowPoint.y;

    ambientGlow.circle(0, 0, fx.ambientGlowRadius);
    ambientGlow.fill({ color: fx.ambientGlowColor, alpha: fx.ambientGlowAlpha });

    ambientGlow.alpha = 0.55;
    ambientGlow.blendMode = "add";

    fxApp.stage.addChildAt(ambientGlow, 0);
}

function createSoftGlow() {
    if (!gameConfig.fx.softGlowEnabled) {
        return;
    }

    const fx = gameConfig.fx;

    softGlowContainer = new PIXI.Container();
    softGlowContainer.visible = false;
    softGlowContainer.alpha = 0;
    softGlowContainer.blendMode = "add";

    const layers = [
        { scale: 1.0, alpha: 0.14 },
        { scale: 1.35, alpha: 0.09 },
        { scale: 1.75, alpha: 0.05 }
    ];

    for (let i = 0; i < layers.length; i++) {
        const glow = new PIXI.Graphics();
        const layer = layers[i];

        glow.circle(0, 0, 1);
        glow.fill({ color: fx.softGlowColor, alpha: layer.alpha });
        glow.scale.set(fx.softGlowRadiusX * layer.scale, fx.softGlowRadiusY * layer.scale);

        softGlowContainer.addChild(glow);
    }

    fxApp.stage.addChildAt(softGlowContainer, 1);
}

function createFlashOverlay() {
    flashOverlay = new PIXI.Graphics();

    flashOverlay.rect(0, 0, fxViewportWidth, fxViewportHeight);
    flashOverlay.fill({ color: 0xfff4b0, alpha: 1 });

    flashOverlay.alpha = 0;

    fxApp.stage.addChild(flashOverlay);
}

function createSlotShine() {
    slotShine = new PIXI.Graphics();
    slotShine.visible = false;
    slotShine.alpha = 0;

    fxApp.stage.addChild(slotShine);
}

function createRaysContainer() {
    const fx = gameConfig.fx;

    raysContainer = new PIXI.Container();

    raysContainer.x = 0;
    raysContainer.y = 0;

    raysContainer.alpha = 0;
    raysContainer.visible = false;

    for (let i = 0; i < fx.jackpotRayCount; i++) {
        const ray = new PIXI.Graphics();

        const angle = (Math.PI * 2 / fx.jackpotRayCount) * i;

        ray.moveTo(0, 0);
        ray.lineTo(-fx.jackpotRayWidth / 2, -fx.jackpotRayLength);
        ray.lineTo(fx.jackpotRayWidth / 2, -fx.jackpotRayLength);
        ray.closePath();

        ray.fill({
            color: 0xffd45a,
            alpha: 0.24
        });

        ray.rotation = angle;

        raysContainer.addChild(ray);
    }

    fxApp.stage.addChild(raysContainer);
}

function createIdleSparks() {
    const fx = gameConfig.fx;
    const sceneWidth = fxViewportWidth;
    const sceneHeight = fxViewportHeight;
    const colors = [0xffd45a, 0x7df6ff, 0xfff2b0, 0xffb400];

    for (let i = 0; i < fx.idleSparkCount; i++) {
        const spark = new PIXI.Graphics();

        const radius = getRandomNumber(fx.idleSparkMinSize, fx.idleSparkMaxSize);
        const color = colors[Math.floor(Math.random() * colors.length)];

        spark.circle(0, 0, radius);
        spark.fill({
            color,
            alpha: getRandomNumber(0.2, 0.75)
        });

        spark.x = Math.random() * sceneWidth;
        spark.y = Math.random() * sceneHeight;

        spark.speedY = getRandomNumber(fx.idleSparkMinSpeedY, fx.idleSparkMaxSpeedY);
        spark.speedX = getRandomNumber(-fx.idleSparkMaxSpeedX, fx.idleSparkMaxSpeedX);

        spark.life = Math.random() * Math.PI * 2;
        spark.pulseSpeed = getRandomNumber(0.02, 0.05);
        spark.baseAlpha = getRandomNumber(0.2, 0.55);

        fxApp.stage.addChild(spark);
        idleSparks.push(spark);
    }
}

function createTwinkleStars() {
    const fx = gameConfig.fx;
    const sceneWidth = fxViewportWidth;
    const sceneHeight = fxViewportHeight;

    for (let i = 0; i < fx.twinkleStarCount; i++) {
        const star = new PIXI.Graphics();

        const size = getRandomNumber(fx.twinkleStarMinSize, fx.twinkleStarMaxSize);

        drawStarShape(star, size, 0xffe88a);

        star.x = Math.random() * sceneWidth;
        star.y = Math.random() * sceneHeight * 0.72;

        star.life = Math.random() * Math.PI * 2;
        star.pulseSpeed = getRandomNumber(0.015, 0.035);
        star.baseScale = getRandomNumber(0.6, 1.2);

        star.scale.set(star.baseScale);
        star.alpha = 0;
        star.blendMode = "add";

        fxApp.stage.addChild(star);
        twinkleStars.push(star);
    }
}

function drawStarShape(graphics, size, color) {
    const spikes = 4;
    const outerRadius = size;
    const innerRadius = size * 0.38;

    graphics.clear();

    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / spikes) * i - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
            graphics.moveTo(x, y);
        } else {
            graphics.lineTo(x, y);
        }
    }

    graphics.closePath();
    graphics.fill({ color, alpha: 0.85 });
}

function updateFx() {
    updateAmbientGlow();
    updateSoftGlow();
    updateIdleSparks();
    updateTwinkleStars();
    updateRays();
    updateBurstParticles();
    updateActiveParticles();
    updateShockwaveRings();
    updateConfetti();
    updateFlashOverlay();
    updateSlotShine();
    updateAnticipationFx();
    updateCoinRain();
}

function updateAmbientGlow() {
    if (!ambientGlow) {
        return;
    }

    const fx = gameConfig.fx;
    const pulse = (Math.sin(Date.now() * 0.0018) + 1) * 0.5;

    ambientGlow.alpha = fx.ambientGlowAlpha + pulse * fx.ambientGlowPulse;
    ambientGlow.scale.set(0.92 + pulse * 0.12);
}

function updateSoftGlow() {
    if (!softGlowContainer || softGlowLife <= 0) {
        return;
    }

    softGlowLife -= 1;

    const progress = 1 - softGlowLife / softGlowMaxLife;
    const fx = gameConfig.fx;

    let alphaCurve = 1 - Math.abs(progress * 2 - 1);
    alphaCurve = Math.max(0, Math.min(1, alphaCurve));

    softGlowContainer.alpha = alphaCurve * fx.softGlowPeakAlpha;
    softGlowContainer.scale.set(0.92 + progress * 0.16);

    if (softGlowLife <= 0) {
        softGlowContainer.alpha = 0;
        softGlowContainer.visible = false;
    }
}

function updateIdleSparks() {
    const sceneWidth = fxViewportWidth;
    const sceneHeight = fxViewportHeight;

    for (let i = 0; i < idleSparks.length; i++) {
        const spark = idleSparks[i];

        spark.y -= spark.speedY;
        spark.x += spark.speedX;

        spark.life += spark.pulseSpeed;

        spark.alpha = spark.baseAlpha + (Math.sin(spark.life) + 1) * 0.22;

        if (spark.y < -10) {
            spark.y = sceneHeight + 10;
            spark.x = Math.random() * sceneWidth;
        }

        if (spark.x < -10) {
            spark.x = sceneWidth + 10;
        }

        if (spark.x > sceneWidth + 10) {
            spark.x = -10;
        }
    }
}

function updateTwinkleStars() {
    for (let i = 0; i < twinkleStars.length; i++) {
        const star = twinkleStars[i];

        star.life += star.pulseSpeed;

        const wave = (Math.sin(star.life) + 1) * 0.5;

        star.alpha = wave * 0.75;
        star.rotation = star.life * 0.08;
        star.scale.set(star.baseScale * (0.75 + wave * 0.35));
    }
}

function updateFlashOverlay() {
    if (!flashOverlay || flashLife <= 0) {
        return;
    }

    flashLife -= 1;

    const progress = flashLife / flashMaxLife;

    flashOverlay.alpha = progress * 0.5;

    if (flashLife <= 0) {
        flashOverlay.alpha = 0;
    }
}

function updateBurstParticles() {
    for (let i = burstParticles.length - 1; i >= 0; i--) {
        const particle = burstParticles[i];

        particle.life += 1;

        particle.vy += particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.rotation += particle.rotationSpeed;

        const progress = particle.life / particle.maxLife;

        if (progress < 0.35) {
            particle.alpha = 1;
        } else {
            particle.alpha = 1 - progress;
        }

        particle.scale.x += 0.01;
        particle.scale.y += 0.01;

        if (particle.life >= particle.maxLife) {
            fxApp.stage.removeChild(particle);
            burstParticles.splice(i, 1);
        }
    }
}

function updateActiveParticles() {
    for (let i = activeParticles.length - 1; i >= 0; i--) {
        const particle = activeParticles[i];

        particle.life += 1;

        particle.vy += particle.gravity || 0;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed || 0;

        const progress = particle.life / particle.maxLife;

        if (particle.fadeStart !== undefined) {
            if (progress < particle.fadeStart) {
                particle.alpha = particle.peakAlpha || 1;
            } else {
                particle.alpha = (particle.peakAlpha || 1) * (1 - (progress - particle.fadeStart) / (1 - particle.fadeStart));
            }
        } else if (progress < 0.3) {
            particle.alpha = 1;
        } else {
            particle.alpha = 1 - progress;
        }

        if (particle.scaleSpeed) {
            particle.scale.x += particle.scaleSpeed;
            particle.scale.y += particle.scaleSpeed;
        }

        if (particle.life >= particle.maxLife) {
            fxApp.stage.removeChild(particle);

            if (particle.isCoinRain) {
                coinRainDropsAlive = Math.max(0, coinRainDropsAlive - 1);
            }

            activeParticles.splice(i, 1);
        }
    }
}

function updateShockwaveRings() {
    for (let i = shockwaveRings.length - 1; i >= 0; i--) {
        const ring = shockwaveRings[i];

        ring.life += 1;

        const progress = ring.life / ring.maxLife;

        ring.scale.set(ring.startScale + progress * ring.expandScale);
        ring.alpha = (1 - progress) * ring.peakAlpha;

        if (ring.life >= ring.maxLife) {
            fxApp.stage.removeChild(ring);
            shockwaveRings.splice(i, 1);
        }
    }
}

function updateConfetti() {
    const sceneHeight = fxViewportHeight;

    for (let i = confettiPieces.length - 1; i >= 0; i--) {
        const piece = confettiPieces[i];

        piece.life += 1;

        piece.vy += piece.gravity;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;

        const progress = piece.life / piece.maxLife;

        piece.alpha = progress < 0.85 ? 1 : 1 - (progress - 0.85) / 0.15;

        if (piece.y > sceneHeight + 40 || piece.life >= piece.maxLife) {
            fxApp.stage.removeChild(piece);
            confettiPieces.splice(i, 1);
        }
    }
}

function updateSlotShine() {
    if (!slotShine || slotShineLife <= 0) {
        return;
    }

    slotShineLife -= 1;

    const progress = 1 - slotShineLife / slotShineMaxLife;
    const fx = gameConfig.fx;

    slotShine.clear();
    slotShine.visible = true;

    const shineWidth = fx.slotShineWidth;
    const shineHeight = fx.slotShineHeight;
    const sweepX = -shineWidth + progress * (gameConfig.scene.baseWidth + shineWidth * 2);

    slotShine.rect(sweepX, fx.slotShineY, shineWidth, shineHeight);
    slotShine.fill({ color: 0xffffff, alpha: 0.18 });

    slotShine.alpha = progress < 0.15
        ? progress / 0.15
        : progress > 0.85
            ? (1 - progress) / 0.15
            : 1;

    if (slotShineLife <= 0) {
        slotShine.visible = false;
        slotShine.alpha = 0;
    }
}

function updateAnticipationFx() {
    if (!anticipationState) {
        return;
    }

    anticipationState.life += 1;

    const particles = anticipationState.particles;

    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        particle.orbitAngle += particle.orbitSpeed;
        particle.x = anticipationState.centerX + Math.cos(particle.orbitAngle) * particle.orbitRadius;
        particle.y = anticipationState.centerY + Math.sin(particle.orbitAngle) * particle.orbitRadius * 0.55;

        particle.alpha = 0.45 + (Math.sin(particle.orbitAngle * 3) + 1) * 0.25;
        particle.scale.set(particle.baseScale + Math.sin(particle.orbitAngle * 2) * 0.15);
    }
}

function updateCoinRain() {
    if (!coinRainActive) {
        return;
    }

    coinRainTimer += 1;

    const fx = gameConfig.fx;

    if (coinRainTimer % fx.coinRainInterval === 0) {
        spawnCoinRainDrop();
    }
}

function createPixiCoin(radius) {
    const coin = new PIXI.Container();

    const body = new PIXI.Graphics();

    body.circle(0, 0, radius);
    body.fill({
        color: 0xffd84a,
        alpha: 1
    });

    body.circle(-radius * 0.28, -radius * 0.28, radius * 0.45);
    body.fill({
        color: 0xfff8b8,
        alpha: 0.55
    });

    const ring = new PIXI.Graphics();

    ring.circle(0, 0, radius * 0.65);
    ring.stroke({
        width: Math.max(1, radius * 0.08),
        color: 0x8a4a00,
        alpha: 0.38
    });

    const label = new PIXI.Text({
        text: gameConfig.currency.effectCoinText || "$",
        style: {
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: Math.round(radius * getCoinTextScale()),
            fontWeight: "900",
            fill: 0x7b2500,
            stroke: {
                color: 0xffef8a,
                width: Math.max(1, radius * 0.08)
            }
        }
    });

    label.anchor.set(0.5);
    label.y = -radius * 0.04;

    coin.addChild(body);
    coin.addChild(ring);
    coin.addChild(label);

    return coin;
}

function getCoinTextScale() {
    const text = gameConfig.currency.effectCoinText || "$";

    if (text.length >= 2) {
        return 0.62;
    }

    return 0.95;
}

function spawnCoinRainDrop() {
    const fx = gameConfig.fx;
    const sceneWidth = fxViewportWidth;

    const size = getRandomNumber(fx.coinRainMinSize, fx.coinRainMaxSize);
    const particle = createPixiCoin(size);

    particle.x = getRandomNumber(40, sceneWidth - 40);
    particle.y = -10;

    particle.vx = getRandomNumber(-0.4, 0.4);
    particle.vy = getRandomNumber(fx.coinRainMinSpeed, fx.coinRainMaxSpeed);
    particle.gravity = 0.04;
    particle.rotationSpeed = getRandomNumber(-0.08, 0.08);

    particle.life = 0;
    particle.maxLife = Math.max(1, Math.round(fx.coinRainDropDuration / 16));
    particle.fadeStart = 0.7;
    particle.peakAlpha = 0.9;

    particle.scale.set(getRandomNumber(0.85, 1.15));

    fxApp.stage.addChild(particle);
    activeParticles.push(particle);
}

function getReelCenterPoint(reelIndex) {
    if (!reelElements[reelIndex]) {
        return getScreenPointFromGamePoint(
            gameConfig.scene.baseWidth / 2,
            gameConfig.fx.reelLandY
        );
    }

    const rect = reelElements[reelIndex].getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.bottom - rect.height * 0.12
    };
}

function getBalancePanelPoint() {
    const panel = document.getElementById("topWinPanel");

    if (!panel) {
        return getScreenPointFromGamePoint(
            gameConfig.scene.baseWidth / 2,
            40
        );
    }

    const rect = panel.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.5
    };
}

function spawnSparkBurst(x, y, options) {
    if (!fxApp) {
        return;
    }

    const count = options.count || 12;
    const colors = options.colors || [0xffe27a, 0xffc83d, 0x7df6ff, 0xfff2b0];
    const spreadX = options.spreadX || 90;
    const launchUpMin = options.launchUpMin || 20;
    const launchUpMax = options.launchUpMax || 70;
    const duration = options.duration || 700;
    const minSize = options.minSize || 2;
    const maxSize = options.maxSize || 5;
    const gravity = options.gravity !== undefined ? options.gravity : 0.08;

    for (let i = 0; i < count; i++) {
        const particle = new PIXI.Graphics();
        const size = getRandomNumber(minSize, maxSize);
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.circle(0, 0, size);
        particle.fill({ color, alpha: 1 });

        particle.x = x + getRandomNumber(-8, 8);
        particle.y = y + getRandomNumber(-4, 4);

        particle.vx = getRandomNumber(-spreadX, spreadX) / 40;
        particle.vy = -getRandomNumber(launchUpMin, launchUpMax) / 28;

        particle.gravity = gravity;
        particle.rotationSpeed = getRandomNumber(-0.12, 0.12);
        particle.life = 0;
        particle.maxLife = Math.max(1, Math.round(duration / 16));
        particle.scale.set(getRandomNumber(0.7, 1.1));
        particle.fadeStart = 0.35;

        fxApp.stage.addChild(particle);
        activeParticles.push(particle);
    }
}

function spawnShockwaveRing(x, y, options) {
    if (!fxApp) {
        return;
    }

    const ring = new PIXI.Graphics();
    const radius = options.radius || 18;

    ring.circle(0, 0, radius);
    ring.stroke({
        color: options.color || 0xffd45a,
        width: options.width || 3,
        alpha: 0.85
    });

    ring.x = x;
    ring.y = y;
    ring.blendMode = "add";

    ring.life = 0;
    ring.maxLife = Math.max(1, Math.round((options.duration || 500) / 16));
    ring.startScale = options.startScale || 0.4;
    ring.expandScale = options.expandScale || 2.4;
    ring.peakAlpha = options.peakAlpha || 0.75;

    fxApp.stage.addChild(ring);
    shockwaveRings.push(ring);
}

function playSpinStartFx() {
    if (!fxApp || !gameConfig.fx.spinStartFxEnabled) {
        return;
    }

    const fx = gameConfig.fx;
    const centerPoint = getScreenPointFromGamePoint(
        gameConfig.scene.baseWidth / 2,
        fx.spinStartY
    );

    const centerX = centerPoint.x;
    const centerY = centerPoint.y;

    spawnSparkBurst(centerX, centerY, {
        count: fx.spinStartBurstCount,
        spreadX: fx.spinStartSpreadX,
        launchUpMin: 10,
        launchUpMax: 45,
        duration: fx.spinStartDuration,
        minSize: 2,
        maxSize: 4,
        gravity: 0.05,
        colors: [0x7df6ff, 0x4cc8ff, 0xffffff, 0xffe27a]
    });

    spawnShockwaveRing(centerX, centerY, {
        color: 0x4cc8ff,
        duration: fx.spinStartDuration,
        radius: 22,
        width: 2,
        startScale: 0.5,
        expandScale: 3.2,
        peakAlpha: 0.45
    });
}

function playReelStopFx(reelIndex) {
    if (!fxApp || !gameConfig.fx.reelLandFxEnabled) {
        return;
    }

    const fx = gameConfig.fx;
    const point = getReelCenterPoint(reelIndex);

    spawnSparkBurst(point.x, point.y, {
        count: fx.reelLandBurstCount,
        spreadX: fx.reelLandSpreadX,
        launchUpMin: 8,
        launchUpMax: 35,
        duration: fx.reelLandDuration,
        minSize: 2,
        maxSize: 5,
        gravity: 0.1,
        colors: [0xffe27a, 0x7df6ff, 0xffffff]
    });

    if (reelIndex === 2) {
        spawnShockwaveRing(point.x, point.y, {
            color: 0xffd45a,
            duration: 420,
            radius: 16,
            width: 2,
            startScale: 0.35,
            expandScale: 2,
            peakAlpha: 0.55
        });
    }
}

function playAnticipationFx(reelIndex) {
    if (!fxApp || !gameConfig.fx.anticipationParticlesEnabled) {
        return;
    }

    stopAnticipationFx();

    const point = getReelCenterPoint(reelIndex);
    const fx = gameConfig.fx;
    const particles = [];

    for (let i = 0; i < fx.anticipationParticleCount; i++) {
        const particle = new PIXI.Graphics();
        const size = getRandomNumber(2.5, 4.5);

        particle.circle(0, 0, size);
        particle.fill({ color: 0xffd84a, alpha: 0.9 });
        particle.blendMode = "add";

        particle.orbitAngle = (Math.PI * 2 / fx.anticipationParticleCount) * i;
        particle.orbitSpeed = getRandomNumber(0.04, 0.07);
        particle.orbitRadius = getRandomNumber(28, 52);
        particle.baseScale = getRandomNumber(0.8, 1.2);

        fxApp.stage.addChild(particle);
        particles.push(particle);
    }

    anticipationState = {
        centerX: point.x,
        centerY: point.y - 40,
        particles,
        life: 0
    };
}

function stopAnticipationFx() {
    if (!anticipationState) {
        return;
    }

    for (let i = 0; i < anticipationState.particles.length; i++) {
        fxApp.stage.removeChild(anticipationState.particles[i]);
    }

    anticipationState = null;
}

function playSmallWinFx(winReels) {
    if (!fxApp || !gameConfig.fx.smallWinBurstEnabled) {
        return;
    }

    const fx = gameConfig.fx;
    const reels = winReels || [0];

    for (let i = 0; i < reels.length; i++) {
        const point = getReelCenterPoint(reels[i]);

        spawnSparkBurst(point.x, point.y - 50, {
            count: fx.smallWinBurstCount,
            spreadX: fx.smallWinSpreadX,
            launchUpMin: 25,
            launchUpMax: 80,
            duration: fx.smallWinBurstDuration,
            minSize: 3,
            maxSize: 7,
            gravity: 0.07,
            colors: [0xffe27a, 0xffc83d, 0xffb400, 0xfff2b0]
        });

        spawnShockwaveRing(point.x, point.y - 30, {
            color: 0xffd45a,
            duration: 600,
            radius: 20,
            width: 2.5,
            startScale: 0.4,
            expandScale: 2.6,
            peakAlpha: 0.6
        });
    }
}

function playSlotShineFx() {
    if (!fxApp || !gameConfig.fx.slotShineEnabled) {
        return;
    }

    slotShineMaxLife = Math.max(1, Math.round(gameConfig.fx.slotShineDuration / 16));
    slotShineLife = slotShineMaxLife;
}

function playBalanceSparkFx() {
    if (!fxApp || !gameConfig.fx.balanceSparksEnabled) {
        return;
    }

    const fx = gameConfig.fx;
    const point = getBalancePanelPoint();

    spawnSparkBurst(point.x, point.y, {
        count: fx.balanceSparkCount,
        spreadX: fx.balanceSparkSpreadX,
        launchUpMin: 12,
        launchUpMax: 40,
        duration: fx.balanceSparkDuration,
        minSize: 2,
        maxSize: 4,
        gravity: 0.06,
        colors: [0xffd92f, 0xffe978, 0xffffff, 0xffb400]
    });
}

function playCtaFx() {
    if (!fxApp || !gameConfig.fx.ctaConfettiEnabled) {
        return;
    }

    const fx = gameConfig.fx;
    const sceneWidth = fxViewportWidth;
    const colors = [0xffd45a, 0xff6b6b, 0x7df6ff, 0xff85c8, 0x8bff7a, 0xffffff];

    for (let i = 0; i < fx.ctaConfettiCount; i++) {
        const piece = new PIXI.Graphics();
        const width = getRandomNumber(5, 9);
        const height = getRandomNumber(8, 14);
        const color = colors[Math.floor(Math.random() * colors.length)];

        piece.rect(-width / 2, -height / 2, width, height);
        piece.fill({ color, alpha: 1 });

        piece.x = getRandomNumber(sceneWidth * 0.15, sceneWidth * 0.85);
        piece.y = -getRandomNumber(10, 120);

        piece.vx = getRandomNumber(-1.8, 1.8);
        piece.vy = getRandomNumber(1.2, 3.4);
        piece.gravity = 0.05;
        piece.rotationSpeed = getRandomNumber(-0.14, 0.14);
        piece.life = 0;
        piece.maxLife = Math.max(1, Math.round(fx.ctaConfettiDuration / 16));

        fxApp.stage.addChild(piece);
        confettiPieces.push(piece);
    }

    spawnSparkBurst(sceneWidth / 2, 120, {
        count: 24,
        spreadX: 180,
        launchUpMin: 30,
        launchUpMax: 90,
        duration: 900,
        minSize: 3,
        maxSize: 6,
        gravity: 0.06,
        colors: [0xffe27a, 0xffc83d, 0xffffff]
    });
}

function startCoinRain() {
    if (!gameConfig.fx.coinRainEnabled) {
        return;
    }

    coinRainActive = true;
    coinRainTimer = 0;
}

function playSoftGlow() {
    if (!softGlowContainer || !gameConfig.fx.softGlowEnabled) {
        return;
    }

    const fx = gameConfig.fx;
    const point = getScreenPointFromGamePoint(
        gameConfig.scene.baseWidth / 2,
        fx.softGlowY || 350
    );

    softGlowContainer.x = point.x;
    softGlowContainer.y = point.y;
    softGlowContainer.scale.set(0.92);
    softGlowContainer.visible = true;
    softGlowContainer.alpha = 0;

    softGlowMaxLife = Math.max(1, Math.round((fx.softGlowDuration || 2200) / 16));
    softGlowLife = softGlowMaxLife;
}

function stopCoinRain() {
    coinRainActive = false;
}

function playJackpotFx() {
    if (!fxApp) {
        return;
    }

    if (gameConfig.fx.jackpotFlashEnabled) {
        playJackpotFlash();
    }

    if (gameConfig.fx.jackpotRaysEnabled) {
        playJackpotRays();
    }

    if (gameConfig.fx.jackpotBurstEnabled) {
        playJackpotBurst();
    }

    if (gameConfig.fx.jackpotShockwaveEnabled) {
        playJackpotShockwave();
    }

    playSoftGlow();
    startCoinRain();
}

function playJackpotFlash() {
    flashMaxLife = Math.max(1, Math.round(gameConfig.fx.jackpotFlashDuration / 16));
    flashLife = flashMaxLife;
    flashOverlay.alpha = 0.5;
}

function playJackpotRays() {
    if (!raysContainer) {
        return;
    }

    const raysPoint = getScreenPointFromGamePoint(
        gameConfig.scene.baseWidth / 2,
        370
    );

    raysContainer.x = raysPoint.x;
    raysContainer.y = raysPoint.y;

    raysContainer.baseScale = getGameScreenScale();

    raysMaxLife = Math.max(1, Math.round(gameConfig.fx.jackpotRaysDuration / 16));
    raysLife = raysMaxLife;

    raysContainer.visible = true;
    raysContainer.alpha = 0;
    raysContainer.rotation = Math.random() * Math.PI * 2;
    raysContainer.scale.set(0.85 * raysContainer.baseScale);
}

function playJackpotBurst() {
    const fx = gameConfig.fx;

    const startPoint = getScreenPointFromGamePoint(
        gameConfig.scene.baseWidth / 2,
        380
    );

    const startX = startPoint.x;
    const startY = startPoint.y;

    for (let i = 0; i < fx.jackpotBurstCount; i++) {
        createBurstParticle(startX, startY);
    }

    for (let i = 0; i < fx.jackpotStarBurstCount; i++) {
        createStarBurstParticle(startX, startY);
    }
}

function playJackpotShockwave() {
    const fx = gameConfig.fx;
    const centerPoint = getScreenPointFromGamePoint(
        gameConfig.scene.baseWidth / 2,
        fx.jackpotBurstY
    );

    const centerX = centerPoint.x;
    const centerY = centerPoint.y;

    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            spawnShockwaveRing(centerX, centerY, {
                color: i === 0 ? 0xffffff : 0xffd45a,
                duration: fx.jackpotShockwaveDuration,
                radius: 24 + i * 8,
                width: 3 - i * 0.5,
                startScale: 0.3,
                expandScale: 4.5 + i * 0.8,
                peakAlpha: 0.7 - i * 0.15
            });
        }, i * 120);
    }
}

function createBurstParticle(startX, startY) {
    const fx = gameConfig.fx;

    const particle = new PIXI.Graphics();

    const size = getRandomNumber(fx.jackpotBurstMinSize, fx.jackpotBurstMaxSize);

    const colors = [0xffe27a, 0xffc83d, 0xfff2b0, 0xffb400];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.circle(0, 0, size);
    particle.fill({
        color,
        alpha: 1
    });

    particle.x = startX + getRandomNumber(-14, 14);
    particle.y = startY + getRandomNumber(-8, 8);

    particle.vx = getRandomNumber(-fx.jackpotBurstSpreadX, fx.jackpotBurstSpreadX) / 35;
    particle.vy = -getRandomNumber(fx.jackpotBurstLaunchUpMin, fx.jackpotBurstLaunchUpMax) / 22;

    particle.gravity = fx.jackpotBurstGravity;

    particle.rotationSpeed = getRandomNumber(
        fx.jackpotBurstRotationMin,
        fx.jackpotBurstRotationMax
    ) * (Math.random() > 0.5 ? 1 : -1);

    particle.life = 0;
    particle.maxLife = Math.max(1, Math.round(fx.jackpotBurstDuration / 16));

    particle.scale.set(getRandomNumber(0.65, 1));

    fxApp.stage.addChild(particle);
    burstParticles.push(particle);
}

function createStarBurstParticle(startX, startY) {
    const fx = gameConfig.fx;
    const particle = new PIXI.Graphics();
    const size = getRandomNumber(4, 7);

    drawStarShape(particle, size, 0xffffff);

    particle.x = startX + getRandomNumber(-10, 10);
    particle.y = startY + getRandomNumber(-6, 6);

    particle.vx = getRandomNumber(-fx.jackpotBurstSpreadX * 0.6, fx.jackpotBurstSpreadX * 0.6) / 30;
    particle.vy = -getRandomNumber(fx.jackpotBurstLaunchUpMin, fx.jackpotBurstLaunchUpMax) / 18;

    particle.gravity = fx.jackpotBurstGravity * 0.8;
    particle.rotationSpeed = getRandomNumber(0.06, 0.14) * (Math.random() > 0.5 ? 1 : -1);
    particle.life = 0;
    particle.maxLife = Math.max(1, Math.round(fx.jackpotBurstDuration * 0.85 / 16));
    particle.fadeStart = 0.25;
    particle.peakAlpha = 1;
    particle.scale.set(getRandomNumber(0.7, 1.2));
    particle.blendMode = "add";

    fxApp.stage.addChild(particle);
    activeParticles.push(particle);
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function lerp(start, end, progress) {
    return start + (end - start) * progress;
}

function updateRays() {
    if (!raysContainer || raysLife <= 0) {
        return;
    }

    const fx = gameConfig.fx;

    raysLife -= 1;

    const progress = 1 - raysLife / raysMaxLife;

    raysContainer.rotation += fx.jackpotRaysRotationSpeed;

    if (progress < 0.18) {
        raysContainer.alpha = progress / 0.18;
    } else {
        raysContainer.alpha = 1 - progress;
    }

    const baseScale = raysContainer.baseScale || 1;

    raysContainer.scale.set(baseScale * (0.85 + progress * 0.25));

    if (raysLife <= 0) {
        raysContainer.alpha = 0;
        raysContainer.visible = false;
    }
}

function getScreenPointFromGamePoint(gameX, gameY) {
    if (!gameScalerElement) {
        return {
            x: gameX,
            y: gameY
        };
    }

    const rect = gameScalerElement.getBoundingClientRect();

    const scaleX = rect.width / gameConfig.scene.baseWidth;
    const scaleY = rect.height / gameConfig.scene.baseHeight;

    return {
        x: rect.left + gameX * scaleX,
        y: rect.top + gameY * scaleY
    };
}

function getGameScreenScale() {
    if (!gameScalerElement) {
        return 1;
    }

    const rect = gameScalerElement.getBoundingClientRect();

    return rect.width / gameConfig.scene.baseWidth;
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

window.addEventListener("resize", () => {
    if (!fxApp) {
        return;
    }

    updateFxViewportSize();

    fxApp.renderer.resize(fxViewportWidth, fxViewportHeight);

    if (flashOverlay) {
        flashOverlay.clear();
        flashOverlay.rect(0, 0, fxViewportWidth, fxViewportHeight);
        flashOverlay.fill({ color: 0xfff4b0, alpha: 1 });
        flashOverlay.alpha = 0;
    }

    if (ambientGlow) {
        const glowPoint = getScreenPointFromGamePoint(
            gameConfig.scene.baseWidth / 2,
            gameConfig.fx.ambientGlowY
        );

        ambientGlow.x = glowPoint.x;
        ambientGlow.y = glowPoint.y;
    }
});
