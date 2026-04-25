import React, { createContext, useContext, useMemo } from "react";

/**
 * Light appearance tokens shared by the app's themed UI components.
 *
 * @type {Object}
 */
const light = {
  name: "light",
  background: "#f4f1ea",
  surface: "#fffdf8",
  surfaceMuted: "#f6f1e8",
  highlightSurface: "#f8f1e6",
  border: "#ddd3c4",
  text: "#1a1611",
  textMuted: "#655b4f",
  textSoft: "#857968",
  inverseText: "#fffaf2",
  heroSurface: "#18231d",
  heroText: "#ffffff",
  heroMutedText: "#d3ddd5",
  chip: "#efe8dc",
  overlay: "rgba(255,253,248,0.96)",
  buttonSecondarySurface: "#fffaf2",
  buttonSecondaryText: "#1a1611",
};

/**
 * Dark appearance tokens shared by the app's themed UI components.
 *
 * @type {Object}
 */
const dark = {
  name: "dark",
  background: "#05070a",
  surface: "#0c1014",
  surfaceMuted: "#131922",
  highlightSurface: "#161d25",
  border: "#232c37",
  text: "#ffffff",
  textMuted: "#d3d9e3",
  textSoft: "#8d98a8",
  inverseText: "#05070a",
  heroSurface: "#121a21",
  heroText: "#ffffff",
  heroMutedText: "#c0ccd9",
  chip: "#161d25",
  overlay: "rgba(12,16,20,0.94)",
  buttonSecondarySurface: "#f4f7fb",
  buttonSecondaryText: "#05070a",
};

const ThemeContext = createContext(light);

/**
 * Provides the active theme object to the component tree.
 *
 * @param {Object} props Component props
 * @param {boolean} props.darkMode Whether dark mode is enabled
 * @param {React.ReactNode} props.children Nested app content
 * @returns {JSX.Element} Theme context provider
 */
export function ThemeProvider({ darkMode, children }) {
  const value = useMemo(() => (darkMode ? dark : light), [darkMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Returns the active theme from context.
 *
 * @returns {Object} Active theme tokens
 */
export function useTheme() {
  return useContext(ThemeContext);
}
