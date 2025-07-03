import React, { useState, useEffect } from 'react';
import { themes } from './themes';

const ThemeToggle = () => {
  const [themeIndex, setThemeIndex] = useState(0);

  useEffect(() => {
    const theme = themes[themeIndex];
    Object.entries(theme.values).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [themeIndex]);

  const cycleTheme = () => {
    setThemeIndex((prev) => (prev + 1) % themes.length);
  };

  return (
    <button
      onClick={cycleTheme}
      style={{
        background: "var(--dark-gray)",
        color: "var(--fg)",
        padding: "8px 16px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        margin: "10px"
      }}
    >
      🎨 Switch Theme ({themes[themeIndex].name})
    </button>
  );
};

export default ThemeToggle;
