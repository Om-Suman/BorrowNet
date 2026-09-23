import { forwardRef } from "react";

const FormInput = forwardRef(
  (
    { label, error, type = "text", as = "input", id, className = "", ...rest },
    ref,
  ) => {
    const Component = as;

    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold text-textSecondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <Component
          ref={ref}
          id={id}
          type={as === "input" ? type : undefined}
          className={`bg-surfaceBase border ${error ? "border-danger" : "border-borderStrong"} focus:border-accent focus:ring-1 focus:ring-accent rounded-sm px-3 py-2 text-textPrimary placeholder:text-textSecondary/60 outline-none transition-all duration-fast w-full text-base font-medium`}
          {...rest}
        />
        {error && (
          <span className="text-xs text-danger font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
export default FormInput;
