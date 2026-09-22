import { forwardRef } from 'react';

const FormInput = forwardRef(({ label, error, type = 'text', as = 'input', id, className = '', ...rest }, ref) => {
  const Component = as;
  
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-textPrimary">
          {label}
        </label>
      )}
      <Component
        ref={ref}
        id={id}
        type={as === 'input' ? type : undefined}
        className={`bg-surface border ${error ? 'border-danger' : 'border-borderSubtle'} focus:border-accent focus:ring-1 focus:ring-accent rounded-md px-3 py-2 text-textPrimary placeholder:text-textSecondary outline-none transition-colors w-full`}
        {...rest}
      />
      {error && (
        <span className="text-sm text-danger mt-1">{error}</span>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';
export default FormInput;
