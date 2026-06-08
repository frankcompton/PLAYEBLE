const gameConfig = {
    balance: {
        startValue: 0,
        currency: "A$"
    },

    theme: {
    bodyOverlayTop: "rgba(0, 0, 0, 0.35)",
    bodyOverlayBottom: "rgba(0, 0, 0, 0.55)",

    balancePanelTop: "#3347ff",
    balancePanelBottom: "#101080",
    balancePanelBorder: "rgba(255, 220, 120, 0.9)",
    balanceText: "gold",

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
layout: {
    gameGap: 22,

    balancePanelWidth: "86vw",
    balancePanelMaxWidth: "560px",
    balancePanelHeight: "74px",
    balancePanelFontSize: "46px",
    balancePanelMarginBottom: "28px",

    slotStageWidth: "92vw",
    slotStageMaxWidth: "620px",
    slotStagePaddingTop: "85px",

    logoWidth: "82%",
    logoMaxWidth: "520px",

    slotWidth: "100%",
    slotMaxWidth: "620px",
    slotHeight: "330px",
    slotPadding: "12px",

    spinButtonSize: "132px",
    spinButtonFontSize: "28px",

    mobile: {
        gameGap: 14,

        balancePanelWidth: "92vw",
        balancePanelMaxWidth: "none",
        balancePanelHeight: "46px",
        balancePanelFontSize: "28px",
        balancePanelMarginBottom: "12px",

        slotStageWidth: "96vw",
        slotStageMaxWidth: "none",
        slotStagePaddingTop: "58px",

        logoWidth: "82%",
        logoMaxWidth: "none",

        slotWidth: "96vw",
        slotMaxWidth: "none",
        slotHeight: "250px",
        slotPadding: "8px",

        spinButtonSize: "86px",
        spinButtonFontSize: "22px",

        symbolHeight: 78,
        coinValueFontSize: "15px"
    }
},

    grid: {
    columns: 3,
    rows: 3,
    symbolHeight: 100,
    fillerCount: 12
    },

    timings: {
        reelSpinBaseDuration: 900,
        reelSpinStepDuration: 300,
        ctaDelay: 1200,
        jackpotFlashDuration: 600,
        smallWinGlowDuration: 500,
        winReelGlowDuration: 900,
        coinParticleDuration: 800,
        winSymbolPopDuration: 650
    },

    effects: {
        coinParticleCount: 10
    },

    assets: {
    background: "assets/symbols/background.webp",
    logo: "assets/symbols/logo.webp",

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

    startScreen: {
        reels: [
            "coin:100.00", "s3", "s1",
            "coin:250.00", "s1", "s1",
            "s7", "s2", "s1"
        ]
    },

    spins: [
        {
            type: "lose",
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
            balance: 350,
            balanceDelay: 300,
            balanceCountDuration: 500,
            winReels: [0],
            reels: [
                "coin:100.00", "s3", "s1",
                "coin:250.00", "s1", "s1",
                "s7", "s2", "s1"
            ]
        },

        {
    type: "jackpot",
    balance: 10350,
    balanceDelay: 500,
    balanceCountDuration: 2000,

    reelDurations: [900, 1200, 4200],
    reelFillerCounts: [12, 12, 36],
    anticipationReel: 2,
    anticipationDelay: 1300,

    winReels: [0, 1, 2],
    winSymbols: ["bonus"],
    reels: [
        "coin:350.00", "s2", "s1",
        "coin:250.00", "bonus", "s3",
        "bonus", "s7", "bonus"
    ]
}
    ],

    cta: {
        title: "BIG WIN!",
        amount: "10 350 A$",
        buttonText: "CLAIM BONUS"
    }
};