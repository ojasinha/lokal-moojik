/**
 * App colour tokens derived from the Figma design.
 * AppColors is the primary design system; Colors is retained for legacy hooks.
 */

import { Platform } from "react-native";

export const ACCENT = "#FF8C00";

export const AppColors = {
  accent: ACCENT,
  light: {
    background: "#FFFFFF",
    surface: "#F5F5F5",
    surfaceAlt: "#EBEBEB",
    textPrimary: "#141414",
    textSecondary: "#757575",
    tabBar: "#FFFFFF",
    border: "#E0E0E0",
    icon: "#757575",
    iconActive: ACCENT,
    playerBg: "#111111",
  },
  dark: {
    background: "#141414",
    surface: "#242424",
    surfaceAlt: "#1E1E1E",
    textPrimary: "#FFFFFF",
    textSecondary: "#9E9E9E",
    tabBar: "#1A1A1A",
    border: "#2A2A2A",
    icon: "#9E9E9E",
    iconActive: ACCENT,
    playerBg: "#111111",
  },
} as const;

export type AppColorScheme = typeof AppColors.light;

// Legacy Colors kept for existing hooks
export const Colors = {
  light: {
    text: "#141414",
    background: "#FFFFFF",
    tint: ACCENT,
    icon: "#757575",
    tabIconDefault: "#757575",
    tabIconSelected: ACCENT,
  },
  dark: {
    text: "#FFFFFF",
    background: "#141414",
    tint: ACCENT,
    icon: "#9E9E9E",
    tabIconDefault: "#9E9E9E",
    tabIconSelected: ACCENT,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
