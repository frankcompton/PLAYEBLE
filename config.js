export const gameConfig = {
    // =========================
    // 1. BASIC GAME SETTINGS
    // =========================

    balance: {
        startValue: 0,
        startFreeSpins: 0,
        currency: "€"
    },

    currency: {
        effectCoinText: "€"
    },

    scene: {
        baseWidth: 430,
        baseHeight: 760,
        maxScale: 1.15
    },

    delivery: {
        source: "moloco",
        ctaMode: "fb"
    },

    unity: {
        fallbackUrl: "https://play.google.com/store/apps/details?id=com.wanted5game"
    },

    // =========================
    // 2. VISUAL THEME
    // =========================

    theme: {
        bodyOverlayTop: "rgba(160, 0, 20, 0.1)",
        bodyOverlayBottom: "rgba(20, 0, 0, 0.32)",

        balancePanelTop: "#b51222",
        balancePanelMiddle: "#6e0712",
        balancePanelBottom: "#240003",
        balancePanelBorder: "#ffd84a",
        balanceText: "#ffe53b",
        balanceGlow: "rgba(255, 204, 44, 0.5)",

        slotBackground: "rgba(34, 0, 10, 0.86)",
        slotBorder: "#ffd84a",
        slotGlow: "rgba(255, 204, 44, 0.62)",

        reelTop: "#5d0711",
        reelBottom: "#180004",
        reelBorder: "rgba(255, 255, 255, 0)",

        ctaPopupTop: "#a60f1e",
        ctaPopupBottom: "#260003",
        ctaPopupBorder: "#ffd84a",

        ctaButtonTop: "#fff36d",
        ctaButtonBottom: "#ffc400",
        ctaButtonText: "#111111"
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
        bill: "assets/bill.webp",
        slotFrame: "assets/slot-frame.webp",

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
        coinParticlesEnabled: false,
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

        reelWinGlowEnabled: false,
        anticipationGlowEnabled: true,
        bonusPulseEnabled: true,

        balancePopEnabled: true,
        balancePopDuration: 620,

        billParticlesEnabled: true,
        billRainEnabled: false,
        billAsset: "assets/bill.webp",
        billsPerSmallWinSymbol: 1,
        billsPerJackpotSymbol: 5,
        billParticleDuration: 980,
        billParticleStagger: 95,
        billParticleWidth: 108,
        billParticlePopScale: 1.08,
        billParticleTargetScale: 0.24,
        billRainCount: 15,
        billRainDuration: 3600,
        billRainWidthMin: 82,
        billRainWidthMax: 130,
        billRainStagger: 145,
    },

    sfx: {
        enabled: true,
        masterVolume: 0.7,

        music: {
            src: "assets/music.MP3",
            volume: 0.18,
            duckVolume: 0.08,
            fadeDuration: 450
        },

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
        ambientGlowColor: 0xff8a16,
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
        ctaConfettiCount: 50,
        ctaConfettiDuration: 2700,

        jackpotFlashEnabled: true,
        jackpotFlashDuration: 520,

        jackpotRaysEnabled: true,
        jackpotRaysDuration: 1400,
        jackpotRaysY: 370,
        jackpotRayCount: 13,
        jackpotRayLength: 580,
        jackpotRayWidth: 36,
        jackpotRaysRotationSpeed: 0.014,

        jackpotBurstEnabled: false,
        jackpotBurstCount: 50,
        jackpotStarBurstCount: 13,
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
        coinRainText: "\u20ac",
        coinRainInterval: 11,
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
            bonusCash: 0,
            bonusFreeSpins: 0,
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
            bonusCash: 300,
            bonusFreeSpins: 50,
            balanceDelay: 300,
            balanceCountDuration: 500,

            winReels: [0, 1, 2],
            winSymbols: ["coin"],

            reels: [
                "s4", "s3", "s1",
                "coin", "coin", "coin",
                "s7", "s2", "s1"
            ]
        },

        {
            type: "jackpot",
            spinSfx: "spin3",
            balance: 2500,
            bonusCash: 2500,
            bonusFreeSpins: 250,
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
                "bonus", "bonus", "bonus",
                "s4", "s7", "s3"
            ]
        }
    ],


    // =========================
    // 7. CTA / OFFER
    // =========================



    cta: {
        title: "BONUS FREIGESCHALTET!",
        amount: "100% BIS ZU 2500\u20ac<br>+ 250 FREISPIELE",
        buttonText: "BONUS HOLEN",
        countdownLabel: "ANGEBOT ENDET IN",
        countdownMinutes: 30
    },

    offer: {
        url: ""
    }
};

window.gameConfig = gameConfig;
