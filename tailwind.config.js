module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'dark-blue': '#00034B',
        'medium-blue': '#8888ff',
        'cool-white': '#ebebff',
        'dark-red': '#4a0000',
        'light-red': '#ff8787',
        'warm-white': '#ffebeb',
        red: '#cc0035',
      },
      gradientColorStops: {
        'dark-blue': '#00034B',
        'medium-blue': '#8888ff',
        'cool-white': '#ebebff',
        'dark-red': '#4a0000',
        'light-red': '#ff8787',
        'warm-white': '#ffebeb',
        red: '#cc0035',
        'light-yellow': '#cdcbc6',
      },
      textColor: {
        'light-red': '#ff8787',
      },
      fontFamily: {
        sans: ['wavehaus'],
      },
      width: {
        '1/8': '12.5%',
        '3/8': '37.5%',
        '5/8': '62.5%',
        '7/8': '87.5%',
        '1/7': '14.29%',
        '6/7': '85.71%',
      },
      height: {
        '9/10': '90%',
      },
      minWidth: {
        64: '16rem',
        56: '14rem',
        '160px': '160px',
        '3/4': '75%',
        '9/10': '90%',
      },
      minHeight: {
        '1/3': '33.33%',
        '9/10': '90%',
        '1/2': '50%',
        '1/4': '25%',
        '5/8': '62.5%',
        16: '4rem',
      },
      backgroundColor: (theme) => ({
        lightBackground: '#F4F4F4',
        aqua: '#D8F8FF',
        darkAqua: '#B0F1FF',
      }),
      backgroundImage: {
        'hero-pattern': `url(${'/assets/bg2.jpeg'})`, // !change
      },
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
    },
  },
  plugins: [],
};
