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

    // =========================
    // 2. VISUAL THEME
    // =========================

    theme: {
        bodyOverlayTop: "rgba(28, 0, 0, 0.12)",
        bodyOverlayBottom: "rgba(0, 0, 0, 0.32)",

        logoGlow: "rgba(255, 220, 90, 0.42)",

        welcomeTitleText: "#fff2a6",
        welcomeTitleTop: "rgba(99, 17, 8, 0.92)",
        welcomeTitleBottom: "rgba(30, 5, 2, 0.86)",
        welcomeTitleGlow: "rgba(255, 74, 16, 0.44)",
        welcomeTitleShadow: "#4b0b00",

        bonusLabelText: "#ffe587",
        bonusLabelTop: "rgba(88, 14, 6, 0.88)",
        bonusLabelBottom: "rgba(24, 4, 2, 0.8)",
        bonusLabelGlow: "rgba(255, 76, 16, 0.34)",

        balancePanelTop: "#3b1110",
        balancePanelMiddle: "#1c0909",
        balancePanelBottom: "#090202",
        balancePanelBorder: "#ffcf4a",
        balanceText: "#fff0a2",
        balanceGlow: "rgba(255, 110, 24, 0.62)",
        balanceValueText: "#fff3b0",
        balanceValueTop: "rgba(99, 17, 8, 0.92)",
        balanceValueBottom: "rgba(30, 5, 2, 0.86)",
        balanceValueGlow: "rgba(255, 88, 18, 0.7)",
        balanceValueGoldGlow: "rgba(255, 204, 64, 0.34)",

        slotBackground: "rgba(12, 4, 8, 0.94)",
        slotBorder: "#ff9b22",
        slotGlow: "rgba(255, 74, 16, 0.72)",
        slotOuterGlow: "rgba(255, 89, 18, 0.75)",
        slotInnerGlow: "rgba(255, 199, 64, 0.14)",
        slotReelsTop: "rgba(34, 8, 11, 0.6)",
        slotReelsBottom: "rgba(8, 1, 3, 0.6)",
        slotReelTop: "rgba(33, 7, 12, 0.6)",
        slotReelBottom: "rgba(7, 1, 3, 0.6)",

        reelTop: "#160511",
        reelBottom: "#050106",
        reelBorder: "rgba(255, 170, 48, 0.42)",

        buttonBorder: "rgba(255, 235, 150, 0.9)",
        buttonText: "#fff3ad",
        buttonTop: "#6a2114",
        buttonBottom: "#250604",
        buttonHighlight: "rgba(255, 220, 116, 0.3)",
        buttonGlow: "rgba(255, 87, 18, 0.65)",
        buttonGoldGlow: "rgba(255, 210, 80, 0.32)",
        buttonInnerShadow: "rgba(0, 0, 0, 0.62)",

        tryAgainText: "#fff2a5",
        tryAgainTop: "#6a2114",
        tryAgainBottom: "#240706",

        tapRippleBorder: "rgba(255, 235, 150, 0.9)",
        tapRippleGlow: "rgba(255, 216, 80, 0.65)",

        winLineBorder: "rgba(255, 232, 146, 0.96)",
        winLineGlow: "rgba(255, 226, 120, 0.95)",
        winLineInnerGlow: "rgba(255, 226, 120, 0.28)",
        winSymbolGlow: "rgba(255, 225, 92, 0.95)",
        jackpotSymbolGlow: "rgba(255, 235, 110, 1)",

        ctaPopupTop: "#5c0e08",
        ctaPopupBottom: "#160303",
        ctaPopupBorder: "#ffcf4a",
        ctaPopupGlow: "rgba(255, 73, 16, 0.42)",
        ctaPopupRadialGlow: "rgba(255, 95, 22, 0.34)",

        ctaButtonTop: "#fff06f",
        ctaButtonBottom: "#ff8a00",
        ctaButtonText: "#591400",
        ctaButtonShadow: "#9d3d00",
        ctaButtonGlow: "rgba(255, 210, 70, 0.62)",
        ctaButtonOuterGlow: "rgba(255, 80, 12, 0.45)",

        ctaTitleText: "#ffe46b",
        ctaAmountText: "#fffef4",
        ctaSubtitleText: "rgba(255, 255, 255, 0.88)"
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
        background: "assets/img/background.webp",
        logo: "assets/img/logo.webp",
        bill: "assets/img/bill.webp",
        hand: "assets/img/hand.webp",
        getIt: "assets/img/getit.webp",
        slotFrame: "assets/img/slot-frame.webp",

        ui: {
            balancePanel: "assets/img/balance-panel.webp",
            spinButton: "assets/img/spin-button.webp"
        },

        symbols: {
            s1: "assets/img/symbol1.webp",
            s2: "assets/img/symbol2.webp",
            s3: "assets/img/symbol3.webp",
            s4: "assets/img/symbol4.webp",
            s5: "assets/img/symbol5.webp",
            s6: "assets/img/symbol6.webp",
            s7: "assets/img/symbol7.webp",

            coin: "assets/img/symbolsmall.webp",
            bonus: "assets/img/symbolbig.webp"
        }
    },


    // Filler symbols used while reels are spinning.
    // Keep prize/bonus symbols out of this list unless they should appear as random fillers.


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
        billAsset: "assets/img/bill.webp",
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
            src: "assets/sfx/music.MP3",
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
