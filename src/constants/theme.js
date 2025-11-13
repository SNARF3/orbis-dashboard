// theme.js
export const theme = {
  // Colores principales
  colors: {
    primary: '#F4E9D7',
    secondary: '#072D42',
    accent: '#F29E38',
    neutralDark: '#464E59',
    neutralLight: '#9298A6',
    warmLight: '#D9CBBF',
    warmAccent: '#BFAEA4',
    
    // Gradientes
    gradients: {
      primary: 'linear-gradient(135deg, #F4E9D7 0%, #D9CBBF 100%)',
      secondary: 'linear-gradient(135deg, #072D42 0%, #464E59 100%)',
      accent: 'linear-gradient(135deg, #F29E38 0%, #BFAEA4 100%)',
      card: 'linear-gradient(135deg, #FFFFFF 0%, #F4E9D7 100%)',
      sidebar: 'linear-gradient(180deg, #072D42 0%, #464E59 100%)',
    },
    
    // Sombras con colores temáticos
    shadows: {
      card: '0 8px 32px rgba(7, 45, 66, 0.1)',
      hover: '0 12px 48px rgba(7, 45, 66, 0.15)',
      accent: '0 4px 20px rgba(242, 158, 56, 0.3)',
    }
  },
  
  // Tipografía
  fonts: {
    primary: '"Inter", "Segoe UI", system-ui, sans-serif',
    heading: '"Plus Jakarta Sans", "Inter", sans-serif',
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.5rem',
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borders: {
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
    },
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
  
  animations: {
    fadeIn: 'fadeIn 0.6s ease-out',
    slideUp: 'slideUp 0.5s ease-out',
    scaleIn: 'scaleIn 0.4s ease-out',
    glow: 'glow 2s ease-in-out infinite alternate',
  }
};

export default theme;