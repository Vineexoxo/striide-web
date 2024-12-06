import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                /* TODO: Phase out old colors */
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "home-linear-gradient":
                    "linear-gradient(193deg, #802EE8 53.74%, #5044F1 90.69%);",
                "login-linear-gradient":
                    "linear-gradient(31deg, #802EE8 50%, #5044F1 98.35%);",
                "landing-page-linear-gradient":
                    "linear-gradient(193deg, #802EE8 53.74%, #5044F1 90.69%);",

                /* New Backgrounds */
                "landing-linear-gradient":
                    "linear-gradient(193deg, #802EE8 53.74%, #5044F1 90.69%);",
                "signup-linear-gradient":
                    "linear-gradient(197deg, #802EE8 8.26%, #5044F1 52.4%);",
            },
            fontFamily: {
                montserrat: ["var(--font-montserrat)"],
                inter: ["var(--font-inter)"],
                mulish: ["var(--font-mulish)"],
                nunito: ["var(--font-nunito)", "sans-serif"],
            },
            colors: {
                /* TODO: Phase out old colors */
                "offwhite-hi-fi": "#F8F8F8",
                "black-hi-fi": "#1F1F1F",
                "grey-hi-fi": "#A5A5A5",
                "landing-background": "#FFF6FF",
                "landing-primary": "#6B18D8",
                "landing-border": "#9E88B2",

                /* Primary Colors */
                "primary-green": "#00A886",
                "primary-orange": "#FF7A4B",
                "primary-purple": "#6B18D8",
                "primary-yellow": "#FFBF42",
                "primary-blue": "#00CBFF",

                /* Secondary Colors */
                "secondary-purple": "#AD71FB",
                "secondary-muted-purple": "#9E88B2",
                "secondary-white": "#FFF6FF",
                "secondary-black": "#1F1926",
            },
        },
    },

    plugins: [],
    /* required for custom colors to be applied - only allowed for bg, text, and border */
    safelist: [
        {
            pattern:
                /(bg|text|border)-(off_white|light_blue|pink|off_black|dark_blue|purple)/,
        },
    ],
};
export default config;
