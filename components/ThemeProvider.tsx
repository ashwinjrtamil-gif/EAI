import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

const themes = {
  light: {
    background: '#ffffff',
    color: '#000000',
  },
  dark: {
    background: '#000000',
    color: '#ffffff',
  },
  neon: {
    background: '#0ff0f0',
    color: '#ff0000',
  },
  gradient: {
    background: 'linear-gradient(to right, #FFB6C1, #FF69B4)',
    color: '#000000',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);

  const toggleTheme = (selectedTheme) => {
    setTheme(themes[selectedTheme]);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ background: theme.background, color: theme.color }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);