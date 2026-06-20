export const gameConfig = {
    // =========================
    // 1. BASIC GAME SETTINGS
    // =========================

    balance: {
        startValue: 0,
        currency: "A$"
    },

    currency: {
        effectCoinText: "$"
    },

    scene: {
        baseWidth: 430,
        baseHeight: 760,
        maxScale: 1.15
    },

    // =========================
    // 2. VISUAL THEME
    // =========================

    theme: {
        bodyOverlayTop: "rgba(0, 0, 0, 0.10)",
        bodyOverlayBottom: "rgba(0, 0, 0, 0.20)",

        balancePanelTop: "#5d6bff",
        balancePanelMiddle: "#2738e8",
        balancePanelBottom: "#0d1684",
        balancePanelBorder: "#ffd92f",
        balanceText: "#ffd92f",
        balanceGlow: "rgba(255, 220, 120, 0.45)",

        slotBackground: "rgba(5, 5, 45, 0.92)",
        slotBorder: "#4cc8ff",
        slotGlow: "rgba(0, 180, 255, 0.7)",

        reelTop: "#101049",
        reelBottom: "#05051f",
        reelBorder: "rgba(120, 220, 255, 0.45)",

        ctaPopupTop: "#233dff",
        ctaPopupBottom: "#07075f",
        ctaPopupBorder: "gold",

        ctaButtonTop: "#ffe978",
        ctaButtonBottom: "#e19a00",
        ctaButtonText: "#5c2200"
    },

    fonts: {
        balancePanel: '"Arial Black", sans-serif',
        ctaAmount: '"Arial Black", sans-serif',
        coinValue: '"Arial Black", sans-serif',
        coinParticle: '"Arial Black", sans-serif',
        ctaTitle: '"Arial Black", sans-serif',
        ctaButton: '"Arial Black", sans-serif'
    },

    // =========================
    // 3. ASSETS
    // =========================


    assets: {
        background: "assets/background.webp",
        logo: "assets/logo.webp",

        ui: {
            balancePanel: "assets/ui/balance-panel.webp",
            spinButton: "assets/ui/spin-button.webp"
        },

        symbols: {
            s1: "assets/symbols/cherry.webp",
            s2: "assets/symbols/lemon.webp",
            s3: "assets/symbols/bar.webp",
            s4: "assets/symbols/grape.webp",
            s5: "assets/symbols/melon.webp",
            s6: "assets/symbols/orange.webp",
            s7: "assets/symbols/plum.webp",

            coin: "assets/symbols/coin.webp",
            bonus: "assets/symbols/coin2.webp"
        }
    },


    // Эти символы используются как случайные filler-символы во время прокрутки рилов.
    // Сюда обычно не надо добавлять coin с суммами, потому что coin:100.00 задаётся отдельно в reels.


    reelSymbols: [
        "s1",
        "s2",
        "s3",
        "s4",
        "s5",
        "s6",
        "s7",
        "bonus"
    ],


    // =========================
    // 4. GAME MECHANICS
    // =========================


    grid: {
        columns: 3,
        rows: 3,
        fillerCount: 12
    },

    timings: {
        reelSpinBaseDuration: 900,
        reelSpinStepDuration: 300,
        ctaDelay: 1200,
        jackpotFlashDuration: 600,
        smallWinGlowDuration: 500,
        winReelGlowDuration: 900,
        winSymbolPopDuration: 650
    },

    effects: {
        coinParticlesEnabled: true,
        coinParticleCount: 16,
        coinParticleDuration: 1300,

        coinParticlesFromReelEnabled: false,
        coinParticlesFromWinCoinsEnabled: true,
        coinParticlesPerWinCoin: 8,

        coinParticleMinSize: 20,
        coinParticleMaxSize: 34,

        coinParticleSpreadX: 210,
        coinParticleBurstUpMin: 20,
        coinParticleBurstUpMax: 90,
        coinParticleFallMin: 120,
        coinParticleFallMax: 260,

        coinParticleStartScale: 0.35,
        coinParticleEndScaleMin: 1.15,
        coinParticleEndScaleMax: 1.75,

        coinParticleStagger: 18,

        slotWinGlowEnabled: true,
        slotShineEnabled: false,
        slotShineDuration: 900,

        reelWinGlowEnabled: true,
        anticipationGlowEnabled: true,
        bonusPulseEnabled: true,

        balancePopEnabled: true,
        balancePopDuration: 620,
    },

    sfx: {
        enabled: true,
        masterVolume: 0.7,

        sounds: {
            spin1: {
                src: "assets/sfx/spin-1.mp3",
                volume: 1
            },

            spin2: {
                src: "assets/sfx/spin-2.mp3",
                volume: 1
            },

            spin3: {
                src: "assets/sfx/spin.mp3",
                volume: 1
            },

            lose: {
                src: "assets/sfx/lose.mp3",
                volume: 1
            },

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

        spinStartFxEnabled: false,
        spinStartBurstCount: 18,
        spinStartSpreadX: 120,
        spinStartDuration: 480,
        spinStartY: 360,

        reelLandFxEnabled: false,
        reelLandBurstCount: 10,
        reelLandSpreadX: 70,
        reelLandDuration: 520,
        reelLandY: 390,

        anticipationParticlesEnabled: false,
        anticipationParticleCount: 10,

        smallWinBurstEnabled: false,
        smallWinBurstCount: 22,
        smallWinSpreadX: 110,
        smallWinBurstDuration: 750,

        slotShineEnabled: false,
        slotShineDuration: 900,
        slotShineY: 250,
        slotShineWidth: 90,
        slotShineHeight: 280,

        balanceSparksEnabled: false,
        balanceSparkCount: 10,
        balanceSparkSpreadX: 80,
        balanceSparkDuration: 550,

        ctaConfettiEnabled: true,
        ctaConfettiCount: 72,
        ctaConfettiDuration: 2700,

        jackpotFlashEnabled: true,
        jackpotFlashDuration: 520,

        jackpotRaysEnabled: true,
        jackpotRaysDuration: 1400,
        jackpotRaysY: 370,
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
        coinRainText: "$",
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


    // =========================
    // 5. START SCREEN
    // =========================

    // Порядок символов:
    // [0] [1] [2]
    // [3] [4] [5]
    // [6] [7] [8]


    startScreen: {
        reels: [
            "s6", "s3", "s1",
            "s4", "s2", "s5",
            "s7", "s6", "s1"
        ]
    },


    // =========================
    // 6. SPIN SCRIPT
    // =========================

    // Каждый объект = один клик по SPIN.
    // reels задаются в таком порядке:
    // [0] [1] [2]
    // [3] [4] [5]
    // [6] [7] [8]


    spins: [
        {
            type: "lose",
            spinSfx: "spin1",
            balance: 0,
            balanceDelay: 0,
            balanceCountDuration: 0,
            reels: [
                "s6", "s6", "s2",
                "s6", "s3", "s1",
                "s5", "s5", "s1"
            ]
        },

        {
            type: "smallWin",
            spinSfx: "spin2",
            balance: 350,
            balanceDelay: 300,
            balanceCountDuration: 500,

            winReels: [0],
            winSymbols: ["coin:100.00", "coin:250.00"],

            reels: [
                "coin:100.00", "s3", "s1",
                "coin:250.00", "s1", "s1",
                "s7", "s2", "s1"
            ]
        },

        {
            type: "jackpot",
            spinSfx: "spin3",
            balance: 10350,
            balanceDelay: 500,
            balanceCountDuration: 2000,

            balanceEffect: "pulse",

            reelDurations: [900, 1200, 4200],
            reelFillerCounts: [12, 12, 36],
            anticipationReel: 2,
            anticipationDelay: 1300,

            winReels: [0, 1, 2],
            winSymbols: ["bonus"],
            reels: [
                "s6", "s2", "s1",
                "s4", "bonus", "s3",
                "bonus", "s7", "bonus"
            ]
        }
    ],


    // =========================
    // 7. CTA / OFFER
    // =========================



    cta: {
        title: "BIG WIN!",
        amount: "10 350 A$",
        buttonText: "CLAIM!"
    },

    offer: {
        url: "https://google.com"
    }
};

window.gameConfig = gameConfig;
