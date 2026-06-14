let fxApp = null;
let fxLayer = null;

let idleSparks = [];
let burstParticles = [];

let flashOverlay = null;
let flashLife = 0;
let flashMaxLife = 1;

let raysContainer = null;
let raysLife = 0;
let raysMaxLife = 1;

async function initFx() {
    fxLayer = document.getElementById("fxLayer");

    if (!fxLayer) {
        console.log("FX layer not found");
        return;
    }

    const sceneWidth = gameConfig.scene.baseWidth;
    const sceneHeight = gameConfig.scene.baseHeight;

    fxApp = new PIXI.Application();

    await fxApp.init({
        width: sceneWidth,
        height: sceneHeight,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    fxApp.canvas.style.width = "100%";
    fxApp.canvas.style.height = "100%";
    fxApp.canvas.style.display = "block";

    fxLayer.appendChild(fxApp.canvas);

    createRaysContainer();
    createFlashOverlay();

    if (gameConfig.fx.idleSparksEnabled) {
        createIdleSparks();
    }

    fxApp.ticker.add(updateFx);
}

function createFlashOverlay() {
    const sceneWidth = gameConfig.scene.baseWidth;
    const sceneHeight = gameConfig.scene.baseHeight;

    flashOverlay = new PIXI.Graphics();
    flashOverlay.rect(0, 0, sceneWidth, sceneHeight);
    flashOverlay.fill({ color: 0xfff4b0, alpha: 1 });

    flashOverlay.alpha = 0;

    fxApp.stage.addChild(flashOverlay);
}

function createRaysContainer() {
    const fx = gameConfig.fx;

    raysContainer = new PIXI.Container();

    raysContainer.x = gameConfig.scene.baseWidth / 2;
    raysContainer.y = 370;

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
    const sceneWidth = gameConfig.scene.baseWidth;
    const sceneHeight = gameConfig.scene.baseHeight;

    for (let i = 0; i < fx.idleSparkCount; i++) {
        const spark = new PIXI.Graphics();

        const radius = getRandomNumber(fx.idleSparkMinSize, fx.idleSparkMaxSize);

        spark.circle(0, 0, radius);
        spark.fill({
            color: 0xffd45a,
            alpha: getRandomNumber(0.2, 0.75)
        });

        spark.x = Math.random() * sceneWidth;
        spark.y = Math.random() * sceneHeight;

        spark.speedY = getRandomNumber(fx.idleSparkMinSpeedY, fx.idleSparkMaxSpeedY);
        spark.speedX = getRandomNumber(-fx.idleSparkMaxSpeedX, fx.idleSparkMaxSpeedX);

        spark.life = Math.random() * Math.PI * 2;

        fxApp.stage.addChild(spark);
        idleSparks.push(spark);
    }
}

function updateFx() {
    updateIdleSparks();
    updateRays();
    updateBurstParticles();
    updateFlashOverlay();
}

function updateIdleSparks() {
    const sceneWidth = gameConfig.scene.baseWidth;
    const sceneHeight = gameConfig.scene.baseHeight;

    for (let i = 0; i < idleSparks.length; i++) {
        const spark = idleSparks[i];

        spark.y -= spark.speedY;
        spark.x += spark.speedX;

        spark.life += 0.03;

        spark.alpha = 0.25 + (Math.sin(spark.life) + 1) * 0.2;

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

    raysMaxLife = Math.max(1, Math.round(gameConfig.fx.jackpotRaysDuration / 16));
    raysLife = raysMaxLife;

    raysContainer.visible = true;
    raysContainer.alpha = 0;
    raysContainer.rotation = Math.random() * Math.PI * 2;
    raysContainer.scale.set(0.85);
}

function playJackpotBurst() {
    const fx = gameConfig.fx;

    const startX = gameConfig.scene.baseWidth / 2;
    const startY = 380;

    for (let i = 0; i < fx.jackpotBurstCount; i++) {
        createBurstParticle(startX, startY);
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

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

window.playJackpotFx = playJackpotFx;

window.addEventListener("load", () => {
    initFx();
});

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

    raysContainer.scale.set(0.85 + progress * 0.25);

    if (raysLife <= 0) {
        raysContainer.alpha = 0;
        raysContainer.visible = false;
    }
}