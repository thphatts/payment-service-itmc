/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        // --- ORIGINAL MATERIAL 3 COLORS (For Dashboard/Pages) ---
        "primary": "#0061A4",
        "on-primary": "#FFFFFF",
        "primary-container": "#D1E4FF",
        "on-primary-container": "#001D36",
        "secondary": "#535F70",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#D7E3F7",
        "on-secondary-container": "#101C2B",
        "tertiary": "#6B5778",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#F2DAFF",
        "on-tertiary-container": "#251431",
        "error": "#BA1A1A",
        "on-error": "#FFFFFF",
        "error-container": "#FFDAD6",
        "on-error-container": "#410002",
        "background": "#FDFBFF",
        "on-background": "#1A1C1E",
        "surface": "#FDFBFF",
        "on-surface": "#1A1C1E",
        "surface-variant": "#E0E2EC",
        "on-surface-variant": "#43474E",
        "outline": "#73777F",
        "outline-variant": "#C3C7CF",
        "inverse-surface": "#2F3033",
        "inverse-on-surface": "#F1F0F4",
        "inverse-primary": "#9ECAFF",
        "surface-tint": "#0061A4",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F7F6FB",
        "surface-container": "#F1F0F6",
        "surface-container-high": "#EBE9F0",
        "surface-container-highest": "#E5E3EA",

        // --- TECH THEME COLORS (For Login Page) ---
        "tech": {
          "primary": "#a3c9ff",
          "background": "#0b1326",
          "surface": "#0b1326",
          "secondary": "#ffc384",
          "on-background": "#dae2fd",
          "on-surface": "#dae2fd",
          "outline-variant": "#404753",
          "container-lowest": "#060e20"
        }
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "gutter": "24px",
        "xl": "80px",
        "sm": "12px",
        "lg": "48px",
        "md": "24px",
        "xs": "4px",
        "base": "8px",
        "margin-mobile": "16px",
        "margin-desktop": "64px"
      },
      "fontFamily": {
        "display-lg": ["Manrope"],
        "headline-md": ["Manrope"],
        "headline-md-mobile": ["Manrope"],
        "title-sm": ["Manrope"],
        "display-lg-mobile": ["Manrope"],
        "label-caps": ["Manrope"],
        "body-base": ["Manrope"]
      },
      "fontSize": {
        "display-lg": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "headline-md": ["32px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "headline-md-mobile": ["24px", { "lineHeight": "1.3", "fontWeight": "700" }],
        "title-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "display-lg-mobile": ["36px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "label-caps": ["12px", { "lineHeight": "1.0", "letterSpacing": "0.1em", "fontWeight": "700" }],
        "body-base": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}