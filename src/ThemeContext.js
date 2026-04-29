import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CosmicTheme, DarkTheme, LightTheme } from './themeColors';

// Create Context
const ThemeContext = createContext(DarkTheme); // Default should be the theme object itself

export const ThemeProvider = ({ children }) => {
    const [themeName, setThemeName] = useState('dark');

    // Load saved theme
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem('appTheme');
                if (saved && ['dark', 'light', 'system'].includes(saved)) {
                    setThemeName(saved);
                }
            } catch (e) {
                console.warn('Failed to load theme:', e);
            }
        };
        loadTheme();
    }, []);

    // Compute active theme
    const activeTheme = (() => {
        if (themeName === 'system') {
            const scheme = Appearance.getColorScheme();
            return scheme === 'light' ? LightTheme : DarkTheme;
        }
        return themeName === 'light' ? LightTheme : DarkTheme;
    })();

    const handleSetTheme = async (name) => {
        setThemeName(name);
        try {
            await AsyncStorage.setItem('appTheme', name);
        } catch (e) {
            console.warn('Failed to save theme:', e);
        }
    };

    return (
        <ThemeContext.Provider value={activeTheme}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook
export const useTheme = () => {
    const theme = useContext(ThemeContext);

    // Safety check: Ensure theme is an object
    if (!theme) {
        // console.warn('useTheme: Theme context is null/undefined, falling back to DarkTheme');
        return DarkTheme;
    }

    // Safety check: Ensure theme has colors (it might be the old default shape { theme: ... })
    if (!theme.colors) {
        // Check for nested theme property (legacy default value structure)
        if (theme.theme && theme.theme.colors) {
            return theme.theme;
        }

        // console.warn('useTheme: Theme context has invalid shape', theme);
        return DarkTheme;
    }

    return theme;
};

export default ThemeContext;
