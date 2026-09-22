export function Card({ children, className = '', hoverable, onClick, ...rest }) {
  return (
    <div 
      className={`bg-surface border border-borderSubtle rounded-lg overflow-hidden ${hoverable ? 'hover:border-borderStrong hover:bg-surfaceElevated transition-all cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-borderSubtle ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`px-6 py-4 border-t border-borderSubtle bg-surface/50 ${className}`}>{children}</div>;
}

export default Card;
