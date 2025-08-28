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
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				'color-palette1': '#813CF0', 
				'color-palette2': '#A11FCC', 
				'color-palette3': '#BD3CF0',
				'color-palette4': '#483CF0',
				'color-palette5': '#2E1F33', 
				'color-palette6': '#180038'
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
				'bottom-left-lg': '-8px 8px 16px var(--tw-shadow-color)',
			},
		},
		screens: {
			'xs': '360px', // => @media (min-width: 420px) { ... }

			'sm': '640px',
			// => @media (min-width: 640px) { ... }
	  
			'md': '768px',
			// => @media (min-width: 768px) { ... }
	  
			'lg': '1024px',
			// => @media (min-width: 1024px) { ... }
	  
			'xl': '1280px',
			// => @media (min-width: 1280px) { ... }
		}
	},
  	plugins: [
		require("tailwindcss-animate"),
		plugin(function ({ matchUtilities, theme }) {
			matchUtilities(
			  {	
				'text-shadow': (value:string) => ({
				  textShadow: value,
				}),
			  },
			  { values: theme('textShadow') }
			)
		  })
	]

};
export default config;
