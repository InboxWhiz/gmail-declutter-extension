import React from "react";
import { useTheme } from "../../../providers/theme_provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import "./themeToggle.css";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <FontAwesomeIcon
        icon={theme === "light" ? faSun : faMoon}
        className="icon"
      />
    </button>
  );
};

export default ThemeToggle;
