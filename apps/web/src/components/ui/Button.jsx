import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      // Primary emerald pill/button
      primary:
        "bg-[#006948] text-white hover:bg-[#005137] border border-transparent shadow-sm focus-visible:ring-[#006948] hover:-translate-y-0.5",

      // Emerald direct
      emerald:
        "bg-[#006948] text-white hover:bg-[#005137] border border-transparent shadow-sm focus-visible:ring-[#006948] hover:-translate-y-0.5",

      // Amber community/warm action
      amber:
        "bg-[#fea619] text-[#131b2e] hover:bg-[#e69512] border border-transparent font-semibold shadow-sm focus-visible:ring-[#fea619] hover:-translate-y-0.5",

      // Solid dark button
      dark:
        "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border border-transparent shadow-sm focus-visible:ring-black",

      // Featured commerce CTA (Aloe 10 mint pill)
      aloe: "bg-[#c1fbd4] text-black hover:bg-[#aef7c5] border border-transparent shadow-sm focus-visible:ring-[#c1fbd4]",

      // Pistachio soft pill
      pistachio:
        "bg-[#d4f9e0] text-black hover:bg-[#c2f3d1] border border-transparent shadow-sm",

      // Cinematic hero outline: white border on dark
      "outline-on-dark":
        "border-2 border-white text-white bg-transparent hover:bg-white/10 focus-visible:ring-white",

      // Light track outline: 1px black border on light
      "outline-on-light":
        "border border-black text-black bg-transparent hover:bg-black/5 focus-visible:ring-black",

      // Secondary card/white pill
      secondary:
        "bg-white text-[#131b2e] hover:bg-neutral-50 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 shadow-sm",

      // Minimal ghost pill
      ghost:
        "bg-transparent text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white border border-transparent",

      // Danger pill
      danger:
        "bg-red-600 text-white hover:bg-red-700 border border-transparent",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-xs",
      md: "px-6 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base",
    };

    const classes = `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
