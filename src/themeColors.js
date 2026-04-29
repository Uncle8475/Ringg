/**
 * COSMIC THEME SYSTEM
 * -------------------
 * Background: Titanium Dark (#1F2937)
 * Primary: Muted Bronze (#BFA668)
 * Text: Eggshell (#F7F4DC)
 * Destructive: Accent Red (#D64541)
 */

export const CosmicTheme = {
    colors: {
        background: '#1F2937',
        primary: '#BFA668', // Muted Bronze
        secondary: '#D64541', // Accent Red (mapped to secondary/accent often)
        accent: '#D64541', // Destructive Red
        card: '#111827', // Deep dark for cards
        border: '#BFA668', // Bronze borders
        textPrimary: '#F7F4DC', // Eggshell
        textSecondary: 'rgba(247,244,220,0.7)',
        textMuted: 'rgba(247,244,220,0.5)',
        textOnDark: '#F7F4DC',
        textOnLight: '#1F2937',
        textOnDanger: '#FFFFFF',
        success: '#BFA668', // Bronze as success? Or Green? Usually Green, but sticking to "Cosmic" palette
        error: '#D64541',
        info: '#4FA3FF',
        iconInactive: 'rgba(247,244,220,0.4)',
        overlay: 'rgba(17,24,39,0.92)'
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 16,
        round: 9999,
    }
};

// Helper to build full theme object
export const buildTheme = (baseColors) => {
    return {
        ...CosmicTheme, // Inherit spacing, radius
        colors: baseColors,
        // Aliases for component ease of use
        background: baseColors.background,
        card: baseColors.card,
        text: baseColors.textPrimary,
        textSecondary: baseColors.textSecondary,
        border: baseColors.border,
        primary: baseColors.primary,
        secondary: baseColors.secondary,
        accent: baseColors.accent,
        muted: baseColors.textMuted,
        error: baseColors.error,
        textOnDark: baseColors.textOnDark,
        iconInactive: baseColors.iconInactive,

        // Status specific
        blockRing: baseColors.accent,
        findRing: baseColors.primary,
        addMoney: baseColors.primary,
        device: baseColors.primary, // or textPrimary
        success: baseColors.success,
        chevron: baseColors.textSecondary,
    };
};

export const DarkTheme = buildTheme(CosmicTheme.colors);

// Light Theme Variation (Inverted where necessary, keeping Brand colors)
export const LightTheme = buildTheme({
    ...CosmicTheme.colors,
    background: '#F7F4DC', // Eggshell BG
    card: '#FFFFFF',
    textPrimary: '#1F2937', // Dark Text
    textSecondary: 'rgba(31, 41, 55, 0.7)',
    textMuted: 'rgba(31, 41, 55, 0.5)',
    textOnDark: '#F7F4DC', // Still light for dark buttons
    border: '#BFA668',
    iconInactive: 'rgba(31, 41, 55, 0.4)',
});
