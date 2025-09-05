import plugin from 'tailwindcss/plugin'
import type { Config } from "tailwindcss/types/config";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	extend: {
    		colors: {
    			background: 'var(--background)',
    			foreground: 'var(--foreground)',
    			card: {
    				DEFAULT: 'var(--card)',
    				foreground: 'var(--card-foreground)'
    			},
    			popover: {
    				DEFAULT: 'var(--popover)',
    				foreground: 'var(--popover-foreground)'
    			},
    			primary: {
    				DEFAULT: 'var(--primary)',
    				foreground: 'var(--primary-foreground)'
    			},
    			secondary: {
    				DEFAULT: 'var(--secondary)',
    				foreground: 'var(--secondary-foreground)'
    			},
    			muted: {
    				DEFAULT: 'var(--muted)',
    				foreground: 'var(--muted-foreground)'
    			},
    			accent: {
    				DEFAULT: 'var(--accent)',
    				foreground: 'var(--accent-foreground)'
    			},
    			destructive: {
    				DEFAULT: 'var(--destructive)',
    				foreground: 'var(--destructive-foreground)'
    			},
    			border: 'var(--border)',
    			input: 'var(--input)',
    			ring: 'var(--ring)',
    			chart: {
    				'1': 'var(--chart-1)',
    				'2': 'var(--chart-2)',
    				'3': 'var(--chart-3)',
    				'4': 'var(--chart-4)',
    				'5': 'var(--chart-5)'
    			},
    			section1: 'var(--section1)',
    			section2: 'var(--section2)',
    			softgray: 'var(--softgray)',
    			sidebar: {
    				DEFAULT: 'var(--sidebar-background',
    				foreground: 'var(--sidebar-foreground)',
    				primary: 'var(--sidebar-primary)',
    				'primary-foreground': 'var(--sidebar-primary-foreground)',
    				accent: 'var(--sidebar-accent)',
    				'accent-foreground': 'var(--sidebar-accent-foreground)',
    				border: 'var(--sidebar-border)',
    				ring: 'var(--sidebar-ring)'
    			}
    		},
    		backgroundImage: {
    			bgcalcgreen: 'var(--bgcalcgreen)',
    			bgGreenSimbols: 'var(--bg-green-simbols)',
    			greenScribbleTextBg: 'var(--green-scribble-text-bg)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		textShadow: {
    			sm: '0 1px 2px var(--tw-shadow-color)',
    			DEFAULT: '0 2px 4px var(--tw-shadow-color)',
    			lg: '0 8px 16px var(--tw-shadow-color)',
    			top: '0 -2px 4px var(--tw-shadow-color)',
    			'top-sm': '0 -1px 2px var(--tw-shadow-color)',
    			'top-lg': '0 -8px 16px var(--tw-shadow-color)',
    			right: '2px 0 4px var(--tw-shadow-color)',
    			'right-sm': '1px 0 2px var(--tw-shadow-color)',
    			'right-lg': '8px 0 16px var(--tw-shadow-color)',
    			bottom: '0 2px 4px var(--tw-shadow-color)',
    			'bottom-sm': '0 1px 2px var(--tw-shadow-color)',
    			'bottom-lg': '0 8px 16px var(--tw-shadow-color)',
    			left: '-2px 0 4px var(--tw-shadow-color)',
    			'left-sm': '-1px 0 2px var(--tw-shadow-color)',
    			'left-lg': '-8px 0 16px var(--tw-shadow-color)',
    			'top-right': '2px -2px 4px var(--tw-shadow-color)',
    			'top-right-sm': '1px -1px 2px var(--tw-shadow-color)',
    			'top-right-lg': '8px -8px 16px var(--tw-shadow-color)',
    			'top-left': '-2px -2px 4px var(--tw-shadow-color)',
    			'top-left-sm': '-1px -1px 2px var(--tw-shadow-color)',
    			'top-left-lg': '-8px -8px 16px var(--tw-shadow-color)',
    			'bottom-right': '2px 2px 4px var(--tw-shadow-color)',
    			'bottom-right-sm': '1px 1px 2px var(--tw-shadow-color)',
    			'bottom-right-lg': '8px 8px 16px var(--tw-shadow-color)',
    			'bottom-left': '-2px 2px 4px var(--tw-shadow-color)',
    			'bottom-left-sm': '-1px 1px 2px var(--tw-shadow-color)',
    			'bottom-left-lg': '-8px 8px 16px var(--tw-shadow-color)'
    		},
    		fontFamily: {
    			sans: [
    				'Inter',
    				'Arial',
    				'sans-serif'
    			],
    			title: [
    				'Lexend',
    				'sans-serif'
    			]
    		},
		
    	},
    	screens: {
    		xs: '360px',
    		sm: '640px',
    		md: '768px',
    		lg: '1024px',
    		xl: '1280px'
    	}
    },
  	plugins: [
		require("tailwindcss-animate"),
		require('tailwindcss-children'),
		plugin(function ({ matchUtilities, theme }) {
			matchUtilities(
			  {	
				'text-shadow': (value:string) => ({
				  textShadow: value,
				}),
			  },
			  { values: theme('textShadow') }
			),
			// dark-icon
			matchUtilities(
				{
				'dark-icon': () => ({
					filter: 'var(--dark-icon)',
				}),
				},
				{ values: { DEFAULT: 'var(--dark-icon)' } }
			)
		})
	]

};
export default config;
