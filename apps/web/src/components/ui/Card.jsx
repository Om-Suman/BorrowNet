export function Card({
  children,
  className = "",
  hoverable,
  onClick,
  ...rest
}) {
  return (
    <div
      className={`bg-surface border border-borderSubtle rounded-lg overflow-hidden transition-all duration-200 shadow-level-3 dark:shadow-level-1 dark:bg-[#0a0a0a] ${hoverable ? "hover:-translate-y-0.5 hover:border-neutral-400 dark:hover:border-neutral-700 cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-5 border-b border-borderSubtle ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div
      className={`px-6 py-5 border-t border-borderSubtle bg-neutral-50 dark:bg-[#121212] ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
