import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";


const ThemeContext =
  createContext(null);


const THEME_KEY =
  "food-waste-theme";


function getInitialTheme() {
  const savedTheme =
    localStorage.getItem(
      THEME_KEY,
    );

  if (
    savedTheme === "light" ||
    savedTheme === "dark"
  ) {
    return savedTheme;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}


export function ThemeProvider({
  children,
}) {
  const [theme, setTheme] =
    useState(getInitialTheme);


  useEffect(() => {
    const root =
      document.documentElement;

    root.classList.toggle(
      "dark",
      theme === "dark",
    );

    localStorage.setItem(
      THEME_KEY,
      theme,
    );
  }, [theme]);


  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark",
    );
  };


  const value = useMemo(
    () => ({
      theme,
      isDark:
        theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme],
  );


  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}


export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider.",
    );
  }

  return context;
}