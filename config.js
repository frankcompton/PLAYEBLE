export const gameConfig = {
    currency: {
        effectCoinText: "€"
    },

    scene: {
        baseWidth: 430,
        baseHeight: 760,
        maxScale: 1.15
    },

    assets: {
        scratch: {
            background: "assets/strach/scratch-bg.webp",
            logo: "assets/strach/scratch-logo.webp",
            character: "assets/strach/scratch-character.webp",
            infoPanel: "assets/strach/scratch-info-panel.webp",
            cardCover: "assets/strach/scratch-card-cover.webp",
            cardWin: "assets/strach/scratch-card-win.webp",
            hand: "assets/strach/scratch-hand.webp"
        }
    },

    scratch: {
        cardsToReveal: 3,
        bigWinDelay: 450,
        ctaDelay: 2600,
        prizeLine1: "2.500€",
        prizeLine2: "250 Freispiele",
        subtitle: "SPITZENGEWINN",
        topAmount: "25.000€",
        infoNumber: "6",
        infoText: "GEWINN-CHANCEN",
        cardLabel: "GEWINN",
        instruction: "Rubbel die Vase!"
    },

    sfx: {
        enabled: true,
        masterVolume: 0.7,

        sounds: {
            smallWin: {
                src: "assets/sfx/small-win.mp3",
                volume: 1
            },

            jackpot: {
                src: "assets/sfx/jackpot.mp3",
                volume: 1
            }
        }
    },

    fx: {
        idleSparksEnabled: true,
        idleSparkCount: 40,
        idleSparkMinSize: 2,
        idleSparkMaxSize: 5,
        idleSparkMinSpeedY: 0.25,
        idleSparkMaxSpeedY: 0.65,
        idleSparkMaxSpeedX: 0.2,

        twinkleStarsEnabled: true,
        twinkleStarCount: 14,
        twinkleStarMinSize: 3,
        twinkleStarMaxSize: 6,

        ambientGlowEnabled: true,
        ambientGlowY: 340,
        ambientGlowRadius: 210,
        ambientGlowColor: 0x4cc8ff,
        ambientGlowAlpha: 0.08,
        ambientGlowPulse: 0.06,

        coinParticlesPerWinCoin: 8,
        coinParticleCount: 16,
        coinParticleDuration: 1300,
        coinParticleMinSize: 20,
        coinParticleMaxSize: 34,

        jackpotFlashEnabled: true,
        jackpotFlashDuration: 520,

        jackpotRaysEnabled: true,
        jackpotRaysDuration: 1400,
        jackpotRayCount: 22,
        jackpotRayLength: 580,
        jackpotRayWidth: 36,
        jackpotRaysRotationSpeed: 0.014,

        jackpotBurstEnabled: true,
        jackpotBurstCount: 72,
        jackpotStarBurstCount: 18,
        jackpotBurstDuration: 1500,
        jackpotBurstY: 380,
        jackpotBurstMinSize: 4,
        jackpotBurstMaxSize: 11,
        jackpotBurstSpreadX: 300,
        jackpotBurstLaunchUpMin: 40,
        jackpotBurstLaunchUpMax: 150,
        jackpotBurstGravity: 0.12,
        jackpotBurstRotationMin: 0.03,
        jackpotBurstRotationMax: 0.12,

        jackpotShockwaveEnabled: true,
        jackpotShockwaveDuration: 680,

        coinRainEnabled: true,
        coinRainInterval: 8,
        coinRainMinSize: 12,
        coinRainMaxSize: 24,
        coinRainMinSpeed: 1.8,
        coinRainMaxSpeed: 3.6,
        coinRainDropDuration: 2600,

        softGlowEnabled: true,
        softGlowDuration: 2200,
        softGlowColor: 0xffd45a,
        softGlowRadiusX: 260,
        softGlowRadiusY: 180,
        softGlowPeakAlpha: 0.48,
        softGlowY: 350
    },

    cta: {
        title: "Herzlichen Glückwunsch!",
        amount: "",
        description: "Du hast 2.500€ und 250 Freispiele.",
        hint: "Klicke auf den Button, um deinen Gewinn abzuholen.",
        buttonText: "Gewinn abholen",
        countdownLabel: "OFFER ENDS IN",
        countdownMinutes: 30,
        countdownEnabled: false
    },

    offer: {
        url: "https://google.com"
    }
};

window.gameConfig = gameConfig;
