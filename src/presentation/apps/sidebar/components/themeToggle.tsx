import React from "react";
import { useTheme } from "../../../providers/theme_provider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import "./themeToggle.css";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container">
      <label
        className="theme-toggle-switch"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <input
          type="checkbox"
          checked={theme === "dark"}
          onChange={toggleTheme}
          className="theme-toggle-input"
        />
        <span className="theme-toggle-slider">
          <span className="theme-toggle-icon sun-icon">
            <FontAwesomeIcon icon={faSun} />
          </span>
          <span className="theme-toggle-icon moon-icon">
            <FontAwesomeIcon icon={faMoon} />
          </span>
          <span className="theme-toggle-knob"></span>
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
