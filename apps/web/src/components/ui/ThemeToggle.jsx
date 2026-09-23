import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surface border border-borderSubtle hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-150 text-textSecondary hover:text-textPrimary hover:bg-neutral-100 dark:hover:bg-neutral-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 select-none ${className}`}
    >
      {isDark ? (
        <Sun className="w-6 h-6 text-amber-400 transition-transform duration-150 rotate-0 scale-100" />
      ) : (
        <Moon className="w-6 h-6 text-neutral-800 dark:text-neutral-200 transition-transform duration-150 rotate-0 scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
